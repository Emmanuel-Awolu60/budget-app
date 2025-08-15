export default function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded p-2"
      />
    </div>
  );
}
