import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps, LineChart, Line, CartesianGrid } from 'recharts';
import { Transaction, TransactionType } from '../types';
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
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-border-dark" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} className="dark:stroke-text-secondary-dark" />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => formatCurrency(Number(value)).replace(/(\.\d*|,\d*)/, '')} className="dark:stroke-text-secondary-dark" />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Line type="monotone" dataKey="Ingresos" stroke={primaryColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, style: { cursor: 'pointer' }, onClick: (e, payload) => onDayClick((payload as any).payload.fullDate) }} />
                <Line type="monotone" dataKey="Gastos" stroke={accentColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, style: { cursor: 'pointer' }, onClick: (e, payload) => onDayClick((payload as any).payload.fullDate) }} />
            </LineChart>
        </ResponsiveContainer>
    );
}