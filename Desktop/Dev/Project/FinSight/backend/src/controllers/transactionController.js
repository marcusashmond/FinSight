const txService = require('../services/transactionService');

const create = async (req, res, next) => {
  try {
    const tx = await txService.create(req.userId, req.body);
    res.status(201).json(tx);
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const txs = await txService.getAll(req.userId, req.query);
    res.json(txs);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const tx = await txService.getById(req.userId, req.params.id);
    res.json(tx);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await txService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, remove };
