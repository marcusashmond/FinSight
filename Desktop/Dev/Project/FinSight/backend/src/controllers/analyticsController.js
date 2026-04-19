const analyticsService = require('../services/analyticsService');

const summary = async (req, res, next) => {
  try { res.json(await analyticsService.summary(req.userId)); } catch (err) { next(err); }
};

const categories = async (req, res, next) => {
  try { res.json(await analyticsService.categories(req.userId)); } catch (err) { next(err); }
};

const trends = async (req, res, next) => {
  try { res.json(await analyticsService.trends(req.userId)); } catch (err) { next(err); }
};

const insights = async (req, res, next) => {
  try { res.json(await analyticsService.insights(req.userId)); } catch (err) { next(err); }
};

module.exports = { summary, categories, trends, insights };
