import { motion } from "framer-motion";

export default function NeoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* animated orbs */}
      <Orb x="10%" y="20%" size={520} from="#0ea5e9" to="#6366f1" delay={0} />
      <Orb x="70%" y="30%" size={620} from="#22c55e" to="#06b6d4" delay={1.2} />
      <Orb x="40%" y="70%" size={560} from="#f97316" to="#ef4444" delay={0.6} />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,.65))]" />
    </div>
  );
}

function Orb({ x, y, size, from, to, delay = 0 }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.6 }}
      animate={{ scale: [0.9, 1.05, 0.95, 1], opacity: [0.6, 0.85, 0.7, 0.8] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        translateX: "-50%",
        translateY: "-50%",
        background: `radial-gradient(circle at 30% 30%, ${from}, transparent 60%), radial-gradient(circle at 70% 70%, ${to}, transparent 60%)`,
        filter: "blur(40px)",
      }}
      className="absolute rounded-full opacity-70"
    />
  );
}
