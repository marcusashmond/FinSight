const Goal = require('../models/Goal');

const getAll = async (req, res, next) => {
  try { res.json(await Goal.find({ userId: req.userId }).sort({ targetDate: 1 })); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.userId });
    res.status(201).json(goal);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Not found' });
    res.json(goal);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
