const Transaction = require('../models/Transaction');

const create = async (userId, data) => {
  return Transaction.create({ ...data, userId });
};

const getAll = async (userId, { startDate, endDate, category, merchant } = {}) => {
  const query = { userId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (category) query.category = category;
  if (merchant) query.merchant = { $regex: merchant, $options: 'i' };
  return Transaction.find(query).sort({ date: -1 });
};

const getById = async (userId, id) => {
  const tx = await Transaction.findOne({ _id: id, userId });
  if (!tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  return tx;
};

const remove = async (userId, id) => {
  const tx = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
};

module.exports = { create, getAll, getById, remove };
