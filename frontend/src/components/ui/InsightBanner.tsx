import type { Insight } from "../../lib/insights";

interface InsightBannerProps {
  insights: Insight[];
  /** Small uppercase label above the headline. */
  eyebrow?: string;
}

/**
 * Visually distinct summary of what changed. Renders nothing when the data
 * does not support an insight — an empty banner is better than a made-up one.
 */
export function InsightBanner({ insights, eyebrow = "Бизнесийн дүгнэлт" }: InsightBannerProps) {
  if (!insights.length) return null;
  const [lead, ...rest] = insights;

  return (
    <section className={`insight-banner insight-banner--${lead.tone}`} aria-label="Бизнесийн дүгнэлт">
      <div className="insight-banner__lead">
        <span className="insight-banner__eyebrow">{eyebrow}</span>
        <p className="insight-banner__title">{lead.title}</p>
        <p className="insight-banner__detail">{lead.detail}</p>
      </div>
      {rest.length > 0 && (
        <ul className="insight-banner__more">
          {rest.map((insight) => (
            <li key={insight.id} className={`insight-banner__item insight-banner__item--${insight.tone}`}>
              <span className="insight-banner__item-title">{insight.title}</span>
              <span className="insight-banner__item-detail">{insight.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InsightBannerSkeleton() {
  return (
    <section className="insight-banner insight-banner--neutral">
      <div className="insight-banner__lead">
        <span className="skeleton" style={{ display: "block", width: 110, height: 10 }} />
        <span className="skeleton" style={{ display: "block", width: 260, height: 16, marginTop: 10 }} />
        <span className="skeleton" style={{ display: "block", width: 340, height: 11, marginTop: 8 }} />
      </div>
    </section>
  );
}
