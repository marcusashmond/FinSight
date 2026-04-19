const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId);
    res.json(user);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.userId, req.body);
    res.json(user);
  } catch (err) { next(err); }
};

const updatePassword = async (req, res, next) => {
  try {
    await authService.updatePassword(req.userId, req.body);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

module.exports = { register, login, me, updateProfile, updatePassword };
