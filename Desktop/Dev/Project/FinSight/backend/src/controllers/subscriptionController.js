const Subscription = require('../models/Subscription');

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

module.exports = { getAll, create, remove };
