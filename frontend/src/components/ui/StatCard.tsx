import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  foot?: ReactNode;
}

export function StatCard({ label, value, foot }: StatCardProps) {
  return (
    <div className="card stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
      {foot && <span className="stat__foot">{foot}</span>}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card stat">
      <span className="skeleton" style={{ width: 90, height: 10 }} />
      <span className="skeleton" style={{ width: 120, height: 26 }} />
      <span className="skeleton" style={{ width: 70, height: 10 }} />
    </div>
  );
}
