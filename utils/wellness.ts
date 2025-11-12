import { Transaction, Account, Debt } from '../types';

type Status = 'status_excellent' | 'status_good' | 'status_needs_improvement';

const getStatus = (score: number, maxScore: number): Status => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return 'status_excellent';
    if (percentage >= 0.5) return 'status_good';
    return 'status_needs_improvement';
};


export const calculateWellnessScore = (transactions: Transaction[], accounts: Account[], debts: Debt[], t: (key: string) => string) => {
    // --- 1. Savings Rate (350 points) ---
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const recentTransactions = transactions.filter(t => new Date(t.date) >= ninetyDaysAgo);

    const totalIncome = recentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = recentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    let savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    let savingsRateScore = 0;
    if (savingsRate >= 0.20) {
        savingsRateScore = 350;
    } else if (savingsRate > 0) {
        savingsRateScore = (savingsRate / 0.20) * 350;
    }
    savingsRateScore = Math.max(0, Math.round(savingsRateScore));

    // --- 2. Debt Load (300 points) ---
    const monthlyDebtPayments = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
    const averageMonthlyIncome = totalIncome / 3;

    let debtToIncomeRatio = averageMonthlyIncome > 0 ? monthlyDebtPayments / averageMonthlyIncome : 1;
    let debtLoadScore = 0;
    if (debtToIncomeRatio <= 0.10) {
        debtLoadScore = 300;
    } else if (debtToIncomeRatio <= 0.40) {
        debtLoadScore = 300 * (1 - ((debtToIncomeRatio - 0.10) / 0.30));
    }
    debtLoadScore = Math.max(0, Math.round(debtLoadScore));

    // --- 3. Emergency Fund (350 points) ---
    const savingsBalance = accounts.filter(a => a.type === 'savings').reduce((sum, a) => sum + a.balance, 0);
    const averageMonthlyExpenses = totalExpenses / 3;

    let emergencyFundMonths = averageMonthlyExpenses > 0 ? savingsBalance / averageMonthlyExpenses : 0;
    let emergencyFundScore = 0;
    if (emergencyFundMonths >= 3) {
        emergencyFundScore = 350;
    } else if (emergencyFundMonths > 0) {
        emergencyFundScore = (emergencyFundMonths / 3) * 350;
    }
    emergencyFundScore = Math.max(0, Math.round(emergencyFundScore));

    const totalScore = savingsRateScore + debtLoadScore + emergencyFundScore;

    const savingsStatus = getStatus(savingsRateScore, 350);
    const debtStatus = getStatus(debtLoadScore, 300);
    const fundStatus = getStatus(emergencyFundScore, 350);
    
    const getTip = (baseKey: string, status: Status) => {
        const statusKey = status.split('_')[1]; // excellent, good, improvement
        return t(`${baseKey}_${statusKey}`);
    }

    return {
        totalScore,
        hasEnoughData: recentTransactions.length > 5 && accounts.length > 0,
        breakdown: [
            { name: t('savings_rate'), score: savingsRateScore, maxScore: 350, value: `${(savingsRate * 100).toFixed(1)}%`, status: savingsStatus, tip: getTip('tip_savings', savingsStatus) },
            { name: t('debt_load'), score: debtLoadScore, maxScore: 300, value: `${(debtToIncomeRatio * 100).toFixed(1)}%`, status: debtStatus, tip: getTip('tip_debt', debtStatus) },
            { name: t('emergency_fund'), score: emergencyFundScore, maxScore: 350, value: `${emergencyFundMonths.toFixed(1)} ${t('months')}`, status: fundStatus, tip: getTip('tip_fund', fundStatus) }
        ]
    };
};

export const getScoreTitle = (score: number, t: (key: string) => string) => {
    if (score > 850) return t('wellness_title_excellent');
    if (score > 650) return t('wellness_title_good');
    if (score > 400) return t('wellness_title_average');
    return t('wellness_title_needs_work');
}
