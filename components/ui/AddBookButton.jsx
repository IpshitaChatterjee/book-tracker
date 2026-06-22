'use client';

export function AddBookButton({ children = 'Add Book', onClick, disabled, className = '', style, ...props }) {
  return (
    <button
      type="button"
      className={`add-book-cta ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {children}
    </button>
  );
}
