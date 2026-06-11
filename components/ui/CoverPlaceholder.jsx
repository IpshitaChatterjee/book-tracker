'use client';

export function CoverPlaceholder() {
  return (
    <div className="cover-placeholder">
      <img className="cover-placeholder-light" src="/cover-placeholder-light.png" alt="" aria-hidden="true" />
      <img className="cover-placeholder-dark" src="/cover-placeholder-dark.png" alt="" aria-hidden="true" />
    </div>
  );
}
