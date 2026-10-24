import React from 'react';
import './Button.css'; // minimal inline styling can be defined here or rely on design system

function Button({ children, onClick, type = 'button', variant = 'primary', disabled }) {
  const baseClass = 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200';
  const variants = {
    primary: 'bg-violet text-white hover:bg-violet-light',
    secondary: 'bg-bg-card text-text-primary hover:bg-bg-card-hover',
    danger: 'bg-error text-white hover:bg-error-subtle',
    ghost: 'bg-transparent text-violet-light hover:bg-violet-subtle',
  };
  const className = `${baseClass} ${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  return (
    <button type={type} onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
