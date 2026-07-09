const budgetService = require('../services/budgetService');
const Budget = require('../models/Budget');

jest.mock('../models/Budget');

const userId = 'user123';

describe('budgetService.create', () => {
  it('upserts budget by category', async () => {
    const data = { category: 'Groceries', limit: 300, period: 'monthly' };
    Budget.findOneAndUpdate.mockResolvedValue({ ...data, userId });
    const result = await budgetService.create(userId, data);
    expect(Budget.findOneAndUpdate).toHaveBeenCalledWith(
      { userId, category: data.category },
      { ...data, userId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    expect(result.category).toBe('Groceries');
  });
});

describe('budgetService.getAll', () => {
  it('returns all budgets for user', async () => {
    Budget.find.mockResolvedValue([{ category: 'Groceries' }, { category: 'Dining' }]);
    const result = await budgetService.getAll(userId);
    expect(Budget.find).toHaveBeenCalledWith({ userId });
    expect(result).toHaveLength(2);
  });
});

describe('budgetService.remove', () => {
  it('throws 404 if budget not found', async () => {
    Budget.findOneAndDelete.mockResolvedValue(null);
    await expect(budgetService.remove(userId, 'badid'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('deletes budget successfully', async () => {
    Budget.findOneAndDelete.mockResolvedValue({ _id: 'bid', category: 'Groceries' });
    await expect(budgetService.remove(userId, 'bid')).resolves.not.toThrow();
  });
});
