
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface CurrentDateContextType {
  currentDate: Date;
  isLoading: boolean;
}

const CurrentDateContext = createContext<CurrentDateContextType>({
  currentDate: new Date(),
  isLoading: true,
});

export const useCurrentDate = () => useContext(CurrentDateContext);

export const CurrentDateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentDate = async () => {
      try {
        const response = await fetch('https://worldtimeapi.org/api/ip');
        if (!response.ok) {
          throw new Error('Failed to fetch time from API');
        }
        const data = await response.json();
        setCurrentDate(new Date(data.datetime));
      } catch (error) {
        console.error("Could not fetch real date from API, falling back to system date.", error);
        setCurrentDate(new Date());
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentDate();
  }, []);

  const value = { currentDate, isLoading };

  return (
    <CurrentDateContext.Provider value={value}>
      {children}
    </CurrentDateContext.Provider>
  );
};
