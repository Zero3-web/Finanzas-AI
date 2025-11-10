import React, { useState, useMemo } from 'react';
import { Account, Debt, CalendarEvent } from '../types';
import Card from '../components/Card';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

interface CalendarProps {
  accounts: Account[];
  debts: Debt[];
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const Calendar: React.FC<CalendarProps> = ({ accounts, debts, formatCurrency, t }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const eventsMap = useMemo(() => {
    const events = new Map<string, CalendarEvent[]>();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Debt events
    debts.forEach(debt => {
      const eventDate = new Date(debt.nextPaymentDate);
      const key = eventDate.toISOString().split('T')[0];
      if (!events.has(key)) events.set(key, []);
      events.get(key)!.push({
        id: `debt-${debt.id}`,
        date: key,
        description: `${t('paymentFor')} ${debt.name}`,
        amount: debt.totalAmount - debt.amountPaid,
        type: 'debt',
      });
    });

    // Credit card events for the current month view
    accounts
      .filter(acc => acc.type === 'credit' && acc.paymentDueDate)
      .forEach(acc => {
        const dayOfMonth = parseInt(acc.paymentDueDate!);
        if (isNaN(dayOfMonth)) return;

        const eventDate = new Date(year, month, dayOfMonth);
        const key = eventDate.toISOString().split('T')[0];
        if (!events.has(key)) events.set(key, []);
        events.get(key)!.push({
          id: `credit-${acc.id}`,
          date: key,
          description: `${t('paymentFor')} ${acc.name}`,
          amount: acc.balance,
          type: 'credit_card',
        });
      });

    return events;
  }, [accounts, debts, currentDate, t]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prefixDays = Array.from({ length: startDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const selectedDateKey = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
  const eventsForSelectedDate = selectedDateKey ? eventsMap.get(selectedDateKey) || [] : [];
  const today = new Date();

  const getDayClass = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = d.toISOString().split('T')[0];
    const isToday = d.toDateString() === today.toDateString();
    const isSelected = d.toDateString() === selectedDate?.toDateString();
    const hasEvent = eventsMap.has(dateKey);

    let classes = "relative flex items-center justify-center h-12 w-12 rounded-full cursor-pointer transition-colors ";
    if (isSelected) {
      classes += "bg-primary text-white ";
    } else if (isToday) {
      classes += "bg-primary/20 text-primary dark:bg-primary/30 dark:text-brand-cyan font-semibold ";
    } else {
      classes += "hover:bg-secondary dark:hover:bg-gray-700 ";
    }
    return { classes, hasEvent };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-main dark:text-brand-white">{t('calendar')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-text-main dark:text-brand-white">
                    {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-700">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-text-secondary dark:text-gray-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{t(day.toLowerCase())}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {prefixDays.map(i => <div key={`prefix-${i}`}></div>)}
                {days.map(day => {
                    const { classes, hasEvent } = getDayClass(day);
                    return (
                        <div key={day} className={classes} onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}>
                            <span>{day}</span>
                            {hasEvent && <span className="absolute bottom-2 h-1.5 w-1.5 bg-brand-cyan rounded-full"></span>}
                        </div>
                    );
                })}
            </div>
        </Card>

        <Card>
            <h2 className="text-xl font-bold mb-4 text-text-main dark:text-brand-white">{t('upcoming_payments')}</h2>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">{selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {eventsForSelectedDate.length > 0 ? (
                    eventsForSelectedDate.map(event => (
                        <div key={event.id} className="flex items-center p-3 rounded-lg bg-secondary dark:bg-gray-700/50">
                            <div className={`w-2 h-10 rounded-full mr-4 ${event.type === 'debt' ? 'bg-expense' : 'bg-primary'}`}></div>
                            <div>
                                <p className="font-semibold text-text-main dark:text-gray-200">{event.description}</p>
                                <p className={`font-medium ${event.type === 'debt' ? 'text-expense' : 'text-primary'}`}>{formatCurrency(event.amount)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-text-secondary dark:text-gray-400">
                       <p>{t('no_events_selected_date')}</p>
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
