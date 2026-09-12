import { SegmentedControl } from "../ui/SegmentedControl";
import { SelectField } from "../ui/Field";
import { formatMonth } from "../../lib/format";
import { PERIOD_OPTIONS } from "../../lib/period";
import type { CustomRange, PeriodKey } from "../../lib/period";

interface PeriodFilterProps {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  custom: CustomRange;
  onCustomChange: (custom: CustomRange) => void;
  /** Months present in the data, oldest first. */
  months: string[];
  disabled?: boolean;
}

export function PeriodFilter({
  period,
  onPeriodChange,
  custom,
  onCustomChange,
  months,
  disabled = false,
}: PeriodFilterProps) {
  const options = [...months].reverse().map((month) => ({ value: month, label: formatMonth(month) }));

  return (
    <div className="period-filter">
      <div className="field">
        <span className="field__label">Хугацаа</span>
        <SegmentedControl
          ariaLabel="Борлуулалтын хугацаа"
          value={period}
          onChange={onPeriodChange}
          segments={PERIOD_OPTIONS}
        />
      </div>

      {period === "custom" && (
        <div className="period-filter__range">
          <SelectField
            label="Эхлэх сар"
            value={custom.from}
            disabled={disabled}
            onChange={(event) => onCustomChange({ ...custom, from: event.target.value })}
            options={options}
          />
          <SelectField
            label="Дуусах сар"
            value={custom.to}
            disabled={disabled}
            onChange={(event) => onCustomChange({ ...custom, to: event.target.value })}
            options={options}
          />
        </div>
      )}
    </div>
  );
}
