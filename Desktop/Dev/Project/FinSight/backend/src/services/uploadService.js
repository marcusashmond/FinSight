const csv = require('csv-parser');
const { Readable } = require('stream');
const Transaction = require('../models/Transaction');
const categorize = require('../utils/categorize');

const parseCSV = (buffer) =>
  new Promise((resolve, reject) => {
    const results = [];
    Readable.from(buffer)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

const normalize = (row, userId) => {
  const amount = parseFloat(row.amount || row.Amount || 0);
  const merchant = row.merchant || row.Merchant || row.description || row.Description || '';
  const date = new Date(row.date || row.Date || Date.now());
  const type = amount >= 0 ? 'income' : 'expense';
  const category = row.category || row.Category || categorize(merchant);
  return { userId, amount, merchant, date, type, category, tags: [] };
};

const processUpload = async (userId, fileBuffer) => {
  const rows = await parseCSV(fileBuffer);
  const transactions = rows.map((r) => normalize(r, userId));
  return Transaction.insertMany(transactions);
};

module.exports = { processUpload };
