'use client';

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function AddBookButton({ children = 'Add Book', icon = PlusIcon, ariaLabel, onClick, disabled, loading = false, className = '', style, ...props }) {
  const accessibleLabel = ariaLabel || props['aria-label'] || (typeof children === 'string' && children ? children : undefined);

  return (
    <button
      type="button"
      className={`add-book-cta ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={style}
      {...props}
      aria-label={accessibleLabel}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : icon}
      {children}
      <span className="sr-only" role="status" aria-live="polite">{loading ? 'Loading' : ''}</span>
    </button>
  );
}
