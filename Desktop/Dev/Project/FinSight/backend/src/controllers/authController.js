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

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.json({ message: 'Password reset successful.' });
  } catch (err) { next(err); }
};

const deleteAccount = async (req, res, next) => {
  try {
    await authService.deleteAccount(req.userId);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};

module.exports = { register, login, me, updateProfile, updatePassword, forgotPassword, resetPassword, deleteAccount };
