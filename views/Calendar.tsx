import React, { useState, useMemo } from 'react';
import { Account, Debt, CalendarEvent, Subscription } from '../types';
import Card from '../components/Card';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

interface CalendarProps {
  accounts: Account[];
  debts: Debt[];
  subscriptions: Subscription[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string) => string;
}

const getDaysUntil = (dateString: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const Calendar: React.FC<CalendarProps> = ({ accounts, debts, subscriptions, formatCurrency, t }) => {
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
        currency: debt.currency,
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
          currency: acc.currency,
          type: 'credit_card',
        });
      });
      
    // Subscription events
    subscriptions.forEach(sub => {
      const dayOfMonth = parseInt(sub.paymentDay);
      if (isNaN(dayOfMonth)) return;

      const eventDate = new Date(year, month, dayOfMonth);
      const key = eventDate.toISOString().split('T')[0];
      if (!events.has(key)) events.set(key, []);
      events.get(key)!.push({
        id: `sub-${sub.id}`,
        date: key,
        description: sub.name,
        amount: sub.amount,
        currency: sub.currency,
        type: 'subscription',
      });
    });

    return events;
  }, [accounts, debts, subscriptions, currentDate, t]);

  const upcomingEventsIn5Days = useMemo(() => {
    const allUpcoming: (CalendarEvent & { daysUntil: number })[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);

    debts.forEach(debt => {
      const eventDate = new Date(debt.nextPaymentDate);
      if (eventDate >= today && eventDate <= fiveDaysFromNow) {
        allUpcoming.push({
          id: `debt-${debt.id}`,
          date: debt.nextPaymentDate,
          description: `${t('paymentFor')} ${debt.name}`,
          amount: debt.totalAmount - debt.amountPaid,
          currency: debt.currency,
          type: 'debt',
          daysUntil: getDaysUntil(debt.nextPaymentDate),
        });
      }
    });

    const recurringItems = [
      ...subscriptions.map(s => ({ ...s, type: 'subscription' as const, day: s.paymentDay, amount: s.amount })),
      ...accounts.filter(a => a.type === 'credit' && a.paymentDueDate).map(a => ({ ...a, type: 'credit_card' as const, day: a.paymentDueDate!, amount: a.balance }))
    ];

    recurringItems.forEach(item => {
      const dayOfMonth = parseInt(item.day);
      if (isNaN(dayOfMonth)) return;

      let nextPaymentDateThisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      let nextPaymentDateNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);

      const checkAndAdd = (date: Date) => {
        if (date >= today && date <= fiveDaysFromNow) {
          const dateStr = date.toISOString().split('T')[0];
          allUpcoming.push({
            id: `${item.type}-${item.id}-${dateStr}`,
            date: dateStr,
            description: item.type === 'subscription' ? item.name : `${t('paymentFor')} ${item.name}`,
            amount: item.amount,
            currency: item.currency,
            type: item.type,
            daysUntil: getDaysUntil(dateStr),
          });
        }
      };

      checkAndAdd(nextPaymentDateThisMonth);
      if(nextPaymentDateThisMonth < today) {
         checkAndAdd(nextPaymentDateNextMonth);
      }
    });

    return allUpcoming
      .filter((event, index, self) => index === self.findIndex(e => e.id === event.id)) // Remove duplicates
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [accounts, debts, subscriptions, t]);

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
  
  const todayDate = new Date();

  const getDayClass = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = d.toISOString().split('T')[0];
    const isToday = d.toDateString() === todayDate.toDateString();
    const isSelected = d.toDateString() === selectedDate?.toDateString();
    const hasEvent = eventsMap.has(dateKey);

    let classes = "relative flex items-center justify-center h-12 w-12 rounded-full cursor-pointer transition-colors ";
    if (isSelected) {
      classes += "bg-primary text-white ";
    } else if (isToday) {
      classes += "bg-primary/20 text-primary dark:bg-primary/30 dark:text-accent font-semibold ";
    } else {
      classes += "hover:bg-secondary dark:hover:bg-secondary-dark ";
    }
    return { classes, hasEvent };
  }
  
  const getEventTypeStyling = (type: CalendarEvent['type']) => {
      switch (type) {
          case 'debt':
              return { bar: 'bg-expense', text: 'text-expense' };
          case 'credit_card':
              return { bar: 'bg-primary', text: 'text-primary' };
          case 'subscription':
              return { bar: 'bg-accent', text: 'text-accent' };
          default:
              return { bar: 'bg-gray-400', text: 'text-text-secondary' };
      }
  };
  
  const getDaysUntilText = (days: number) => {
      if (days < 0) return '';
      if (days === 0) return t('days_until_today');
      if (days === 1) return t('days_until_tomorrow');
      return t('days_until_in_days', { days });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">{t('calendar')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-secondary dark:hover:bg-secondary-dark">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">
                    {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-secondary dark:hover:bg-secondary-dark">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-text-secondary dark:text-text-secondary-dark">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{t(day.toLowerCase())}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {prefixDays.map(i => <div key={`prefix-${i}`}></div>)}
                {days.map(day => {
                    const { classes, hasEvent } = getDayClass(day);
                    return (
                        <div key={day} className={classes} onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}>
                            <span>{day}</span>
                            {hasEvent && <span className="absolute bottom-2 h-1.5 w-1.5 bg-accent rounded-full"></span>}
                        </div>
                    );
                })}
            </div>
        </Card>

        <Card>
            <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">{t('upcoming_payments')}</h2>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
                {upcomingEventsIn5Days.length > 0 ? (
                    upcomingEventsIn5Days.map(event => {
                        const styling = getEventTypeStyling(event.type);
                        const daysText = getDaysUntilText(event.daysUntil);
                        return (
                            <div key={event.id} className="flex items-center p-3 rounded-lg bg-secondary dark:bg-secondary-dark/50">
                                <div className={`w-1.5 h-10 rounded-full mr-3 ${styling.bar}`}></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-text-main dark:text-text-main-dark text-sm">{event.description}</p>
                                    <p className={`font-medium text-xs ${styling.text}`}>{formatCurrency(event.amount, event.currency)}</p>
                                </div>
                                {daysText && <span className="text-xs font-bold text-primary ml-2">{daysText}</span>}
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-text-secondary dark:text-text-secondary-dark">
                       <p className="text-sm">{t('no_upcoming_payments_5_days')}</p>
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;