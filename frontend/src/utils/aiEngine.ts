import type { Income, Expense, DashboardStats, AIInsight } from '../types'
import { filterByMonth, getCategoryBreakdown, getBudgetHealthScore, getFinancialHealthScore } from './analytics'
import { formatCurrency } from './format'

type QueryContext = {
  incomes: Income[]
  expenses: Expense[]
  stats: DashboardStats
  symbol: string
}

function matchQuery(query: string, patterns: string[]): boolean {
  const q = query.toLowerCase()
  return patterns.some((p) => q.includes(p))
}

export function processAIQuery(query: string, ctx: QueryContext): string {
  const { expenses, stats, symbol } = ctx
  const currentExpenses = filterByMonth(expenses)
  const breakdown = getCategoryBreakdown(currentExpenses)

  if (matchQuery(query, ['most', 'highest', 'top spend', 'where did i spend'])) {
    if (breakdown.length === 0) return 'No expenses recorded this month yet.'
    const top = breakdown[0]
    return `Your highest spending category this month is **${top.category}** at ${formatCurrency(top.amount, symbol)} (${top.percentage}% of total expenses).`
  }

  if (matchQuery(query, ['food', 'groceries', 'rent', 'fuel', 'transport', 'subscription', 'emi', 'entertainment'])) {
    const categories = ['food', 'groceries', 'rent', 'fuel', 'transport', 'subscription', 'emi', 'entertainment', 'shopping', 'health']
    const matched = categories.find((c) => query.toLowerCase().includes(c))
    if (matched) {
      const catName = matched.charAt(0).toUpperCase() + matched.slice(1)
      const found = breakdown.find((b) => b.category.toLowerCase().includes(matched))
      if (!found) return `No spending found in ${catName} category this month.`
      return `You spent ${formatCurrency(found.amount, symbol)} on ${found.category} this month across ${found.count} transaction(s) — that's ${found.percentage}% of your total expenses.`
    }
  }

  if (matchQuery(query, ['compare', 'last month', 'previous month', 'vs'])) {
    const diff = stats.currentMonthSpend - stats.previousMonthSpend
    const pct = stats.previousMonthSpend > 0 ? Math.round((diff / stats.previousMonthSpend) * 100) : 0
    const direction = diff > 0 ? 'more' : 'less'
    return `This month you spent ${formatCurrency(stats.currentMonthSpend, symbol)} vs ${formatCurrency(stats.previousMonthSpend, symbol)} last month — that's ${formatCurrency(Math.abs(diff), symbol)} ${direction} (${Math.abs(pct)}% change).`
  }

  if (matchQuery(query, ['reduce', 'cut', 'unnecessary', 'save money'])) {
    const subs = currentExpenses.filter((e) => ['Subscription', 'Entertainment', 'Shopping'].includes(e.category))
    const subTotal = subs.reduce((s, e) => s + e.amount, 0)
    const tips = [
      `Review ${subs.length} subscription/entertainment expenses totaling ${formatCurrency(subTotal, symbol)}.`,
      `Your savings rate is ${stats.savingsRate}%. Aim for at least 20%.`,
      breakdown.length > 2 ? `Consider reducing ${breakdown[0].category} spending (${formatCurrency(breakdown[0].amount, symbol)}).` : '',
    ].filter(Boolean)
    return `**Savings Suggestions:**\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
  }

  if (matchQuery(query, ['save monthly', 'how much can i save', 'savings potential'])) {
    const potential = Math.max(0, stats.totalIncome * 0.2 - (stats.totalIncome - stats.remainingBalance))
    return `Based on your income of ${formatCurrency(stats.totalIncome, symbol)} and current spending, you could save approximately ${formatCurrency(potential > 0 ? potential : stats.remainingBalance, symbol)} monthly by maintaining a 20% savings rate.`
  }

  if (matchQuery(query, ['predict', 'next month', 'forecast'])) {
    const avg = stats.currentMonthSpend
    const trend = stats.previousMonthSpend > 0 ? (stats.currentMonthSpend - stats.previousMonthSpend) / stats.previousMonthSpend : 0
    const predicted = Math.round(avg * (1 + trend * 0.5))
    return `Based on current trends, predicted spending next month: **${formatCurrency(predicted, symbol)}** (±10% confidence). Trend: ${trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'}.`
  }

  if (matchQuery(query, ['average', 'avg monthly'])) {
    return `Your average monthly expense (current month): ${formatCurrency(stats.currentMonthSpend, symbol)}. Previous month: ${formatCurrency(stats.previousMonthSpend, symbol)}.`
  }

  if (matchQuery(query, ['percentage', 'income spent', 'spent of income'])) {
    const pct = stats.totalIncome > 0 ? Math.round((stats.totalExpense / stats.totalIncome) * 100) : 0
    return `You've spent **${pct}%** of your income this month (${formatCurrency(stats.totalExpense, symbol)} of ${formatCurrency(stats.totalIncome, symbol)}).`
  }

  if (matchQuery(query, ['summary', 'overview', 'monthly review'])) {
    return `**Monthly Summary**\n\n• Income: ${formatCurrency(stats.totalIncome, symbol)}\n• Expenses: ${formatCurrency(stats.totalExpense, symbol)}\n• Remaining: ${formatCurrency(stats.remainingBalance, symbol)}\n• Savings Rate: ${stats.savingsRate}%\n• Top Category: ${stats.highestSpendingCategory} (${formatCurrency(stats.highestSpendingAmount, symbol)})`
  }

  if (matchQuery(query, ['budget health', 'health score'])) {
    const score = getBudgetHealthScore(stats)
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention'
    return `Your Budget Health Score is **${score}/100** (${label}). ${score < 60 ? 'Consider reducing discretionary spending and increasing savings.' : 'Keep up the good financial habits!'}`
  }

  if (matchQuery(query, ['breakdown', 'category', 'distribution'])) {
    if (breakdown.length === 0) return 'No expense data available for breakdown.'
    const lines = breakdown.slice(0, 5).map((b) => `• ${b.category}: ${formatCurrency(b.amount, symbol)} (${b.percentage}%)`)
    return `**Expense Breakdown:**\n\n${lines.join('\n')}`
  }

  if (matchQuery(query, ['investment', 'invest'])) {
    return `Investment spending this month: ${formatCurrency(stats.investment, symbol)}. ${stats.investment === 0 ? 'Consider allocating 10-15% of income to investments.' : 'Good job investing in your future!'}`
  }

  return `I can help you analyze your finances! Try asking:\n\n• "Where did I spend most money?"\n• "Compare this month with last month"\n• "What expenses can I reduce?"\n• "Show my monthly summary"\n• "What's my budget health score?"`
}

export function generateAIInsights(
  _incomes: Income[],
  expenses: Expense[],
  stats: DashboardStats,
  symbol: string
): AIInsight[] {
  const insights: AIInsight[] = []
  const now = new Date().toISOString()
  const breakdown = getCategoryBreakdown(filterByMonth(expenses))

  insights.push({
    id: 'spending-summary',
    type: 'summary',
    title: 'Spending Summary',
    message: `You spent ${formatCurrency(stats.currentMonthSpend, symbol)} this month with a savings rate of ${stats.savingsRate}%.`,
    createdAt: now,
  })

  if (stats.currentMonthSpend > stats.previousMonthSpend && stats.previousMonthSpend > 0) {
    const increase = Math.round(((stats.currentMonthSpend - stats.previousMonthSpend) / stats.previousMonthSpend) * 100)
    insights.push({
      id: 'overspend-alert',
      type: 'alert',
      title: 'Overspending Alert',
      message: `Spending is up ${increase}% compared to last month. Review ${stats.highestSpendingCategory} expenses.`,
      createdAt: now,
    })
  }

  if (stats.savingsRate < 10) {
    insights.push({
      id: 'savings-suggestion',
      type: 'suggestion',
      title: 'Boost Your Savings',
      message: `Your savings rate is only ${stats.savingsRate}%. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
      createdAt: now,
    })
  }

  if (breakdown.length > 0) {
    insights.push({
      id: 'category-analysis',
      type: 'trend',
      title: 'Category Analysis',
      message: `${breakdown[0].category} is your top expense at ${formatCurrency(breakdown[0].amount, symbol)} (${breakdown[0].percentage}% of total).`,
      createdAt: now,
    })
  }

  const budgetScore = getBudgetHealthScore(stats)
  insights.push({
    id: 'budget-health',
    type: 'summary',
    title: 'Budget Health',
    message: `Your budget health score is ${budgetScore}/100.`,
    score: budgetScore,
    createdAt: now,
  })

  const finScore = getFinancialHealthScore(stats)
  insights.push({
    id: 'financial-health',
    type: 'summary',
    title: 'Financial Health',
    message: `Overall financial health score: ${finScore}/100.`,
    score: finScore,
    createdAt: now,
  })

  return insights
}

export const AI_QUICK_ACTIONS = [
  { id: 'analyze', label: 'Analyze Month', query: 'Show my monthly summary' },
  { id: 'savings', label: 'Savings Tips', query: 'What expenses can I reduce?' },
  { id: 'top', label: 'Top Expenses', query: 'Where did I spend most money?' },
  { id: 'health', label: 'Budget Health', query: 'What is my budget health score?' },
  { id: 'predict', label: 'Predict Future', query: 'Predict next month spending' },
  { id: 'invest', label: 'Investment Tips', query: 'Investment suggestions' },
  { id: 'breakdown', label: 'Expense Breakdown', query: 'Show expense breakdown' },
  { id: 'summary', label: 'Monthly Summary', query: 'Monthly review summary' },
]
