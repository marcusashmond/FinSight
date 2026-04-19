const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });
  const user = await User.create({ name, email, passwordHash: password });
  return { token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email } };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }
  return { token: signToken(user._id), user: { id: user._id, email: user.email } };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
};

module.exports = { register, login, getMe };
