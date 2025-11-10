import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps, LineChart, Line, CartesianGrid } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Theme } from '../hooks/useTheme';

// FIX: The provided `TooltipProps` type from recharts is missing `payload` and `label`.
// Intersecting the type with the missing properties to resolve the error.
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType> & { payload?: any[], label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface dark:bg-gray-800 p-2 border border-secondary dark:border-gray-700 rounded-md shadow-lg">
          <p className="label text-text-main dark:text-gray-100 font-semibold">{`${label}`}</p>
          {payload.map((pld, index) => (
             <p key={index} style={{ color: pld.color }} className="intro">{`${pld.name}: $${pld.value?.toLocaleString()}`}</p>
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
                    <Cell fill="#e5e7eb" className="dark:fill-gray-700" />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export const ActivityChart: React.FC<{ transactions: Transaction[]; primaryColor: string; accentColor: string; }> = ({ transactions, primaryColor, accentColor }) => {
    const data = transactions.reduce((acc, t) => {
        const day = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let entry = acc.find(e => e.name === day);
        if (!entry) {
            entry = { name: day, Ingresos: 0, Gastos: 0 };
            acc.push(entry);
        }
        if (t.type === TransactionType.INCOME) {
            entry.Ingresos += t.amount;
        } else {
            entry.Gastos += t.amount;
        }
        return acc;
    }, [] as { name: string; Ingresos: number; Gastos: number }[])
    .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} className="dark:stroke-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Line type="monotone" dataKey="Ingresos" stroke={primaryColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Gastos" stroke={accentColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export const SpendingBarChart: React.FC<{ transactions: Transaction[]; primaryColor: string; primaryColorRgb: string; }> = ({ transactions, primaryColor, primaryColorRgb }) => {
    const weeklyData = [
        { name: 'Mon', Gastos: 0 },
        { name: 'Tue', Gastos: 0 },
        { name: 'Wed', Gastos: 0 },
        { name: 'Thu', Gastos: 0 },
        { name: 'Fri', Gastos: 0 },
        { name: 'Sat', Gastos: 0 },
        { name: 'Sun', Gastos: 0 },
    ];

    transactions.filter(t => t.type === 'expense').forEach(t => {
        const day = new Date(t.date).getDay(); // Sunday = 0
        const adjustedDay = day === 0 ? 6 : day - 1; // Monday = 0
        weeklyData[adjustedDay].Gastos += t.amount;
    });

    return (
        <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
                <Tooltip cursor={{ fill: `rgba(${primaryColorRgb}, 0.1)` }} content={<CustomTooltip />} />
                <Bar dataKey="Gastos" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
        </ResponsiveContainer>
    );
};