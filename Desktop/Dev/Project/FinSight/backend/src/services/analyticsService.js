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

const insights = async (uid) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth, lastMonth] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: userId(uid), type: 'expense', date: { $gte: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: userId(uid), type: 'expense', date: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);

  const lastMap = {};
  lastMonth.forEach((r) => { lastMap[r._id] = Math.abs(r.total); });

  return thisMonth
    .map((r) => {
      const current = Math.abs(r.total);
      const previous = lastMap[r._id] || 0;
      const change = previous > 0 ? ((current - previous) / previous) * 100 : null;
      return { category: r._id, current, previous, change };
    })
    .filter((r) => r.change !== null && Math.abs(r.change) >= 10)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 4);
};

module.exports = { summary, categories, trends, insights };
