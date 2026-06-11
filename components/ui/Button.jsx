'use client';

export function Button({ variant = 'save', children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      className={`bd-btn bd-btn-${variant} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
