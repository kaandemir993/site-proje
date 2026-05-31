import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/admin/login");
      return;
    }
    const session_id = match[1];

    (async () => {
      try {
        const r = await api.post("/auth/session", { session_id });
        setUser(r.data.user);
        navigate("/admin", { replace: true });
      } catch (e) {
        console.error("Auth callback failed", e);
        navigate("/admin/login", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050B14]">
      <div className="text-center">
        <div className="label-overline mb-4">// Yetkilendiriliyor</div>
        <div className="font-display text-3xl text-[#00F0FF] terminal-cursor">
          KİMLİK DOĞRULANIYOR
        </div>
      </div>
    </div>
  );
}
