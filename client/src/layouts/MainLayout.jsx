// src/layouts/MainLayout.jsx
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, Settings } from "lucide-react";
import { clearToken } from "../utils/auth";

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static inset-y-0 left-0 w-64 bg-slate-800/60 border-r border-white/10 backdrop-blur-xl flex flex-col transform transition-transform duration-200 z-40`}
      >
        <div className="p-6 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-transparent bg-clip-text">
          BudgetX
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/categories", label: "Categories" },
            { to: "/transactions", label: "Transactions" },
            { to: "/reports", label: "Reports" },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2 ${
                  isActive
                    ? "bg-slate-700/60 text-indigo-300 font-semibold"
                    : "hover:bg-slate-700/30"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* topbar */}
        <header className="flex items-center justify-between gap-3 p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="md:hidden p-2 rounded-lg bg-slate-800 border border-white/10"
            >
              <Menu size={18} />
            </button>
            {/* <div className="text-lg font-bold hidden md:block">BudgetX</div> */}
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg border border-white/10 hover:bg-slate-700/40 text-sm">
              <User size={18} /> {user?.email || user?.name || "Account"}
            </button>
            <button className="p-2 rounded-lg bg-slate-800/60 border border-white/10 hover:bg-slate-700/40">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* content wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
