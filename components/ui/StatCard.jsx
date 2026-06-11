'use client';

export function StatCard({ value, label, isGenre = false }) {
  return (
    <div className="stat-card">
      {isGenre
        ? <div className="stat-genre">{value}</div>
        : <div className="stat-number">{value}</div>
      }
      <div className="stat-label">{label}</div>
    </div>
  );
}
