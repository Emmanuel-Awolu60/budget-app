import { useState } from "react";

export default function PasswordField({
  label = "Password",
  value,
  onChange,
  name = "password",
  placeholder = "Enter your password",
  error,
  autoComplete = "current-password",
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
