const rules = [
  { keywords: ['walmart', 'kroger', 'whole foods', 'trader joe', 'aldi', 'publix', 'safeway'], category: 'Groceries' },
  { keywords: ['uber', 'lyft', 'mta', 'transit', 'gas station', 'shell', 'bp', 'exxon', 'chevron'], category: 'Transport' },
  { keywords: ['netflix', 'hulu', 'disney', 'spotify', 'apple music', 'amazon prime'], category: 'Subscriptions' },
  { keywords: ['mcdonald', 'starbucks', 'chipotle', 'doordash', 'grubhub', 'ubereats', 'chick-fil-a', 'subway'], category: 'Dining' },
  { keywords: ['amazon', 'ebay', 'target', 'best buy', 'apple store'], category: 'Shopping' },
  { keywords: ['electric', 'water', 'internet', 'att', 'verizon', 't-mobile', 'xfinity'], category: 'Utilities' },
  { keywords: ['cvs', 'walgreens', 'doctor', 'hospital', 'pharmacy', 'dental', 'vision'], category: 'Health' },
  { keywords: ['rent', 'mortgage', 'hoa'], category: 'Housing' },
  { keywords: ['salary', 'payroll', 'direct deposit', 'paycheck'], category: 'Income' },
];

const categorize = (merchant = '') => {
  const lower = merchant.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category;
  }
  return 'Other';
};

module.exports = categorize;
