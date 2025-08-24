export default function StatPill({ label, value, accent = "blue" }) {
  const map = {
    blue: "from-blue-500/30 to-indigo-500/30 text-blue-200",
    green: "from-emerald-500/30 to-teal-500/30 text-emerald-200",
    red: "from-rose-500/30 to-orange-500/30 text-rose-200",
  };
  return (
    <div className="relative">
      <div
        className={`absolute -inset-0.5 blur-lg bg-gradient-to-r ${map[accent]} opacity-35`}
      />
      <div className="relative rounded-2xl bg-slate-900/70 border border-white/10 px-5 py-4">
        <div className="text-xs uppercase tracking-wider text-slate-300">
          {label}
        </div>
        <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
