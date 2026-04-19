const Budget = require('../models/Budget');

const create = async (userId, data) => {
  return Budget.findOneAndUpdate(
    { userId, category: data.category },
    { ...data, userId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const getAll = async (userId) => Budget.find({ userId });

module.exports = { create, getAll };
