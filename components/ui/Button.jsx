'use client';

export function Button({ variant = 'save', children, onClick, disabled, loading = false, type = 'button', className = '', autoFocus }) {
  return (
    <button
      type={type}
      className={`bd-btn bd-btn-${variant} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      autoFocus={autoFocus}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
      <span className="sr-only" role="status" aria-live="polite">{loading ? 'Loading' : ''}</span>
    </button>
  );
}
