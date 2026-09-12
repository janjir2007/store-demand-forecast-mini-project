import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  width?: number | string;
  sortable?: boolean;
  render: (row: T, index: number) => ReactNode;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  caption?: string;
  sort?: SortState | null;
  /** Supplying this turns `sortable` columns into buttons. */
  onSortChange?: (key: string) => void;
}

export function DataTable<T>({ columns, rows, rowKey, caption, sort, onSortChange }: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => {
              const sortable = column.sortable && onSortChange;
              const active = sort?.key === column.key;
              return (
                <th
                  key={column.key}
                  className={column.align === "right" ? "num" : undefined}
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                >
                  {sortable ? (
                    <button
                      type="button"
                      className={`th-sort ${active ? "is-active" : ""}`}
                      onClick={() => onSortChange(column.key)}
                    >
                      {column.header}
                      <span className="th-sort__arrow" aria-hidden="true">
                        {active ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} className={column.align === "right" ? "num" : undefined}>
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function TablePager({ page, pageSize, total, onChange }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="table-foot">
      <span>
        {from}–{to} / нийт {total}
      </span>
      <div className="table-foot__pager">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          type="button"
        >
          Өмнөх
        </button>
        <span>
          {page + 1} / {pages}
        </span>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onChange(page + 1)}
          disabled={page + 1 >= pages}
          type="button"
        >
          Дараах
        </button>
      </div>
    </div>
  );
}
