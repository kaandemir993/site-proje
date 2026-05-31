import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShieldAlert, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Ana Sayfa", testid: "nav-home" },
  { to: "/analizler", label: "Analizler", testid: "nav-analizler" },
  { to: "/reverse-engineering", label: "Reverse Engineering", testid: "nav-reverse" },
  { to: "/hakkimizda", label: "Hakkımızda", testid: "nav-about" },
  { to: "/iletisim", label: "İletişim", testid: "nav-contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{ background: "rgba(5, 11, 20, 0.78)", borderColor: "rgba(0,240,255,0.18)" }}
      data-testid="site-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo">
          <div className="relative">
            <ShieldAlert className="w-7 h-7 text-[#00F0FF]" strokeWidth={1.5} />
            <div className="absolute inset-0 blur-md bg-[#00F0FF]/40 -z-10" />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold text-lg tracking-wider text-white uppercase">CyberGuard</div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[#00F0FF]/80 mt-0.5">// LAB.v0.1</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={l.testid}
              className={({ isActive }) =>
                `px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
                  isActive ? "text-[#00F0FF]" : "text-[#A0AEC0] hover:text-[#00F0FF]"
                }`
              }
              style={({ isActive }) => isActive ? { textShadow: "0 0 12px rgba(0,240,255,0.6)" } : {}}
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to="/admin" className="ml-4 btn-neon" style={{ padding: "8px 16px" }} data-testid="nav-admin-dashboard">
                Panel
              </Link>
              <button onClick={handleLogout} className="ml-2 text-[#A0AEC0] hover:text-[#FF003C] p-2" data-testid="nav-logout">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="ml-4 btn-neon" style={{ padding: "8px 16px" }} data-testid="nav-admin-login">
              Admin
            </Link>
          )}
        </nav>

        <button className="lg:hidden text-[#00F0FF]" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t" style={{ borderColor: "rgba(0,240,255,0.18)", background: "#050B14" }}>
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                data-testid={`${l.testid}-mobile`}
                className={({ isActive }) =>
                  `py-3 px-2 font-mono text-sm uppercase tracking-wider ${
                    isActive ? "text-[#00F0FF]" : "text-[#A0AEC0]"
                  }`
                }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={handleLogout} className="btn-neon mt-3" data-testid="nav-logout-mobile">Çıkış</button>
            ) : (
              <Link to="/admin/login" onClick={() => setOpen(false)} className="btn-neon mt-3" data-testid="nav-admin-login-mobile">Admin Girişi</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
