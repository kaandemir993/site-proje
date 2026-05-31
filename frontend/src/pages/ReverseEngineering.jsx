import React, { useEffect, useState } from "react";
import api, { fileUrl } from "@/lib/api";
import CodeBlock from "@/components/CodeBlock";
import { Terminal } from "lucide-react";

export default function ReverseEngineering() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await api.get("/posts", { params: { category: "reverse" } });
      setPosts(r.data);
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16" data-testid="reverse-page">
      <div className="flex items-center gap-3">
        <Terminal className="w-8 h-8 text-[#00F0FF]" strokeWidth={1.5} />
        <div className="label-overline">// LOW_LEVEL_ANALYSIS</div>
      </div>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mt-3 text-white leading-tight">
        Reverse <span className="neon-text">Engineering</span>
      </h1>
      <p className="mt-4 text-[#A0AEC0] max-w-2xl">
        Virüslerin disassemble edilmiş kodları, kontrol akış grafikleri ve Assembly seviyesinde derinlemesine teknik incelemeler.
      </p>

      <div className="mt-12 space-y-16">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#718096] font-mono text-sm" data-testid="no-reverse-posts">
            // Henüz reverse engineering yazısı yok
          </div>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="border-l-2 border-[#00F0FF]/30 pl-6 md:pl-10" data-testid={`reverse-${p.slug}`}>
              <div className="label-overline">// CASE_FILE / {p.slug.toUpperCase().slice(0, 20)}</div>
              <h2 className="font-display font-bold text-2xl md:text-3xl uppercase mt-2 text-white">{p.title}</h2>
              {p.excerpt && <p className="mt-3 text-[#A0AEC0]">{p.excerpt}</p>}

              {p.image_path && (
                <div className="mt-6 neon-border overflow-hidden">
                  <img src={fileUrl(p.image_path)} alt={p.title} className="w-full" />
                </div>
              )}

              {p.content && (
                <div className="mt-6">
                  {p.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-[#A0AEC0] leading-relaxed mb-4">{para}</p>
                  ))}
                </div>
              )}

              {p.code_block && (
                <CodeBlock code={p.code_block} language={p.code_language || "asm"} title={`${p.code_language?.toUpperCase() || "ASM"} // ${p.slug}`} />
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
