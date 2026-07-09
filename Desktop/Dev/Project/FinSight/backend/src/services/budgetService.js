const Budget = require('../models/Budget');

const create = async (userId, data) => {
  return Budget.findOneAndUpdate(
    { userId, category: data.category },
    { ...data, userId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const getAll = async (userId) => Budget.find({ userId });

const remove = async (userId, id) => {
  const budget = await Budget.findOneAndDelete({ _id: id, userId });
  if (!budget) throw Object.assign(new Error('Budget not found'), { status: 404 });
};

module.exports = { create, getAll, remove };
