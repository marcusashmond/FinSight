const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

const isDue = (sub, now) => {
  if (!sub.lastCharged) return true;
  const last = new Date(sub.lastCharged);
  if (sub.frequency === 'weekly') return now - last >= 7 * 24 * 60 * 60 * 1000;
  if (sub.frequency === 'monthly') {
    const next = new Date(last);
    next.setMonth(next.getMonth() + 1);
    return now >= next;
  }
  if (sub.frequency === 'yearly') {
    const next = new Date(last);
    next.setFullYear(next.getFullYear() + 1);
    return now >= next;
  }
  return false;
};

const getAll = async (req, res, next) => {
  try {
    res.json(await Subscription.find({ userId: req.userId }).sort({ createdAt: -1 }));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const sub = await Subscription.create({ ...req.body, userId: req.userId });
    res.status(201).json(sub);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!sub) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

const sync = async (req, res, next) => {
  try {
    const now = new Date();
    const subs = await Subscription.find({ userId: req.userId });
    const posted = [];

    for (const sub of subs) {
      if (!isDue(sub, now)) continue;
      await Transaction.create({
        userId: req.userId,
        date: now,
        merchant: sub.merchant,
        category: 'Subscriptions',
        type: 'expense',
        amount: -sub.amount,
      });
      sub.lastCharged = now;
      await sub.save();
      posted.push(sub.merchant);
    }

    res.json({ synced: posted.length, merchants: posted });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, remove, sync };
