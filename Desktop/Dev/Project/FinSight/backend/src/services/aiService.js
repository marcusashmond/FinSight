const Anthropic = require('@anthropic-ai/sdk');
const analyticsService = require('./analyticsService');
const budgetService = require('./budgetService');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const getInsights = async (userId) => {
  const [summary, categories, insights, budgets] = await Promise.all([
    analyticsService.summary(userId),
    analyticsService.categories(userId),
    analyticsService.insights(userId),
    budgetService.getAll(userId),
  ]);

  const topCategories = categories
    .slice(0, 6)
    .map((c) => `  - ${c._id}: $${Math.abs(c.total).toFixed(2)}`)
    .join('\n');

  const budgetStatus = budgets
    .map((b) => {
      const cat = categories.find((c) => c._id === b.category);
      const spent = cat ? Math.abs(cat.total) : 0;
      const pct = ((spent / b.limit) * 100).toFixed(0);
      return `  - ${b.category}: $${spent.toFixed(2)} of $${b.limit} limit (${pct}%)`;
    })
    .join('\n');

  const momChanges = insights
    .map((i) => `  - ${i.category}: ${i.change > 0 ? '+' : ''}${i.change.toFixed(0)}% vs last month`)
    .join('\n');

  const prompt = `You are a personal finance advisor. Analyze this user's financial data and provide 4 concise, actionable insights.

FINANCIAL SUMMARY:
- Monthly Income: $${summary.income.toFixed(2)}
- Monthly Expenses: $${summary.expenses.toFixed(2)}
- Net Balance: $${summary.net.toFixed(2)}
- Savings Rate: ${summary.income > 0 ? ((summary.net / summary.income) * 100).toFixed(1) : 0}%

TOP SPENDING CATEGORIES:
${topCategories || '  No data'}

BUDGET STATUS:
${budgetStatus || '  No budgets set'}

MONTH-OVER-MONTH CHANGES:
${momChanges || '  No significant changes'}

Respond with exactly 4 insights. Each insight must:
- Start with a relevant emoji
- Have a bold title (using **title**)
- Include one specific number or percentage from the data
- End with one concrete action the user can take

Keep each insight to 2–3 sentences max. Be direct and specific, not generic.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  return { insights: message.content[0].text };
};

module.exports = { getInsights };
