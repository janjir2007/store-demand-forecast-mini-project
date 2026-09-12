import type { ReactNode } from "react";
import { Button } from "./Button";
import { IconAlert, IconEmpty, IconRefresh } from "./Icons";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <span className="state__icon state__icon--error">
        <IconAlert />
      </span>
      <p className="state__title">Мэдээлэл ачаалж чадсангүй</p>
      <p className="state__desc">{message}</p>
      {onRetry && (
        <div className="state__action">
          <Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={onRetry}>
            Дахин оролдох
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Мэдээлэл байхгүй байна",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      <span className="state__icon">
        <IconEmpty />
      </span>
      <p className="state__title">{title}</p>
      {description && <p className="state__desc">{description}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-stack" aria-busy="true" aria-label="Ачааллаж байна">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} className="skeleton" style={{ height: 14, width: `${100 - index * 7}%` }} />
      ))}
    </div>
  );
}

export function LoadingChart({ short = false }: { short?: boolean }) {
  return (
    <div className={`chart ${short ? "chart--short" : ""}`} aria-busy="true" aria-label="График ачааллаж байна">
      <span className="skeleton" style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

interface AsyncSectionProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}

/** One place to resolve the loading / error / empty / ready decision. */
export function AsyncSection({
  loading,
  error,
  onRetry,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  skeleton,
  children,
}: AsyncSectionProps) {
  if (loading) return <>{skeleton ?? <LoadingRows />}</>;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children}</>;
}
