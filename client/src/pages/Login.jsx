import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Spinner from "../components/Spinner";
import AuthArt from "../components/AuthArt";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErr, setFieldErr] = useState({ email: "", password: "" });
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const next = { email: "", password: "" };
    if (!email.trim()) next.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Password is required.";
    if (password && password.length < 6)
      next.password = "Minimum 6 characters.";
    setFieldErr(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalErr("");
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Login failed. Check your credentials.";
      setGlobalErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
          <p className="text-gray-600 mt-1">
            Log in to continue tracking your budget.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  fieldErr.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {fieldErr.email ? (
                <p className="mt-1 text-xs text-red-600">{fieldErr.email}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  fieldErr.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {fieldErr.password ? (
                <p className="mt-1 text-xs text-red-600">{fieldErr.password}</p>
              ) : null}
            </div>

            {globalErr ? (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {globalErr}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Spinner className="text-white" /> : null}
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Animated right side */}
      <AuthArt
        title="Budget Smarter, Live Better"
        subtitle="Visual insights, clear categories, and effortless control."
        gradient={["#2563eb", "#7c3aed"]}
      />
    </div>
  );
}
