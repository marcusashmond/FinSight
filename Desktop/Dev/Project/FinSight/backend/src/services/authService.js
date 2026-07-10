const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const Asset = require('../models/Asset');

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  await transporter.sendMail({
    from: `"FinSight" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your FinSight password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4f46e5">Reset your password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Reset Password</a>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

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

const updateProfile = async (userId, { name }) => {
  const user = await User.findByIdAndUpdate(userId, { name }, { new: true }).select('-passwordHash');
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
};

const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
  }
  user.passwordHash = newPassword;
  await user.save();
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return; // don't reveal whether email exists
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });
  await sendResetEmail(email, token);
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!user) throw Object.assign(new Error('Invalid or expired reset link'), { status: 400 });
  user.passwordHash = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
};

const deleteAccount = async (userId) => {
  await Promise.all([
    Transaction.deleteMany({ user: userId }),
    Budget.deleteMany({ user: userId }),
    Goal.deleteMany({ user: userId }),
    Subscription.deleteMany({ user: userId }),
    Asset.deleteMany({ user: userId }),
  ]);
  await User.findByIdAndDelete(userId);
};

module.exports = { register, login, getMe, updateProfile, updatePassword, forgotPassword, resetPassword, deleteAccount };
