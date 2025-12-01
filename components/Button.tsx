
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-fluor text-slate-900 hover:bg-white hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    secondary: "border border-slate-600 text-slate-300 hover:border-fluor hover:text-fluor bg-transparent",
    danger: "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    ghost: "text-slate-400 hover:text-white bg-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : children}
    </button>
  );
};
