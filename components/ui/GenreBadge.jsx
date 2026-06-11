'use client';

export function GenreBadge({ genre }) {
  if (!genre) return null;
  return <span className="genre-badge">{genre}</span>;
}
