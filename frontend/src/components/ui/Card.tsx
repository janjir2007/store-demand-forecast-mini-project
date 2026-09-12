import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ title, subtitle, actions, flush = false, className = "", children }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card__header">
          <div className="card__titles">
            {title && <h2>{title}</h2>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className={`card__body ${flush ? "card__body--flush" : ""}`}>{children}</div>
    </section>
  );
}
