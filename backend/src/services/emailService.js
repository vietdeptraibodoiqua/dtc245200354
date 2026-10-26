const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : null;

  if (!user || !pass || pass === 'app_password_placeholder_2026') {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
};

const getSenderAddress = () => {
  const user = process.env.SMTP_USER || 'noreply.kaedeemc@gmail.com';
  const envFrom = process.env.SMTP_FROM;
  if (!envFrom) {
    return `"Sun Hotel & Resort" <${user}>`;
  }
  if (envFrom.includes('<') && envFrom.includes('>')) {
    return envFrom;
  }
  if (envFrom.includes('@')) {
    return `"Sun Hotel & Resort" <${envFrom.trim()}>`;
  }
  return `"${envFrom.replace(/["']/g, '').trim()}" <${user}>`;
};

const formatVnd = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString('vi-VN');
};

const sendBookingConfirmation = async ({ booking, customer, room, vietQrUrl }) => {
  const transporter = getTransporter();
  const from = getSenderAddress();
  const to = customer.email;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0B192C; padding: 32px 24px; text-align: center; border-bottom: 3px solid #D4AF37; }
        .logo { font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 2px; }
        .sublogo { font-size: 11px; color: #D4AF37; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 32px 24px; }
        .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 6px; letter-spacing: 1px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .table td.label { color: #64748b; width: 40%; }
        .table td.val { font-weight: 600; color: #0f172a; text-align: right; }
        .qr-section { background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1; }
        .qr-img { width: 220px; height: 220px; border-radius: 8px; background: #fff; padding: 6px; }
        .footer { background: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">SUN HOTEL & RESORT</div>
          <div class="sublogo">Xác Nhận Đặt Phòng 5 Sao · Luxury Hospitality</div>
        </div>
        <div class="content">
          <p>Kính gửi Quý khách <strong>${customer.fullName || customer.full_name}</strong>,</p>
          <p>Sun Hotel & Resort xin trân trọng cảm ơn Quý khách đã lựa chọn dịch vụ của chúng tôi. Đơn đặt phòng của Quý khách đã được tiếp nhận với thông tin chi tiết dưới đây:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="badge">MÃ ĐƠN: ${booking.booking_code || booking.bookingCode}</span>
          </div>

          <table class="table">
            <tr>
              <td class="label">Hạng phòng:</td>
              <td class="val">${room.room_type_name || room.typeName || 'Deluxe'}</td>
            </tr>
            <tr>
              <td class="label">Số phòng:</td>
              <td class="val">${room.room_number || room.roomNumber} (Tầng ${room.floor || 1})</td>
            </tr>
            <tr>
              <td class="label">Ngày nhận phòng:</td>
              <td class="val">${formatDate(booking.check_in_date || booking.checkInDate)}</td>
            </tr>
            <tr>
              <td class="label">Ngày trả phòng:</td>
              <td class="val">${formatDate(booking.check_out_date || booking.checkOutDate)}</td>
            </tr>
            <tr>
              <td class="label">Tổng thanh toán:</td>
              <td class="val" style="color: #b45309; font-size: 16px;">${formatVnd(booking.total_price_vnd || booking.totalPriceVnd)}</td>
            </tr>
          </table>

          ${vietQrUrl ? `
            <div class="qr-section">
              <h4 style="margin: 0 0 10px 0; color: #0f172a;">Quét Mã VietQR MB Bank Để Hoàn Tất Thanh Toán</h4>
              <img src="${vietQrUrl}" alt="VietQR MB Bank" class="qr-img" />
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Hệ thống ngân hàng MB Bank sẽ tự động kích hoạt trạng thái xác nhận ngay khi nhận được biến động số dư.</p>
            </div>
          ` : ''}

          <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
            Nếu cần hỗ trợ thêm thông tin, Quý khách vui lòng liên hệ hotline lễ tân 24/7: <strong>0988 776 655</strong> hoặc phản hồi trực tiếp email này.
          </p>
        </div>
        <div class="footer">
          © 2026 Sun Hotel & Resort · NoveraTech Digital Group. Mọi quyền được bảo lưu.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info('SMTP Transporter not configured or using placeholder. Booking email logged instead.', {
      to,
      bookingCode: booking.booking_code || booking.bookingCode,
      totalPrice: booking.total_price_vnd || booking.totalPriceVnd
    });
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `[Sun Hotel & Resort] Xác nhận đặt phòng thành công - ${booking.booking_code || booking.bookingCode}`,
      html
    });
    logger.info('Booking confirmation email sent', { messageId: info.messageId, to });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Failed to send booking confirmation email', { error: err.message, to });
    return { success: false, error: err.message };
  }
};

const sendPaymentReceipt = async ({ booking, transaction }) => {
  const transporter = getTransporter();
  const from = getSenderAddress();
  const to = booking.customer_email || booking.email || (booking.customer && booking.customer.email);

  if (!to) {
    logger.warn('No customer email found for payment receipt', { bookingCode: booking.booking_code });
    return { success: false, reason: 'NO_EMAIL' };
  }

  const customerName = booking.full_name || booking.customer_name || (booking.customer && (booking.customer.full_name || booking.customer.fullName)) || 'Quý khách';
  const roomTypeName = booking.room_type_name || (booking.room && booking.room.room_type_name) || 'Deluxe Room';
  const roomNumber = booking.room_number || (booking.room && booking.room.room_number) || 'Lễ tân sắp xếp';
  const checkIn = formatDate(booking.check_in_date || booking.checkInDate);
  const checkOut = formatDate(booking.check_out_date || booking.checkOutDate);
  const paidAmount = formatVnd(transaction.transfer_amount || transaction.transferAmount || booking.total_price_vnd);
  const gatewayName = transaction.gateway || 'MB Bank (SePay Gateway)';
  const refCode = transaction.reference_code || transaction.referenceCode || `MB-${Date.now()}`;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #064e3b; padding: 28px 24px; text-align: center; border-bottom: 3px solid #10b981; }
        .logo { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 2px; }
        .content { padding: 32px 24px; }
        .success-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .table td { padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .table td.label { color: #64748b; width: 42%; }
        .table td.val { font-weight: 600; color: #0f172a; text-align: right; }
        .footer { background: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">SUN HOTEL & RESORT</div>
          <div style="color: #a7f3d0; font-size: 12px; margin-top: 4px; letter-spacing: 1px;">BIÊN LAI XÁC NHẬN THANH TOÁN THÀNH CÔNG</div>
        </div>
        <div class="content">
          <div class="success-box">
            <h3 style="margin: 0; color: #065f46; font-size: 18px;">Thanh Toán Hoàn Tất</h3>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #047857;">Hệ thống MB Bank đã khớp lệnh giao dịch thành công cho đơn đặt phòng.</p>
          </div>

          <p>Kính gửi Quý khách <strong>${customerName}</strong>,</p>
          <p>Sun Hotel & Resort xin trân trọng thông báo giao dịch thanh toán của Quý khách đã được ghi nhận thành công vào hệ thống. Chi tiết biên lai thanh toán:</p>

          <table class="table">
            <tr>
              <td class="label">Mã đặt phòng:</td>
              <td class="val" style="color: #0f172a; font-family: monospace; font-size: 15px;">${booking.booking_code}</td>
            </tr>
            <tr>
              <td class="label">Hạng phòng & Số phòng:</td>
              <td class="val">${roomTypeName} (${roomNumber})</td>
            </tr>
            <tr>
              <td class="label">Thời gian lưu trú:</td>
              <td class="val">${checkIn} → ${checkOut}</td>
            </tr>
            <tr>
              <td class="label">Số tiền đã thanh toán:</td>
              <td class="val" style="color: #059669; font-size: 16px;">${paidAmount}</td>
            </tr>
            <tr>
              <td class="label">Cổng thanh toán:</td>
              <td class="val">${gatewayName}</td>
            </tr>
            <tr>
              <td class="label">Mã giao dịch ngân hàng:</td>
              <td class="val" style="font-family: monospace;">${refCode}</td>
            </tr>
            <tr>
              <td class="label">Trạng thái đặt phòng:</td>
              <td class="val" style="color: #059669;">ĐÃ THANH TOÁN (CONFIRMED)</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px; margin-top: 20px; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
              <strong>Hướng dẫn nhận phòng:</strong> Quý khách chỉ cần cung cấp mã đặt phòng <strong>${booking.booking_code}</strong> hoặc số điện thoại khi làm thủ tục tại quầy lễ tân.
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 20px;">
            Nếu cần hỗ trợ thêm thông tin hoặc đổi lịch trình, Quý khách vui lòng liên hệ hotline lễ tân 24/7: <strong>0988 776 655</strong>.
          </p>
        </div>
        <div class="footer">
          © 2026 Sun Hotel & Resort · NoveraTech Digital Group. Mọi quyền được bảo lưu.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info('SMTP Transporter not configured. Payment receipt logged instead.', {
      to,
      bookingCode: booking.booking_code,
      amount: transaction.transfer_amount
    });
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `[Biên Lai] Xác nhận thanh toán thành công phòng nghỉ - ${booking.booking_code}`,
      html
    });
    logger.info('Payment receipt email sent successfully', { messageId: info.messageId, to, bookingCode: booking.booking_code });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Failed to send payment receipt email', { error: err.message, to, bookingCode: booking.booking_code });
    return { success: false, error: err.message };
  }
};

const verifyConnection = async () => {
  const transporter = getTransporter();
  if (!transporter) {
    return { connected: false, message: 'SMTP credentials missing or set to placeholder in .env' };
  }
  try {
    await transporter.verify();
    return { connected: true, message: 'SMTP server is ready to send emails' };
  } catch (err) {
    return { connected: false, message: err.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPaymentReceipt,
  verifyConnection
};
