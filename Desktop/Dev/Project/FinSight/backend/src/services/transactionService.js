const Transaction = require('../models/Transaction');

const create = async (userId, data) => {
  return Transaction.create({ ...data, userId });
};

const getAll = async (userId, { startDate, endDate, category, merchant, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 20 } = {}) => {
  const query = { userId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (category) query.category = category;
  if (merchant) query.merchant = { $regex: merchant, $options: 'i' };

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
    Transaction.countDocuments(query),
  ]);
  return { transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
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

const update = async (userId, id, data) => {
  const tx = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    data,
    { new: true, runValidators: true }
  );
  if (!tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  return tx;
};

module.exports = { create, getAll, getById, update, remove };
