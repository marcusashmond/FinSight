const router = require('express').Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const { register, login, me, updateProfile, updatePassword } = require('../controllers/authController');

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).required(),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, me);
router.patch('/me', protect, validate(updateProfileSchema), updateProfile);
router.patch('/me/password', protect, validate(updatePasswordSchema), updatePassword);

module.exports = router;
