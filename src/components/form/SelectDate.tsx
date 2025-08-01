import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
  required?: boolean;
}

const SelectDate: React.FC<SelectProps> = ({
  options,
  // placeholder = "Select an option",
  onChange,
  className = "",
  value = "",
  required = false,
}) => {
  return (
    <select
      required={required}
      className={`shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${value ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"} ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {/* <option
        value=""
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option> */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectDate;
