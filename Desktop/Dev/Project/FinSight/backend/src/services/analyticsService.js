const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const userId = (id) => new mongoose.Types.ObjectId(id);

const summary = async (uid) => {
  const result = await Transaction.aggregate([
    { $match: { userId: userId(uid) } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  const map = { income: 0, expense: 0 };
  result.forEach((r) => { map[r._id] = r.total; });
  return { income: map.income, expenses: Math.abs(map.expense), net: map.income + map.expense };
};

const categories = async (uid) => {
  return Transaction.aggregate([
    { $match: { userId: userId(uid) } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: 1 } },
  ]);
};

const trends = async (uid) => {
  return Transaction.aggregate([
    { $match: { userId: userId(uid) } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

module.exports = { summary, categories, trends };
