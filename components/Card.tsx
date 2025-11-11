import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div className={`bg-surface dark:bg-surface-dark rounded-2xl shadow-sm p-6 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;