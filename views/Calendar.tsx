
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Account, Debt, CalendarEvent, RecurringTransaction, TransactionType } from '../types';
import Card from '../components/Card';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { useCurrentDate } from '../contexts/CurrentDateContext';

interface CalendarProps {
  accounts: Account[];
  debts: Debt[];
  recurringTransactions: RecurringTransaction[];
  formatCurrency: (amount: number, currency: string) => string;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

const getDaysUntil = (dateString: string, today: Date): number => {
    const todayClone = new Date(today);
    todayClone.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - todayClone.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const Calendar: React.FC<CalendarProps> = ({ accounts, debts, recurringTransactions, formatCurrency, t }) => {
  const { currentDate: realToday } = useCurrentDate();
  const [viewingDate, setViewingDate] = useState(new Date(realToday.getFullYear(), realToday.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(realToday);
  const selectedEventsRef = useRef<HTMLDivElement>(null);

  const eventsMap = useMemo(() => {
    const events = new Map<string, CalendarEvent[]>();
    const year = viewingDate.getFullYear();
    const month = viewingDate.getMonth();

    // Debt events
    debts.forEach(debt => {
      const eventDate = new Date(debt.nextPaymentDate);
      const key = eventDate.toISOString().split('T')[0];
      if (!events.has(key)) events.set(key, []);
      const amountPaid = debt.paidInstallments * debt.monthlyPayment;
      const remainingAmount = debt.totalAmount - amountPaid;
      events.get(key)!.push({
        id: `debt-${debt.id}`,
        date: key,
        description: `${t('paymentFor')} ${debt.name}`,
        amount: remainingAmount,
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
      
    // Recurring transaction events
    recurringTransactions.forEach(rec => {
      const dayOfMonth = parseInt(rec.paymentDay);
      if (isNaN(dayOfMonth)) return;

      const eventDate = new Date(year, month, dayOfMonth);
      const key = eventDate.toISOString().split('T')[0];
      if (!events.has(key)) events.set(key, []);
      events.get(key)!.push({
        id: `rec-${rec.id}`,
        date: key,
        description: rec.name,
        amount: rec.amount,
        currency: rec.currency,
        type: 'recurring',
        transactionType: rec.type,
      });
    });

    return events;
  }, [accounts, debts, recurringTransactions, viewingDate, t]);

  const upcomingEventsIn5Days = useMemo(() => {
    const allUpcoming: (CalendarEvent & { daysUntil: number })[] = [];
    const today = new Date(realToday);
    today.setHours(0, 0, 0, 0);
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);

    debts.forEach(debt => {
      const eventDate = new Date(debt.nextPaymentDate);
      if (eventDate >= today && eventDate <= fiveDaysFromNow) {
        const amountPaid = debt.paidInstallments * debt.monthlyPayment;
        const remainingAmount = debt.totalAmount - amountPaid;
        allUpcoming.push({
          id: `debt-${debt.id}`,
          date: debt.nextPaymentDate,
          description: `${t('paymentFor')} ${debt.name}`,
          amount: remainingAmount,
          currency: debt.currency,
          type: 'debt',
          daysUntil: getDaysUntil(debt.nextPaymentDate, today),
        });
      }
    });

    const recurringItemsForCalendar = [
      ...recurringTransactions.map(r => ({ ...r, day: r.paymentDay })),
      ...accounts.filter(a => a.type === 'credit' && a.paymentDueDate).map(a => ({ ...a, type: 'credit' as const, day: a.paymentDueDate!, amount: a.balance }))
    ];

    recurringItemsForCalendar.forEach(item => {
      const dayOfMonth = parseInt(item.day);
      if (isNaN(dayOfMonth)) return;

      let nextPaymentDateThisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      let nextPaymentDateNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);

      const checkAndAdd = (date: Date) => {
        if (date >= today && date <= fiveDaysFromNow) {
          const dateStr = date.toISOString().split('T')[0];
          const isCreditCard = 'creditLimit' in item; // Differentiate account from recurring
          allUpcoming.push({
            id: `${isCreditCard ? 'credit' : 'recurring'}-${item.id}-${dateStr}`,
            date: dateStr,
            description: isCreditCard ? `${t('paymentFor')} ${item.name}` : item.name,
            amount: item.amount,
            currency: item.currency,
            type: isCreditCard ? 'credit_card' : 'recurring',
            transactionType: isCreditCard ? TransactionType.EXPENSE : item.type,
            daysUntil: getDaysUntil(dateStr, today),
          });
        }
      };

      checkAndAdd(nextPaymentDateThisMonth);
      if(nextPaymentDateThisMonth < today) {
         checkAndAdd(nextPaymentDateNextMonth);
      }
    });
    
    return allUpcoming
      .filter((event, index, self) => index === self.findIndex(e => e.id.startsWith(event.id.substring(0, event.id.lastIndexOf('-')))))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [accounts, debts, recurringTransactions, t, realToday]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().split('T')[0];
    return eventsMap.get(key) || [];
  }, [selectedDate, eventsMap]);
  
  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(viewingDate.getFullYear(), viewingDate.getMonth(), day));
  };
  
  useEffect(() => {
    if (window.innerWidth < 768 && selectedDateEvents.length > 0) {
        selectedEventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate, selectedDateEvents]);

  const startOfMonth = new Date(viewingDate.getFullYear(), viewingDate.getMonth(), 1);
  const endOfMonth = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prefixDays = Array.from({ length: startDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setViewingDate(new Date(viewingDate.getFullYear(), viewingDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewingDate(new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 1));
  };
  
  const getDayClass = (day: number) => {
    const d = new Date(viewingDate.getFullYear(), viewingDate.getMonth(), day);
    const dateKey = d.toISOString().split('T')[0];
    const isToday = d.toDateString() === realToday.toDateString();
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
  
  const getEventTypeStyling = (event: CalendarEvent) => {
      switch (event.type) {
          case 'debt': return { bar: 'bg-expense', text: 'text-expense' };
          case 'credit_card': return { bar: 'bg-primary', text: 'text-primary' };
          case 'recurring':
              return event.transactionType === TransactionType.INCOME
                  ? { bar: 'bg-income', text: 'text-income' }
                  : { bar: 'bg-accent', text: 'text-accent' };
          default: return { bar: 'bg-gray-400', text: 'text-text-secondary' };
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
                    {viewingDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
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
                        <div key={day} className={classes} onClick={() => handleDateClick(day)}>
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
                        const styling = getEventTypeStyling(event);
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

      <div ref={selectedEventsRef} className="mt-6">
        {selectedDate && (
          <Card>
            <h2 className="text-xl font-bold mb-4 text-text-main dark:text-text-main-dark">
              {t('events_on')} {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(event => {
                  const styling = getEventTypeStyling(event);
                  return (
                    <div key={event.id} className="flex items-center p-3 rounded-lg bg-secondary dark:bg-secondary-dark/50">
                      <div className={`w-1.5 h-10 rounded-full mr-3 ${styling.bar}`}></div>
                      <div className="flex-1">
                        <p className="font-semibold text-text-main dark:text-text-main-dark text-sm">{event.description}</p>
                        <p className={`font-medium text-xs ${styling.text}`}>{formatCurrency(event.amount, event.currency)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-text-secondary dark:text-text-secondary-dark">
                  <p className="text-sm">{t('no_events_on_date')}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

    </div>
  );
};

export default Calendar;
