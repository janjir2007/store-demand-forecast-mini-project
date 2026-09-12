import { useMemo, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import { SegmentedControl } from "../ui/SegmentedControl";
import { formatNumber } from "../../lib/format";
import { SENSITIVITY_OPTIONS } from "../../lib/forecast";
import type { SensitivityKey } from "../../lib/forecast";
import type { ProductRollup } from "../../lib/analytics";
import type { RunStatus } from "../../hooks/useForecastRun";

export type ScopeKey = "10" | "25" | "50" | "custom";

export const SCOPE_OPTIONS: { value: ScopeKey; label: string }[] = [
  { value: "10", label: "Эхний 10" },
  { value: "25", label: "Эхний 25" },
  { value: "50", label: "Эхний 50" },
  { value: "custom", label: "Сонгож таамаглах" },
];

interface ForecastControlsProps {
  scope: ScopeKey;
  onScopeChange: (scope: ScopeKey) => void;
  sensitivity: SensitivityKey;
  onSensitivityChange: (sensitivity: SensitivityKey) => void;
  /** Products with sales history, already ranked by recent demand. */
  candidates: ProductRollup[];
  selected: number[];
  onSelectedChange: (ids: number[]) => void;
  targetCount: number;
  status: RunStatus;
  completed: number;
  total: number;
  onRun: () => void;
  onCancel: () => void;
  disabled: boolean;
}

export function ForecastControls({
  scope,
  onScopeChange,
  sensitivity,
  onSensitivityChange,
  candidates,
  selected,
  onSelectedChange,
  targetCount,
  status,
  completed,
  total,
  onRun,
  onCancel,
  disabled,
}: ForecastControlsProps) {
  const [search, setSearch] = useState("");
  const running = status === "running";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = term
      ? candidates.filter((entry) => entry.name.toLowerCase().includes(term))
      : candidates;
    return matches.slice(0, 80);
  }, [candidates, search]);

  function toggle(productId: number) {
    onSelectedChange(
      selected.includes(productId)
        ? selected.filter((id) => id !== productId)
        : [...selected, productId],
    );
  }

  return (
    <Card>
      <div className="forecast-controls">
        <div className="field">
          <span className="field__label">Таамаглах бүтээгдэхүүн</span>
          <SegmentedControl
            ariaLabel="Аль бүтээгдэхүүнийг таамаглах"
            value={scope}
            onChange={onScopeChange}
            segments={SCOPE_OPTIONS}
          />
        </div>

        <div className="field">
          <span className="field__label" title="Зөвхөн шошгыг өөрчилнө, таамаглалыг өөрчлөхгүй">
            Эрэлтийн мэдрэмж
          </span>
          <SegmentedControl
            ariaLabel="Эрэлтийг өндөр эсвэл бага гэж үзэх босго"
            value={sensitivity}
            onChange={onSensitivityChange}
            segments={SENSITIVITY_OPTIONS.map((option) => ({ ...option }))}
          />
        </div>

        <div className="forecast-controls__action">
          {running ? (
            <Button variant="secondary" onClick={onCancel}>
              Цуцлах
            </Button>
          ) : (
            <Button variant="primary" onClick={onRun} disabled={disabled || targetCount === 0}>
              Таамаг гаргах ({formatNumber(targetCount)})
            </Button>
          )}
        </div>
      </div>

      {scope === "custom" && (
        <div className="forecast-picker">
          <div className="forecast-picker__head">
            <TextField
              className="field--compact"
              value={search}
              placeholder="Бүтээгдэхүүн хайх…"
              aria-label="Таамаглах бүтээгдэхүүн хайх"
              onChange={(event) => setSearch(event.target.value)}
            />
            <span className="forecast-picker__count">
              {formatNumber(selected.length)} сонгосон
            </span>
            {selected.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => onSelectedChange([])}>
                Цэвэрлэх
              </Button>
            )}
          </div>

          <ul className="forecast-picker__list">
            {filtered.map((entry) => (
              <li key={entry.productId}>
                <label className="forecast-picker__item">
                  <input
                    type="checkbox"
                    checked={selected.includes(entry.productId)}
                    onChange={() => toggle(entry.productId)}
                    disabled={running}
                  />
                  <span className="forecast-picker__name">{entry.name}</span>
                  <span className="forecast-picker__units">
                    {formatNumber(entry.quantity)} ширхэг зарагдсан
                  </span>
                </label>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="forecast-picker__empty">Хайлтад тохирох бүтээгдэхүүн олдсонгүй.</li>
            )}
          </ul>
        </div>
      )}

      {running && (
        <div className="forecast-progress" role="status" aria-live="polite">
          <div className="forecast-progress__bar">
            <div
              className="forecast-progress__fill"
              style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
            />
          </div>
          <span className="forecast-progress__label">
            Таамаглал гаргаж байна — {formatNumber(total)}-аас {formatNumber(completed)}
          </span>
        </div>
      )}
    </Card>
  );
}
