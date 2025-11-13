import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps, LineChart, Line, CartesianGrid } from 'recharts';
import { Transaction, TransactionType, Account } from '../types';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    // FIX: Explicitly add 'active' property to resolve TypeScript error during destructuring.
    active?: boolean;
    payload?: any[];
    label?: string;
    formatCurrency: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface dark:bg-secondary-dark p-2 border border-secondary dark:border-border-dark rounded-md shadow-lg">
          <p className="label text-text-main dark:text-text-main-dark font-semibold">{`${label}`}</p>
          {payload.map((pld, index) => (
             <p key={index} style={{ color: pld.color }} className="intro">{`${pld.name}: ${formatCurrency(pld.value)}`}</p>
          ))}
        </div>
      );
    }
  
    return null;
  };

export const AccountBalancePieChart: React.FC<{ balance: number; color: string }> = ({ balance, color }) => {
    const data = [
        { name: 'Balance', value: balance },
        { name: 'Empty', value: Math.max(balance * 0.3, 500) } // To make the arc visible
    ];
    return (
        <ResponsiveContainer width="100%" height={100}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={40}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    stroke="none"
                >
                    <Cell fill={color} />
                    <Cell fill="#e5e7eb" className="dark:fill-secondary-dark" />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export const ActivityChart: React.FC<{ 
    transactions: Transaction[]; 
    primaryColor: string; 
    accentColor: string; 
    formatCurrency: (amount: number) => string;
    onDayClick: (date: string) => void;
}> = ({ transactions, primaryColor, accentColor, formatCurrency, onDayClick }) => {
    const data = transactions.reduce((acc, t) => {
        const fullDate = new Date(t.date).toISOString().split('T')[0]; // YYYY-MM-DD for uniqueness
        const displayName = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        let entry = acc.find(e => e.fullDate === fullDate);
        if (!entry) {
            entry = { name: displayName, fullDate: fullDate, Ingresos: 0, Gastos: 0 };
            acc.push(entry);
        }

        if (t.type === TransactionType.INCOME) {
            entry.Ingresos += t.amount;
        } else {
            entry.Gastos += t.amount;
        }
        return acc;
    }, [] as { name: string; fullDate: string; Ingresos: number; Gastos: number }[])
    .sort((a,b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-border-dark" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} className="dark:stroke-text-secondary-dark" />
                <YAxis 
                    stroke="#6b7280" 
                    fontSize={12} 
                    tickFormatter={(value) => formatCurrency(Number(value)).replace(/(\.\d*|,\d*)/, '')} 
                    className="dark:stroke-text-secondary-dark"
                    domain={[0, (dataMax: number) => (dataMax > 5 ? Math.ceil(dataMax * 1.2) : 10)]}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Line type="monotone" dataKey="Ingresos" stroke={primaryColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, style: { cursor: 'pointer' }, onClick: (e, payload) => onDayClick((payload as any).payload.fullDate) }} />
                <Line type="monotone" dataKey="Gastos" stroke={accentColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, style: { cursor: 'pointer' }, onClick: (e, payload) => onDayClick((payload as any).payload.fullDate) }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export const WeeklySpendingChart: React.FC<{
    transactions: Transaction[];
    accounts: Account[];
    primaryCurrency: string;
    accentColor: string;
    formatCurrency: (amount: number, currency: string) => string;
    t: (key: string) => string;
    onBarClick: (date: string) => void;
}> = ({ transactions, accounts, primaryCurrency, accentColor, formatCurrency, t, onBarClick }) => {

    const data = useMemo(() => {
        const accountCurrencyMap = new Map(accounts.map(acc => [acc.id, acc.currency]));
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const weekData: { [key: string]: { name: string, Gastos: number, fullDate: string }} = {};

        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(sevenDaysAgo.getDate() + i);
            const dayKey = date.toISOString().split('T')[0];
            weekData[dayKey] = { name: t(days[date.getDay()]), Gastos: 0, fullDate: dayKey };
        }

        transactions.forEach(t => {
            const transactionDate = new Date(t.date);
            if (
                t.type === TransactionType.EXPENSE &&
                accountCurrencyMap.get(t.accountId) === primaryCurrency &&
                transactionDate >= sevenDaysAgo &&
                transactionDate <= today
            ) {
                const dayKey = transactionDate.toISOString().split('T')[0];
                if (weekData[dayKey]) {
                    weekData[dayKey].Gastos += t.amount;
                }
            }
        });
        
        return Object.values(weekData);

    }, [transactions, accounts, primaryCurrency, t]);

    return (
        <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} className="dark:stroke-text-secondary-dark" tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => formatCurrency(Number(value), primaryCurrency).replace(/(\.\d*|,\d*)/, '')} className="dark:stroke-text-secondary-dark" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip formatCurrency={(val) => formatCurrency(val, primaryCurrency)} />} cursor={{ fill: 'rgba(114, 63, 235, 0.05)' }}/>
                <Bar dataKey="Gastos" fill={accentColor} radius={[4, 4, 0, 0]} onClick={(data) => onBarClick(data.fullDate)} style={{ cursor: 'pointer' }} />
            </BarChart>
        </ResponsiveContainer>
    );
};