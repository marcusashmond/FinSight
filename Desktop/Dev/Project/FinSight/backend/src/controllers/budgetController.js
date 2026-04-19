const budgetService = require('../services/budgetService');

const create = async (req, res, next) => {
  try {
    const budget = await budgetService.create(req.userId, req.body);
    res.status(201).json(budget);
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try { res.json(await budgetService.getAll(req.userId)); } catch (err) { next(err); }
};

module.exports = { create, getAll };
