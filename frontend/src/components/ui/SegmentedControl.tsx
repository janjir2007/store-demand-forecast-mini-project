export interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {segments.map((segment) => (
        <button
          key={segment.value}
          type="button"
          className={`segmented__item ${segment.value === value ? "is-active" : ""}`}
          aria-pressed={segment.value === value}
          onClick={() => onChange(segment.value)}
        >
          {segment.label}
        </button>
      ))}
    </div>
  );
}
