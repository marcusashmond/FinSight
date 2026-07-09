const transactionService = require('../services/transactionService');
const Transaction = require('../models/Transaction');

jest.mock('../models/Transaction');

const userId = 'user123';

describe('transactionService.create', () => {
  it('creates a transaction with userId', async () => {
    const data = { amount: -50, type: 'expense', category: 'Groceries', date: new Date() };
    Transaction.create.mockResolvedValue({ ...data, userId });
    const result = await transactionService.create(userId, data);
    expect(Transaction.create).toHaveBeenCalledWith({ ...data, userId });
    expect(result.userId).toBe(userId);
  });
});

describe('transactionService.getAll', () => {
  it('returns transactions sorted by date', async () => {
    const mockSort = jest.fn().mockResolvedValue([{ amount: -50 }]);
    Transaction.find.mockReturnValue({ sort: mockSort });
    const result = await transactionService.getAll(userId);
    expect(Transaction.find).toHaveBeenCalledWith({ userId });
    expect(mockSort).toHaveBeenCalledWith({ date: -1 });
    expect(result).toHaveLength(1);
  });

  it('applies category filter', async () => {
    const mockSort = jest.fn().mockResolvedValue([]);
    Transaction.find.mockReturnValue({ sort: mockSort });
    await transactionService.getAll(userId, { category: 'Dining' });
    expect(Transaction.find).toHaveBeenCalledWith({ userId, category: 'Dining' });
  });
});

describe('transactionService.remove', () => {
  it('throws 404 if transaction not found', async () => {
    Transaction.findOneAndDelete.mockResolvedValue(null);
    await expect(transactionService.remove(userId, 'badid'))
      .rejects.toMatchObject({ status: 404 });
  });
});
