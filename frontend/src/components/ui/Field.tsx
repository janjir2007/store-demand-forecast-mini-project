import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { useId } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextField({ label, className = "", ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="input" {...rest} />
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function SelectField({ label, options, placeholder, className = "", ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className="select" {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
