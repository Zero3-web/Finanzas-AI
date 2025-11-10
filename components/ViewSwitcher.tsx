import React from 'react';

interface SwitcherOption {
  value: string;
  icon: React.ReactNode;
}

interface ViewSwitcherProps {
  options: [SwitcherOption, SwitcherOption];
  value: string;
  onChange: (value: string) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ options, value, onChange }) => {
  const selectedIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className="relative flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 w-full max-w-xs mx-auto">
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full transition-transform duration-300 ease-in-out shadow-lg"
        style={{ transform: `translateX(${selectedIndex * 100}%)` }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className="relative z-10 w-1/2 flex justify-center items-center p-2 rounded-full"
          aria-label={`Switch to ${option.value} view`}
        >
          <div className={`transition-colors duration-300 ${value === option.value ? 'text-white' : 'text-text-secondary dark:text-gray-400'}`}>
            {option.icon}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
