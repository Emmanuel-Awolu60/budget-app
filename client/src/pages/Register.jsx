import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Spinner from "../components/Spinner";
import AuthArt from "../components/AuthArt";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErr, setFieldErr] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const next = { name: "", email: "", password: "" };
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Password is required.";
    if (password && password.length < 6)
      next.password = "Minimum 6 characters.";
    setFieldErr(next);
    return !next.name && !next.email && !next.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalErr("");
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Registration failed. Try again.";
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
          <h2 className="text-2xl font-bold text-gray-800">
            Create your account
          </h2>
          <p className="text-gray-600 mt-1">
            Register to start budgeting smarter.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="block text-sm text-gray-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErr.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Awolu Emmanuel Oluwapelumi"
                autoComplete="name"
              />
              {fieldErr.name ? (
                <p className="mt-1 text-xs text-red-600">{fieldErr.name}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500 ${
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
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErr.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Create a password"
                autoComplete="new-password"
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? <Spinner className="text-white" /> : null}
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Animated right side */}
      <AuthArt
        title="Track Every Naira"
        subtitle="Categories, insights, and control in one place."
        gradient={["#059669", "#0ea5e9"]} // emerald → sky
      />
    </div>
  );
}
