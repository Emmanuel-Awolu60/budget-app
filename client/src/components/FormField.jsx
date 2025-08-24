export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  error,
  autoComplete = "on",
}) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 text-sm">{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
