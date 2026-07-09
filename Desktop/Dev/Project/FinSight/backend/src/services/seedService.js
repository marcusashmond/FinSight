const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const Asset = require('../models/Asset');

const MERCHANTS = {
  Groceries: ['Walmart', 'Whole Foods', 'Trader Joe\'s', 'Kroger', 'Aldi'],
  Transport: ['Uber', 'Lyft', 'Shell Gas', 'BP Gas', 'Metro Transit'],
  Dining: ['McDonald\'s', 'Chipotle', 'Starbucks', 'Chick-fil-A', 'Olive Garden'],
  Shopping: ['Amazon', 'Target', 'Best Buy', 'H&M', 'Nike'],
  Utilities: ['AT&T', 'Verizon', 'Con Edison', 'National Grid', 'Comcast'],
  Health: ['CVS Pharmacy', 'Walgreens', 'Planet Fitness', 'Kaiser Permanente'],
  Housing: ['Rent Payment', 'Home Depot', 'IKEA'],
  Subscriptions: ['Netflix', 'Spotify', 'Hulu', 'Adobe', 'Apple One'],
};

const EXPENSE_RANGES = {
  Groceries:     [40, 120],
  Transport:     [12, 60],
  Dining:        [8, 55],
  Shopping:      [20, 150],
  Utilities:     [60, 180],
  Health:        [15, 120],
  Housing:       [800, 1600],
  Subscriptions: [8, 25],
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async (userId) => {
  await Promise.all([
    Transaction.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
    Subscription.deleteMany({ userId }),
    Asset.deleteMany({ userId }),
  ]);

  const transactions = [];
  const now = new Date();

  // 6 months of transactions
  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

    // Salary income — 1st of each month
    transactions.push({
      userId,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
      merchant: 'Direct Deposit',
      category: 'Other',
      type: 'income',
      amount: parseFloat(rand(3800, 4800).toFixed(2)),
    });

    // Freelance income — mid month some months
    if (Math.random() > 0.4) {
      transactions.push({
        userId,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
        merchant: 'Freelance Payment',
        category: 'Other',
        type: 'income',
        amount: parseFloat(rand(300, 900).toFixed(2)),
      });
    }

    // Housing — start of month
    transactions.push({
      userId,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 2),
      merchant: 'Rent Payment',
      category: 'Housing',
      type: 'expense',
      amount: -parseFloat(rand(1100, 1600).toFixed(2)),
    });

    // Subscriptions — fixed monthly
    ['Netflix', 'Spotify', 'Adobe'].forEach((merchant, i) => {
      transactions.push({
        userId,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5 + i),
        merchant,
        category: 'Subscriptions',
        type: 'expense',
        amount: -parseFloat(rand(8, 25).toFixed(2)),
      });
    });

    // Utilities
    ['AT&T', 'Con Edison'].forEach((merchant, i) => {
      transactions.push({
        userId,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10 + i),
        merchant,
        category: 'Utilities',
        type: 'expense',
        amount: -parseFloat(rand(60, 180).toFixed(2)),
      });
    });

    // Random daily expenses (12–18 per month)
    const expenseCategories = ['Groceries', 'Transport', 'Dining', 'Shopping', 'Health'];
    const count = Math.floor(rand(12, 18));
    for (let i = 0; i < count; i++) {
      const category = pick(expenseCategories);
      const [min, max] = EXPENSE_RANGES[category];
      const day = Math.floor(rand(1, 28));
      transactions.push({
        userId,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
        merchant: pick(MERCHANTS[category]),
        category,
        type: 'expense',
        amount: -parseFloat(rand(min, max).toFixed(2)),
      });
    }
  }

  await Transaction.insertMany(transactions);

  await Budget.insertMany([
    { userId, category: 'Groceries',     limit: 400,  period: 'monthly' },
    { userId, category: 'Dining',        limit: 250,  period: 'monthly' },
    { userId, category: 'Transport',     limit: 200,  period: 'monthly' },
    { userId, category: 'Shopping',      limit: 300,  period: 'monthly' },
    { userId, category: 'Subscriptions', limit: 80,   period: 'monthly' },
    { userId, category: 'Health',        limit: 150,  period: 'monthly' },
  ]);

  const sixMonthsOut = new Date(now.getFullYear(), now.getMonth() + 6, 1);
  const oneYearOut   = new Date(now.getFullYear() + 1, now.getMonth(), 1);
  const twoYearsOut  = new Date(now.getFullYear() + 2, now.getMonth(), 1);

  await Goal.insertMany([
    { userId, name: 'Emergency Fund',  targetAmount: 10000, savedAmount: 3200, targetDate: oneYearOut },
    { userId, name: 'Vacation to Japan', targetAmount: 4000, savedAmount: 950,  targetDate: sixMonthsOut },
    { userId, name: 'New Laptop',      targetAmount: 2000,  savedAmount: 750,  targetDate: sixMonthsOut },
    { userId, name: 'Down Payment',    targetAmount: 50000, savedAmount: 8000, targetDate: twoYearsOut },
  ]);

  await Subscription.insertMany([
    { userId, merchant: 'Netflix',  amount: 15.99, frequency: 'monthly', lastCharged: new Date(now.getFullYear(), now.getMonth(), 5) },
    { userId, merchant: 'Spotify',  amount: 9.99,  frequency: 'monthly', lastCharged: new Date(now.getFullYear(), now.getMonth(), 6) },
    { userId, merchant: 'Adobe CC', amount: 54.99, frequency: 'monthly', lastCharged: new Date(now.getFullYear(), now.getMonth(), 7) },
    { userId, merchant: 'Hulu',     amount: 17.99, frequency: 'monthly', lastCharged: new Date(now.getFullYear(), now.getMonth(), 8) },
    { userId, merchant: 'iCloud+',  amount: 2.99,  frequency: 'monthly', lastCharged: new Date(now.getFullYear(), now.getMonth(), 1) },
  ]);

  await Asset.insertMany([
    { userId, name: 'Checking Account',  type: 'asset',     category: 'Cash',        value: 4200 },
    { userId, name: 'Savings Account',   type: 'asset',     category: 'Cash',        value: 11350 },
    { userId, name: '401(k)',            type: 'asset',     category: 'Investment',  value: 28000 },
    { userId, name: 'Car',              type: 'asset',     category: 'Property',    value: 14000 },
    { userId, name: 'Student Loans',    type: 'liability', category: 'Loans',       value: 22000 },
    { userId, name: 'Car Loan',         type: 'liability', category: 'Loans',       value: 8500 },
    { userId, name: 'Credit Card',      type: 'liability', category: 'Credit Card', value: 1200 },
  ]);
};

module.exports = { seed };
