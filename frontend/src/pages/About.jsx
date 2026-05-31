import React from "react";
import { ShieldAlert, Cpu, Bug, Code2 } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16" data-testid="about-page">
      <div className="label-overline">// LAB_DOSSIER</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mt-3 text-white">
        Hakkı<span className="neon-text">mızda</span>
      </h1>
      <p className="mt-6 text-lg text-[#A0AEC0] leading-relaxed max-w-3xl">
        CyberGuard, sıfırıncı gün tehditlerini, bootkit'leri ve gelişmiş kalıcı tehdit (APT) gruplarının
        kullandığı zararlı yazılımları parçalamaya adanmış bağımsız bir araştırma laboratuvarıdır.
        Düşük seviye sistem bilgisi gerektiren teknik analizleri, herkesin erişebileceği bir formatta sunmayı amaçlıyoruz.
      </p>

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        {[
          { icon: ShieldAlert, title: "MİSYON", body: "Düşük seviye tehditleri tersine mühendislik ile çözüp savunma topluluğuyla paylaşmak." },
          { icon: Cpu, title: "ODAK ALANLARI", body: "BIOS, UEFI ve MBR seviyesinde çalışan bootkit'ler ile firmware tabanlı saldırı vektörleri." },
          { icon: Bug, title: "METODOLOJİ", body: "Statik analiz (IDA, Ghidra, radare2) + dinamik sandbox + bellek dökümü incelemesi." },
          { icon: Code2, title: "ÇIKTI", body: "Açık kaynak teknik raporlar, YARA kuralları ve eğitici Assembly seviyesi yazılar." },
        ].map((c, i) => (
          <div key={i} className="glow-card p-8" data-testid={`about-card-${i}`}>
            <c.icon className="w-7 h-7 text-[#00F0FF]" strokeWidth={1.5} />
            <h3 className="font-display font-bold text-xl uppercase tracking-wider mt-4 text-white">{c.title}</h3>
            <p className="mt-3 text-[#A0AEC0] text-sm leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 border-l-2 border-[#00F0FF]" style={{ background: "rgba(10,17,40,0.5)" }}>
        <div className="label-overline">// MANIFESTO</div>
        <blockquote className="mt-3 font-display text-xl md:text-2xl text-white leading-snug">
          "Bir sistemi gerçekten korumak istiyorsan, önce onu nasıl yıkacağını bil. Sonra parçaları topla."
        </blockquote>
      </div>
    </div>
  );
}
