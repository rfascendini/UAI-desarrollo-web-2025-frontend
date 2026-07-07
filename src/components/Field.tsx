import { useId } from 'react';

type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string[];
};

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
  error,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const firstError = error?.[0];
  const hasError = Boolean(firstError);

  return (
    <label className="block text-sm font-semibold text-zinc-200" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full rounded border bg-zinc-900 px-3 py-2 text-white outline-none focus:border-yellow-500 ${
          hasError ? 'border-red-500' : 'border-zinc-700'
        }`}
      />
      {hasError && (
        <span id={errorId} className="mt-1 block text-xs font-medium text-red-300">
          {firstError}
        </span>
      )}
    </label>
  );
}
