import React from "react";
import { Github, Twitter, Mail, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="mt-20 border-t"
      style={{ borderColor: "rgba(0,240,255,0.18)", background: "#040810" }}
      data-testid="site-footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#00F0FF]" strokeWidth={1.5} />
            <div className="font-display font-bold text-xl uppercase tracking-wider">CyberGuard</div>
          </div>
          <p className="mt-3 text-sm text-[#A0AEC0] leading-relaxed max-w-sm">
            Zararlı yazılım ve bootkit analizine adanmış teknik araştırma laboratuvarı.
          </p>
        </div>
        <div>
          <div className="label-overline mb-3">// İletişim</div>
          <div className="flex gap-3">
            <a href="mailto:info@cyberguard.lab" className="p-2 neon-border" data-testid="footer-mail">
              <Mail className="w-4 h-4 text-[#00F0FF]" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 neon-border" data-testid="footer-github">
              <Github className="w-4 h-4 text-[#00F0FF]" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 neon-border" data-testid="footer-twitter">
              <Twitter className="w-4 h-4 text-[#00F0FF]" />
            </a>
          </div>
        </div>
        <div>
          <div className="label-overline mb-3">// Sistem Durumu</div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00FF66]">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] inline-block pulse-glow" />
            ALL_SYSTEMS_OPERATIONAL
          </div>
          <div className="mt-3 font-mono text-xs text-[#718096]">
            © {new Date().getFullYear()} CyberGuard Lab. // Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
}
