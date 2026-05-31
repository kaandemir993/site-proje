import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Lock } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/admin", { replace: true });
  }, [user, loading, navigate]);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="glow-card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full neon-border pulse-glow mb-6">
              <Lock className="w-7 h-7 text-[#00F0FF]" strokeWidth={1.5} />
            </div>
            <div className="label-overline">// SECURED_AREA</div>
            <h1 className="font-display font-bold text-3xl uppercase mt-2 text-white">Yönetim Paneli</h1>
            <p className="mt-3 text-sm text-[#A0AEC0] leading-relaxed">
              Bu alana erişim kısıtlıdır. Google hesabınızla kimlik doğrulayın.
            </p>

            <button onClick={handleLogin} className="btn-neon btn-neon-solid w-full mt-8" data-testid="google-login-btn">
              <ShieldAlert className="w-4 h-4" /> Google ile Giriş Yap
            </button>

            <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#718096]">
              // AUTH_PROVIDER: emergent_oauth_v1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
