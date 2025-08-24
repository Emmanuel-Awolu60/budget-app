import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { saveToken } from "../utils/auth";
import AuthArt from "../components/AuthArt";
import Spinner from "../components/Spinner";

export default function Register() {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ui state
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [globalErr, setGlobalErr] = useState("");

  function validate() {
    const e = { name: "", email: "", password: "", confirm: "" };
    if (!name.trim()) e.name = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Minimum 6 characters.";
    if (confirm !== password) e.confirm = "Passwords do not match.";
    setFieldErr(e);
    return !e.name && !e.email && !e.password && !e.confirm;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setGlobalErr("");
    if (!validate()) return;
    setLoading(true);

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
      });
      saveToken(data.token);

      // optional: save user info
      if (data.user) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch {}
      }

      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Registration failed. Try again.";
      setGlobalErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/70 border border-white/6 rounded-2xl p-8 shadow-lg backdrop-blur">
            <h2 className="text-3xl font-extrabold text-white">
              Create Account
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Join us and start managing your budget smarter.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="block text-sm text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className={`mt-1 w-full rounded-xl px-4 py-3 bg-slate-800 border ${
                    fieldErr.name ? "border-rose-500" : "border-white/10"
                  } text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="John Doe"
                />
                {fieldErr.name && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErr.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className={`mt-1 w-full rounded-xl px-4 py-3 bg-slate-800 border ${
                    fieldErr.email ? "border-rose-500" : "border-white/10"
                  } text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {fieldErr.email && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErr.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-300">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    className={`w-full rounded-xl px-4 py-3 bg-slate-800 border ${
                      fieldErr.password ? "border-rose-500" : "border-white/10"
                    } text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-300 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {fieldErr.password && (
                  <p className="text-xs text-rose-400 mt-1">
                    {fieldErr.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-slate-300">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(ev) => setConfirm(ev.target.value)}
                  className={`mt-1 w-full rounded-xl px-4 py-3 bg-slate-800 border ${
                    fieldErr.confirm ? "border-rose-500" : "border-white/10"
                  } text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="••••••••"
                />
                {fieldErr.confirm && (
                  <p className="text-xs text-rose-400 mt-1">
                    {fieldErr.confirm}
                  </p>
                )}
              </div>

              {/* Global error */}
              {globalErr && (
                <div className="rounded-md bg-rose-900/40 px-3 py-2 text-sm text-rose-200 border border-rose-800">
                  {globalErr}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 text-white font-semibold hover:brightness-110 disabled:opacity-60"
              >
                {loading ? <Spinner className="text-white" /> : null}
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: animated art */}
      <AuthArt
        title="Your Money, Your Power"
        subtitle="Track spending, plan better, and take control of your future."
        gradient={["#22d3ee", "#3b82f6"]}
      />
    </div>
  );
}
