import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Activity, Cpu, ShieldCheck, Binary } from "lucide-react";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/b12f44d0-2072-41a7-a06a-bbb4ddc4bfa9/images/95150e3f945193a379f51abc0799e50707e173f475d381757d05563f76d8ce7b.png";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await api.post("/seed").catch(() => {});
        const [pRes, fRes] = await Promise.all([
          api.get("/posts"),
          api.get("/posts/featured"),
        ]);
        setPosts(pRes.data);
        setFeatured(fRes.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const otherPosts = posts.filter((p) => !featured || p.id !== featured.id).slice(0, 5);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,11,20,0.6) 0%, #050B14 100%)" }} />
          <div className="absolute inset-0 hero-radial" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-32">
          <div className="label-overline fade-in">// CYBER_DEFENSE_LAB / v0.1.0</div>
          <h1 className="font-display font-bold uppercase tracking-tight mt-4 text-white fade-in delay-100"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)", lineHeight: 1.02, maxWidth: "20ch" }}>
            Zararlı Yazılım ve <span className="neon-text">Bootkit</span> Analiz Laboratuvarı
          </h1>
          <p className="mt-6 text-base md:text-lg text-[#A0AEC0] max-w-2xl leading-relaxed fade-in delay-200 terminal-cursor">
            BIOS, MBR ve UEFI seviyesinde çalışan tehditleri tersine mühendislik ile parçalıyor; davranışsal analizler ve Assembly seviyesi kod incelemeleri yayınlıyoruz
          </p>

          <div className="mt-10 flex flex-wrap gap-4 fade-in delay-300">
            <Link to="/analizler" className="btn-neon btn-neon-solid" data-testid="cta-analizler">
              Analizleri Keşfet
            </Link>
            <Link to="/reverse-engineering" className="btn-neon" data-testid="cta-reverse">
              Reverse Engineering
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px fade-in delay-400"
               style={{ background: "rgba(0,240,255,0.15)" }}>
            {[
              { icon: Activity, label: "Aktif Analiz", val: posts.filter(p=>p.category==='analiz').length || 0 },
              { icon: Cpu, label: "Bootkit Vakası", val: posts.filter(p=>p.category==='bootkit').length || 0 },
              { icon: Binary, label: "Reverse Eng.", val: posts.filter(p=>p.category==='reverse').length || 0 },
              { icon: ShieldCheck, label: "Lab Durumu", val: "ONLINE" },
            ].map((s, i) => (
              <div key={i} className="p-6 bg-[#0A1128]/90 flex items-center gap-4" data-testid={`stat-${i}`}>
                <s.icon className="w-6 h-6 text-[#00F0FF]" strokeWidth={1.5} />
                <div>
                  <div className="font-display font-bold text-2xl text-white">{s.val}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718096] mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED + GRID */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20" data-testid="posts-section">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="label-overline">// PRIORITY_THREATS</div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl uppercase mt-2 text-white">
              Öncelikli <span className="neon-text">Tehdit</span> Kategorileri
            </h2>
          </div>
          <Link to="/analizler" className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#00F0FF] hover:underline" data-testid="see-all-link">
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {featured && <PostCard post={featured} featured />}
          {otherPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      {/* SECTIONS PROMO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid md:grid-cols-2 gap-6">
        <Link to="/analizler" className="glow-card p-8 group" data-testid="promo-analizler">
          <div className="label-overline">// 01 / SECTION</div>
          <h3 className="font-display font-bold text-2xl uppercase mt-3 group-hover:text-[#00F0FF] transition-colors">Analizler</h3>
          <p className="mt-3 text-[#A0AEC0] text-sm leading-relaxed">
            Virüs davranışları, sistem üzerindeki izleri ve ekran görüntüleriyle desteklenmiş zengin bir blog arşivi.
          </p>
        </Link>
        <Link to="/reverse-engineering" className="glow-card p-8 group" data-testid="promo-reverse">
          <div className="label-overline">// 02 / SECTION</div>
          <h3 className="font-display font-bold text-2xl uppercase mt-3 group-hover:text-[#00F0FF] transition-colors">Reverse Engineering</h3>
          <p className="mt-3 text-[#A0AEC0] text-sm leading-relaxed">
            Derinlemesine kod analizleri ve renkli Assembly kod blokları ile düşük seviyeli teknik dosyalar.
          </p>
        </Link>
      </section>
    </div>
  );
}
