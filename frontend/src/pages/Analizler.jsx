import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import PostCard from "@/components/PostCard";

export default function Analizler() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const r = await api.get("/posts");
      setPosts(r.data.filter((p) => p.category !== "reverse"));
    })();
  }, []);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="analizler-page">
      <div className="label-overline">// THREAT_ANALYSIS_INDEX</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mt-3 text-white">
        Zararlı Yazılım <span className="neon-text">Analizleri</span>
      </h1>
      <p className="mt-4 text-[#A0AEC0] max-w-2xl">
        Virüslerin yayılma vektörleri, sistem üzerindeki davranışları ve laboratuvarımızda yakalanan canlı örnekleri.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { id: "all", label: "TÜMÜ" },
          { id: "bootkit", label: "BIOS & MBR BOOTKITS" },
          { id: "analiz", label: "GENEL ANALİZ" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            data-testid={`filter-${f.id}`}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] border transition-all ${
              filter === f.id
                ? "bg-[#00F0FF] text-[#050B14] border-[#00F0FF]"
                : "bg-transparent text-[#A0AEC0] border-[#00F0FF]/30 hover:border-[#00F0FF]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10">
        {filtered.length === 0 ? (
          <div className="md:col-span-12 text-center py-20 text-[#718096] font-mono text-sm" data-testid="no-posts">
            // Henüz analiz yayınlanmadı
          </div>
        ) : (
          filtered.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}
