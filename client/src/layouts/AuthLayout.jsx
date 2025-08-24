import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel (branding / message) */}
      <div className="hidden lg:flex items-center justify-center border-r border-gray-200 px-12">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-3">Budgeting Website</h1>
          <p className="text-gray-600">
            Track income & expenses, categorize spending, and stay on top of
            your budget. Clean, fast, and built with React + MongoDB.
          </p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{title}</h2>
            {subtitle ? <p className="text-gray-600 mt-1">{subtitle}</p> : null}
          </div>

          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            {children}
          </div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-gray-700">
              {footer}
            </div>
          ) : null}

          {/* Minimal footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Budgeting Website. All rights
            reserved. <Link to="/" className="underline"></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
