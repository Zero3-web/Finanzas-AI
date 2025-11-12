import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Transaction, Account, Debt, ColorTheme } from '../types';
import { themes } from '../hooks/useColorTheme';
import { calculateWellnessScore, getScoreTitle } from '../utils/wellness';
import Card from '../components/Card';

interface WellnessProps {
  transactions: Transaction[];
  accounts: Account[];
  debts: Debt[];
  t: (key: string) => string;
  colorTheme: ColorTheme;
}

const Wellness: React.FC<WellnessProps> = ({ transactions, accounts, debts, t, colorTheme }) => {
    const { totalScore, breakdown, hasEnoughData } = calculateWellnessScore(transactions, accounts, debts, t);

    const currentPalette = themes[colorTheme];
    const toHex = (rgb: string) => '#' + rgb.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
    const primaryColor = toHex(currentPalette['--color-primary']);

    const getStatusColor = (status: string) => {
        if (status === 'status_excellent') return 'text-income';
        if (status === 'status_good') return 'text-yellow-500';
        return 'text-expense';
    }

    if (!hasEnoughData) {
        return (
             <div className="space-y-6">
                 <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('wellness_score_title')}</h1>
                 <Card className="flex items-center justify-center h-64">
                    <p className="text-text-secondary dark:text-text-secondary-dark text-center max-w-sm">{t('no_data_for_wellness')}</p>
                 </Card>
             </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('wellness_score_title')}</h1>

            <Card className="text-center p-4 md:p-6">
                <div className="relative w-full h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="70%"
                            outerRadius="100%"
                            data={[{ value: totalScore }]}
                            startAngle={180}
                            endAngle={0}
                            barSize={30}
                        >
                            <PolarAngleAxis type="number" domain={[0, 1000]} angleAxisId={0} tick={false} />
                            <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={15}
                                fill={primaryColor}
                                className="transition-all"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl md:text-6xl font-bold text-text-main dark:text-text-main-dark">{totalScore}</span>
                        <span className="text-text-secondary dark:text-text-secondary-dark font-semibold">/ 1000</span>
                    </div>
                </div>
                <h2 className="text-2xl font-bold mt-2 text-text-main dark:text-text-main-dark">{getScoreTitle(totalScore, t)}</h2>
            </Card>

            <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark pt-4">{t('score_breakdown')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {breakdown.map((item, index) => (
                    <Card key={index}>
                        <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">{item.name}</h3>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2">{item.value}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-full bg-secondary dark:bg-secondary-dark rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(item.score / item.maxScore) * 100}%` }}></div>
                            </div>
                            <span className="font-semibold">{item.score}/{item.maxScore}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                             <p className={`font-semibold capitalize ${getStatusColor(item.status)}`}>{t(item.status)}</p>
                        </div>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2 pt-2 border-t border-secondary dark:border-border-dark">{item.tip}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Wellness;
