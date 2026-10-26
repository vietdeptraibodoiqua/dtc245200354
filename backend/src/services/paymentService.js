const db = require('../config/db');
const logger = require('../config/logger');
const emailService = require('./emailService');
const { SePayPgClient } = require('sepay-pg-node');

const getSepayPgClient = () => {
  const env = process.env.SEPAY_ENV || 'sandbox';
  const merchantId = process.env.SEPAY_MERCHANT_ID || 'SP-MERCHANT-HOTEL-2026';
  const secretKey = process.env.SEPAY_SECRET_KEY || 'spsk_live_super_secret_key_sun_hotel_2026';

  return new SePayPgClient({
    env,
    merchant_id: merchantId,
    secret_key: secretKey
  });
};

const generateVietQrUrl = (bookingCode, amount) => {
  const bin = process.env.MB_BANK_BIN || '970422';
  const accountNumber = process.env.MB_BANK_ACCOUNT_NUMBER || '0987654321';
  const accountName = process.env.MB_BANK_ACCOUNT_NAME || 'SUN HOTEL RESORT';
  const memo = bookingCode ? bookingCode.replace(/[^a-zA-Z0-9]/g, '') : 'SUNHOTEL';

  return `https://img.vietqr.io/image/${bin}-${accountNumber}-compact2.png?amount=${Math.round(amount || 0)}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;
};

const extractBookingCode = (code, content) => {
  if (code && typeof code === 'string' && code.trim().length > 0) {
    return code.trim().toUpperCase();
  }
  if (!content || typeof content !== 'string') {
    return null;
  }
  const cleanContent = content.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const matchNoHyphen = cleanContent.match(/NVH[0-9]{6}[A-F0-9]{6}/i) || cleanContent.match(/NVH[A-Z0-9]{6,16}/i);
  if (matchNoHyphen) {
    return matchNoHyphen[0].toUpperCase();
  }
  const matchHyphen = content.match(/NVH-[0-9]{4,8}-[A-F0-9]{3,8}/i) || content.match(/NVH-[0-9]{4}-[0-9]{3}/i);
  return matchHyphen ? matchHyphen[0].toUpperCase() : null;
};

const createPaymentCheckout = async ({ bookingCode, amount, paymentMethod = 'BANK_TRANSFER', customerId }) => {
  const client = getSepayPgClient();
  const domain = process.env.FRONTEND_URL || 'http://localhost:3001';

  const validMethod = ['BANK_TRANSFER', 'NAPAS_BANK_TRANSFER', 'CARD'].includes(paymentMethod) 
    ? paymentMethod 
    : 'BANK_TRANSFER';

  const cleanCode = bookingCode ? bookingCode.replace(/[^a-zA-Z0-9]/g, '') : 'SUNHOTEL';
  const checkoutUrl = client.checkout.initCheckoutUrl();
  const formFields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: validMethod,
    order_invoice_number: bookingCode,
    order_amount: Math.round(Number(amount) || 0),
    currency: 'VND',
    order_description: `Thanh toan don phong ${cleanCode}`,
    customer_id: customerId ? String(customerId) : 'GUEST',
    success_url: `${domain}/?payment=success&code=${bookingCode}`,
    error_url: `${domain}/?payment=error&code=${bookingCode}`,
    cancel_url: `${domain}/?payment=cancelled&code=${bookingCode}`
  });

  return {
    checkoutUrl,
    formFields,
    paymentMethod: validMethod,
    bookingCode,
    amount: Math.round(Number(amount) || 0)
  };
};

const processSepayIpn = async (payload) => {
  const notificationType = payload.notification_type;
  const order = payload.order || {};
  const transaction = payload.transaction || {};

  const orderInvoiceNumber = order.order_invoice_number || payload.order_invoice_number;
  const orderStatus = order.order_status || payload.order_status;
  const rawTxId = transaction.transaction_id || transaction.id || order.order_id || Date.now();
  const transactionId = typeof rawTxId === 'string' ? parseInt(rawTxId.replace(/\D/g, '').slice(-12), 10) || Date.now() : Number(rawTxId);
  const amount = Number(order.order_amount || transaction.transaction_amount || payload.order_amount || 0);
  const paymentMethod = transaction.payment_method || payload.payment_method || 'GATEWAY';

  const isPaid = notificationType === 'ORDER_PAID' || orderStatus === 'CAPTURED';

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const existingTx = await client.query(
      'SELECT id FROM payment_transactions WHERE transaction_id = $1',
      [transactionId]
    );

    if (existingTx.rows.length > 0) {
      await client.query('ROLLBACK');
      logger.info('Duplicate SePay IPN received, skipping', { transactionId, orderInvoiceNumber });
      return { success: true, duplicate: true, transactionId };
    }

    let matchedBooking = null;
    if (orderInvoiceNumber) {
      const bookingRes = await client.query(
        `SELECT b.*, c.full_name, c.email, c.phone
         FROM bookings b
         JOIN customers c ON b.customer_id = c.id
         WHERE REPLACE(b.booking_code, '-', '') = REPLACE($1, '-', '')
         FOR UPDATE`,
        [orderInvoiceNumber.trim()]
      );
      if (bookingRes.rows.length > 0) {
        matchedBooking = bookingRes.rows[0];
      }
    }

    await client.query(
      `INSERT INTO payment_transactions
       (transaction_id, booking_id, booking_code, gateway, account_number, transfer_amount, transfer_type, content, reference_code, transaction_date, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        transactionId,
        matchedBooking ? matchedBooking.id : null,
        orderInvoiceNumber,
        `SePay-${paymentMethod}`,
        order.order_id || 'SEPAY_PG',
        amount,
        'in',
        order.order_description || `SePay IPN ${notificationType}`,
        transaction.transaction_id || String(transactionId),
        new Date(),
        JSON.stringify(payload)
      ]
    );

    if (matchedBooking && isPaid) {
      await client.query(
        `UPDATE bookings
         SET status = 'CONFIRMED'
         WHERE id = $1`,
        [matchedBooking.id]
      );
    }

    await client.query('COMMIT');

    logger.info('SePay IPN processed successfully', {
      transactionId,
      orderInvoiceNumber,
      amount,
      paymentMethod,
      isPaid
    });

    if (matchedBooking && isPaid) {
      let roomInfo = {};
      try {
        const roomRes = await db.query(
          `SELECT r.room_number, r.floor, rt.name AS room_type_name
           FROM booking_rooms br
           JOIN rooms r ON br.room_id = r.id
           JOIN room_types rt ON r.room_type_id = rt.id
           WHERE br.booking_id = $1
           LIMIT 1`,
          [matchedBooking.id]
        );
        if (roomRes.rows.length > 0) {
          roomInfo = roomRes.rows[0];
        }
      } catch (err) {
        logger.warn('Failed to query room details for receipt email', { error: err.message });
      }

      emailService.sendPaymentReceipt({
        booking: {
          ...matchedBooking,
          customer_email: matchedBooking.email,
          room_number: roomInfo.room_number,
          floor: roomInfo.floor,
          room_type_name: roomInfo.room_type_name
        },
        transaction: {
          transfer_amount: amount,
          reference_code: transaction.transaction_id || `SP-${transactionId}`,
          gateway: `Cổng SePay (${paymentMethod})`
        }
      }).catch((err) => {
        logger.error('Failed to send payment receipt email after IPN', { error: err.message });
      });
    }

    return {
      success: true,
      processed: true,
      orderInvoiceNumber,
      matched: !!matchedBooking
    };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Error processing SePay IPN', { error: err.message, payload });
    throw err;
  } finally {
    client.release();
  }
};

const processSepayWebhook = async (payload) => {
  if (payload.notification_type || payload.order) {
    return await processSepayIpn(payload);
  }

  const {
    id,
    gateway = 'MBBank',
    transactionDate,
    accountNumber,
    code,
    content,
    transferType = 'in',
    transferAmount,
    referenceCode
  } = payload;

  const transactionId = Number(id) || Date.now();
  const amount = Number(transferAmount) || 0;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const existingTx = await client.query(
      'SELECT id FROM payment_transactions WHERE transaction_id = $1',
      [transactionId]
    );

    if (existingTx.rows.length > 0) {
      await client.query('ROLLBACK');
      logger.info('Duplicate SePay transaction received, ignoring', { transactionId });
      return { success: true, duplicate: true, transactionId };
    }

    const bookingCode = extractBookingCode(code, content);
    let matchedBooking = null;

    if (bookingCode) {
      const bookingRes = await client.query(
        `SELECT b.*, c.full_name, c.email, c.phone
         FROM bookings b
         JOIN customers c ON b.customer_id = c.id
         WHERE REPLACE(b.booking_code, '-', '') = REPLACE($1, '-', '')
         FOR UPDATE`,
        [bookingCode]
      );
      if (bookingRes.rows.length > 0) {
        matchedBooking = bookingRes.rows[0];
      }
    }

    const txDate = transactionDate ? new Date(transactionDate) : new Date();

    await client.query(
      `INSERT INTO payment_transactions
       (transaction_id, booking_id, booking_code, gateway, account_number, transfer_amount, transfer_type, content, reference_code, transaction_date, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        transactionId,
        matchedBooking ? matchedBooking.id : null,
        bookingCode,
        gateway,
        accountNumber,
        amount,
        transferType,
        content,
        referenceCode,
        txDate,
        JSON.stringify(payload)
      ]
    );

    if (matchedBooking && transferType === 'in') {
      await client.query(
        `UPDATE bookings
         SET status = 'CONFIRMED'
         WHERE id = $1`,
        [matchedBooking.id]
      );
    }

    await client.query('COMMIT');

    logger.info('SePay payment processed successfully', {
      transactionId,
      bookingCode,
      amount,
      matched: !!matchedBooking
    });

    if (matchedBooking && transferType === 'in') {
      let roomInfo = {};
      try {
        const roomRes = await db.query(
          `SELECT r.room_number, r.floor, rt.name AS room_type_name
           FROM booking_rooms br
           JOIN rooms r ON br.room_id = r.id
           JOIN room_types rt ON r.room_type_id = rt.id
           WHERE br.booking_id = $1
           LIMIT 1`,
          [matchedBooking.id]
        );
        if (roomRes.rows.length > 0) {
          roomInfo = roomRes.rows[0];
        }
      } catch (err) {
        logger.warn('Failed to query room details for receipt email', { error: err.message });
      }

      emailService.sendPaymentReceipt({
        booking: {
          ...matchedBooking,
          customer_email: matchedBooking.email,
          room_number: roomInfo.room_number,
          floor: roomInfo.floor,
          room_type_name: roomInfo.room_type_name
        },
        transaction: {
          transfer_amount: amount,
          reference_code: referenceCode,
          gateway
        }
      }).catch((err) => {
        logger.error('Background email dispatch failed', { error: err.message });
      });
    }

    return {
      success: true,
      processed: true,
      bookingCode,
      matched: !!matchedBooking
    };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Error processing SePay webhook', { error: err.message, payload });
    throw err;
  } finally {
    client.release();
  }
};

const checkPaymentStatus = async (bookingCode) => {
  if (!bookingCode) {
    return { paid: false, message: 'Missing booking code' };
  }

  const result = await db.query(
    `SELECT b.id, b.booking_code, b.status, b.total_price_vnd,
            pt.transaction_id, pt.transfer_amount, pt.reference_code, pt.transaction_date, pt.gateway
     FROM bookings b
     LEFT JOIN payment_transactions pt ON REPLACE(pt.booking_code, '-', '') = REPLACE(b.booking_code, '-', '')
     WHERE REPLACE(b.booking_code, '-', '') = REPLACE($1, '-', '')
     ORDER BY pt.created_at DESC
     LIMIT 1`,
    [bookingCode.trim()]
  );

  if (result.rows.length === 0) {
    return { paid: false, found: false };
  }

  const row = result.rows[0];
  const isPaid = row.status === 'CONFIRMED' || row.status === 'CHECKED_IN';

  return {
    found: true,
    paid: isPaid,
    status: row.status,
    bookingCode: row.booking_code,
    totalPriceVnd: row.total_price_vnd,
    transaction: row.transaction_id ? {
      transactionId: row.transaction_id,
      amount: row.transfer_amount,
      referenceCode: row.reference_code,
      transactionDate: row.transaction_date,
      gateway: row.gateway
    } : null
  };
};

const simulateMbBankTransfer = async (bookingCode, customAmount) => {
  const result = await db.query(
    'SELECT * FROM bookings WHERE booking_code = $1',
    [bookingCode]
  );

  if (result.rows.length === 0) {
    throw new Error('Booking code not found in system: ' + bookingCode);
  }

  const booking = result.rows[0];
  const amount = customAmount || Number(booking.total_price_vnd);
  const txId = Math.floor(100000 + Math.random() * 900000);

  const payload = {
    id: txId,
    gateway: 'MBBank',
    transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    accountNumber: process.env.MB_BANK_ACCOUNT_NUMBER || '0987654321',
    code: bookingCode,
    content: `SUNHOTEL ${bookingCode} thanh toan phong nghi`,
    transferType: 'in',
    transferAmount: amount,
    referenceCode: `MB${Date.now().toString().slice(-8)}`
  };

  return await processSepayWebhook(payload);
};

const simulateSepayGatewayPayment = async (bookingCode, paymentMethod = 'CARD') => {
  const result = await db.query(
    'SELECT * FROM bookings WHERE booking_code = $1',
    [bookingCode]
  );

  if (result.rows.length === 0) {
    throw new Error('Booking code not found in system: ' + bookingCode);
  }

  const booking = result.rows[0];
  const txId = `SPTX${Date.now().toString().slice(-8)}`;

  const ipnPayload = {
    timestamp: Math.floor(Date.now() / 1000),
    notification_type: 'ORDER_PAID',
    order: {
      id: `ord_${Date.now()}`,
      order_id: `SEPAY-${Date.now().toString(36).toUpperCase()}`,
      order_status: 'CAPTURED',
      order_currency: 'VND',
      order_amount: String(booking.total_price_vnd),
      order_invoice_number: bookingCode,
      order_description: `Thanh toan qua Cong SePay (${paymentMethod})`
    },
    transaction: {
      id: txId,
      payment_method: paymentMethod,
      transaction_id: txId,
      transaction_type: 'PAYMENT'
    }
  };

  return await processSepayIpn(ipnPayload);
};

module.exports = {
  generateVietQrUrl,
  createPaymentCheckout,
  processSepayIpn,
  processSepayWebhook,
  checkPaymentStatus,
  simulateMbBankTransfer,
  simulateSepayGatewayPayment
};
