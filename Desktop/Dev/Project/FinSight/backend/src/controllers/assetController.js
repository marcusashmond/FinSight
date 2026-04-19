const Asset = require('../models/Asset');

const getAll = async (req, res, next) => {
  try { res.json(await Asset.find({ userId: req.userId })); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const asset = await Asset.create({ ...req.body, userId: req.userId });
    res.status(201).json(asset);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!asset) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, remove };
