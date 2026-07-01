type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
}: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-zinc-200">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-yellow-500"
      />
    </label>
  );
}
