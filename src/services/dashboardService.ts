import { persistence } from "../config/persistence";

function monthKey(date: string): string {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function weekKey(date: string): string {
  const d = new Date(date);
  const oneJan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((d.getUTCDay() + 1 + numberOfDays) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export class DashboardService {
  async getSummary() {
    const store = await persistence.read();
    const records = store.records.filter((record) => !record.isDeleted);

    const totalIncome = records
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);

    const categoryTotals = records.reduce<Record<string, number>>((acc, record) => {
      acc[record.category] = (acc[record.category] ?? 0) + record.amount;
      return acc;
    }, {});

    const recentActivity = [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryTotals,
      recentActivity
    };
  }

  async getTrends(period: "monthly" | "weekly") {
    const store = await persistence.read();
    const records = store.records.filter((record) => !record.isDeleted);

    const trendMap = records.reduce<Record<string, { income: number; expense: number }>>((acc, record) => {
      const key = period === "monthly" ? monthKey(record.date) : weekKey(record.date);

      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0 };
      }

      if (record.type === "income") {
        acc[key].income += record.amount;
      } else {
        acc[key].expense += record.amount;
      }

      return acc;
    }, {});

    return Object.keys(trendMap)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({
        period: key,
        income: trendMap[key].income,
        expense: trendMap[key].expense,
        net: trendMap[key].income - trendMap[key].expense
      }));
  }

  async getInsights() {
    const store = await persistence.read();
    const records = store.records.filter((record) => !record.isDeleted);

    const totalIncome = records
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);

    const net = totalIncome - totalExpenses;
    const expenseByCategory = records
      .filter((record) => record.type === "expense")
      .reduce<Record<string, number>>((acc, record) => {
        acc[record.category] = (acc[record.category] ?? 0) + record.amount;
        return acc;
      }, {});

    const topExpenseCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0] ?? null;
    const savingsRate = totalIncome > 0 ? Number(((net / totalIncome) * 100).toFixed(2)) : 0;
    const expenseToIncomeRatio = totalIncome > 0 ? Number((totalExpenses / totalIncome).toFixed(3)) : null;

    const now = Date.now();
    const last30DaysMs = 30 * 24 * 60 * 60 * 1000;
    const last30DaysRecords = records.filter((record) => now - new Date(record.date).getTime() <= last30DaysMs);
    const last30DaysNet = last30DaysRecords.reduce((sum, record) => {
      return sum + (record.type === "income" ? record.amount : -record.amount);
    }, 0);

    const cashflowHealth =
      savingsRate >= 35 ? "excellent" : savingsRate >= 20 ? "good" : savingsRate >= 5 ? "watch" : "critical";

    return {
      savingsRate,
      expenseToIncomeRatio,
      topExpenseCategory: topExpenseCategory
        ? {
            category: topExpenseCategory[0],
            amount: topExpenseCategory[1]
          }
        : null,
      last30DaysNet,
      cashflowHealth
    };
  }

  async getForecast(monthsAhead: number) {
    const store = await persistence.read();
    const records = store.records.filter((record) => !record.isDeleted);

    const monthlyNetMap = records.reduce<Record<string, number>>((acc, record) => {
      const key = monthKey(record.date);
      if (!acc[key]) {
        acc[key] = 0;
      }

      acc[key] += record.type === "income" ? record.amount : -record.amount;
      return acc;
    }, {});

    const sorted = Object.keys(monthlyNetMap)
      .sort((a, b) => a.localeCompare(b))
      .map((period) => ({ period, net: monthlyNetMap[period] }));

    if (sorted.length < 2) {
      return {
        confidence: "low",
        basis: "insufficient_history",
        projectedNet: sorted[0]?.net ?? 0,
        monthsAhead,
        history: sorted
      };
    }

    const x = sorted.map((_, index) => index + 1);
    const y = sorted.map((item) => item.net);
    const n = x.length;
    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);
    const sumXY = x.reduce((acc, val, index) => acc + val * y[index], 0);
    const sumXX = x.reduce((acc, val) => acc + val * val, 0);

    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    const targetX = n + monthsAhead;
    const projectedNet = Number((intercept + slope * targetX).toFixed(2));

    return {
      confidence: n >= 6 ? "medium" : "low",
      basis: "linear_regression_monthly_net",
      projectedNet,
      monthsAhead,
      trendSlope: Number(slope.toFixed(4)),
      history: sorted.slice(-12)
    };
  }
}

export const dashboardService = new DashboardService();
