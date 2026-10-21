const customerService = require('../services/customerService');

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomers();
    res.json({
      success: true,
      data: customers
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers
};
