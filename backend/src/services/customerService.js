const db = require('../config/db');

const findOrCreateCustomer = async (client, customerData) => {
  const { fullName, idCard, phone, email, address } = customerData;

  const existingRes = await client.query(
    'SELECT * FROM customers WHERE phone = $1 OR id_card = $2 LIMIT 1',
    [phone, idCard]
  );

  if (existingRes.rows.length > 0) {
    const existing = existingRes.rows[0];
    const updateRes = await client.query(
      `UPDATE customers
       SET full_name = $1, email = $2, address = COALESCE($3, address)
       WHERE id = $4
       RETURNING *`,
      [fullName, email, address, existing.id]
    );
    return updateRes.rows[0];
  }

  const insertRes = await client.query(
    `INSERT INTO customers (full_name, id_card, phone, email, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [fullName, idCard, phone, email, address]
  );

  return insertRes.rows[0];
};

const getCustomers = async () => {
  const result = await db.query(
    `SELECT c.*, COUNT(b.id) AS total_bookings, COALESCE(SUM(b.total_price_vnd), 0) AS total_spent_vnd
     FROM customers c
     LEFT JOIN bookings b ON c.id = b.customer_id
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
};

module.exports = {
  findOrCreateCustomer,
  getCustomers
};
