const authService = require('../services/authService');
const User = require('../models/User');

jest.mock('../models/User');

process.env.JWT_SECRET = 'test_secret';

describe('authService.register', () => {
  it('throws if email already in use', async () => {
    User.findOne.mockResolvedValue({ email: 'taken@test.com' });
    await expect(authService.register({ name: 'Test', email: 'taken@test.com', password: 'pass123' }))
      .rejects.toMatchObject({ message: 'Email already in use', status: 409 });
  });

  it('returns token and user on success', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'abc123', name: 'Marcus', email: 'marcus@test.com' });
    const result = await authService.register({ name: 'Marcus', email: 'marcus@test.com', password: 'pass123' });
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('marcus@test.com');
  });
});

describe('authService.login', () => {
  it('throws on invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(authService.login({ email: 'x@x.com', password: 'wrong' }))
      .rejects.toMatchObject({ status: 401 });
  });

  it('throws when password does not match', async () => {
    User.findOne.mockResolvedValue({ comparePassword: jest.fn().mockResolvedValue(false) });
    await expect(authService.login({ email: 'x@x.com', password: 'wrong' }))
      .rejects.toMatchObject({ status: 401 });
  });

  it('returns token on valid login', async () => {
    User.findOne.mockResolvedValue({
      _id: 'abc123',
      email: 'marcus@test.com',
      comparePassword: jest.fn().mockResolvedValue(true),
    });
    const result = await authService.login({ email: 'marcus@test.com', password: 'pass123' });
    expect(result).toHaveProperty('token');
  });
});

describe('authService.getMe', () => {
  it('throws if user not found', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await expect(authService.getMe('badid')).rejects.toMatchObject({ status: 404 });
  });

  it('returns user without passwordHash', async () => {
    const user = { _id: 'abc', name: 'Marcus', email: 'marcus@test.com' };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const result = await authService.getMe('abc');
    expect(result.email).toBe('marcus@test.com');
  });
});
