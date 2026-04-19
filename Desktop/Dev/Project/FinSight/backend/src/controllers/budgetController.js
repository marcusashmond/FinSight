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

const remove = async (req, res, next) => {
  try {
    await budgetService.remove(req.userId, req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (err) { next(err); }
};

module.exports = { create, getAll, remove };
