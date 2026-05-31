import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { fileUrl } from "@/lib/api";
import CodeBlock from "@/components/CodeBlock";
import { ArrowLeft, Calendar } from "lucide-react";

export default function AnalysisDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/posts/${slug}`);
        setPost(r.data);
      } catch (e) {
        setErr(e.response?.data?.detail || "Yazı bulunamadı");
      }
    })();
  }, [slug]);

  if (err) return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center" data-testid="error-state">
      <div className="font-display text-3xl text-[#FF003C] uppercase">{err}</div>
      <Link to="/analizler" className="btn-neon mt-6 inline-flex">← Analizlere Dön</Link>
    </div>
  );
  if (!post) return <div className="text-center py-20 font-mono text-[#00F0FF]" data-testid="loading-state">// YÜKLENİYOR...</div>;

  const dateStr = new Date(post.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="max-w-4xl mx-auto px-6 lg:px-10 py-16" data-testid="post-detail">
      <Link to="/analizler" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#00F0FF] hover:underline mb-8" data-testid="back-link">
        <ArrowLeft className="w-3.5 h-3.5" /> Tüm Analizler
      </Link>

      <div className="label-overline">// {post.category.toUpperCase()}</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mt-3 text-white leading-tight">
        {post.title}
      </h1>
      <div className="mt-4 flex items-center gap-4 font-mono text-xs text-[#718096]">
        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
      </div>

      {post.image_path && (
        <div className="mt-10 neon-border overflow-hidden">
          <img src={fileUrl(post.image_path)} alt={post.title} className="w-full" data-testid="post-image" />
        </div>
      )}

      <div className="mt-10 prose-cyber" data-testid="post-content">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i} className="text-[#A0AEC0] text-base md:text-lg leading-relaxed mb-6">{para}</p>
        ))}
      </div>

      {post.code_block && (
        <CodeBlock code={post.code_block} language={post.code_language || "asm"} title="ASSEMBLY ANALYSIS" />
      )}
    </article>
  );
}
