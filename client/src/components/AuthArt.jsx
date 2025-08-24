import { motion } from "framer-motion";

export default function AuthArt({
  title = "Budget Smarter, Live Better",
  subtitle = "Track every naira with clarity.",
  gradient = ["#1e3a8a", "#6d28d9"], // deep blue → deep purple
}) {
  return (
    <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
      {/* Animated gradient background blob */}
      <motion.div
        initial={{ scale: 0.9, rotate: 0 }}
        animate={{ scale: [0.9, 1.05, 0.95, 1], rotate: [0, 8, -6, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(700px 500px at 50% 50%, ${gradient[0]}AA, transparent 70%), radial-gradient(700px 500px at 20% 20%, ${gradient[1]}AA, transparent 70%)`,
        }}
        className="absolute inset-0"
      />

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 p-10 text-center">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="mt-4 text-lg text-gray-100 drop-shadow">{subtitle}</p>

        {/* Floating budget cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatCard delay={0} label="Balance" value="₦145,400" />
          <FloatCard delay={0.2} label="This Week" value="−₦12,900" negative />
          <FloatCard delay={0.4} label="Food" value="−₦4,500" negative />
          <FloatCard delay={0.6} label="Transport" value="−₦2,200" negative />
        </div>
      </div>
    </div>
  );
}

function FloatCard({ label, value, negative = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0.0 }}
      animate={{ y: [20, -6, 0], opacity: 1 }}
      transition={{ delay, duration: 1.2, ease: "easeOut" }}
      className="rounded-2xl bg-white/20 backdrop-blur px-5 py-4 shadow-lg border border-white/30"
    >
      <div className="text-sm text-white/90 font-medium">{label}</div>
      <div
        className={`text-xl font-bold ${
          negative ? "text-red-200" : "text-emerald-200"
        }`}
      >
        {value}
      </div>
    </motion.div>
  );
}
