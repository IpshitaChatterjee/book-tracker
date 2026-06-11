'use client';

const StarFill = () => (
  <svg className="star-icon star-fill" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
    viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarEmpty = () => (
  <svg className="star-icon star-empty" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export function StarRating({ rating, max = 5 }) {
  if (!rating) return null;
  return (
    <div className="bd-stars" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) =>
        i < rating ? <StarFill key={i} /> : <StarEmpty key={i} />
      )}
    </div>
  );
}
