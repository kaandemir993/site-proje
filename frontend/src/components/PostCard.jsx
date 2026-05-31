import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Cpu, Bug, ShieldOff } from "lucide-react";
import { fileUrl } from "@/lib/api";

const CATEGORY_META = {
  bootkit: { label: "BIOS & MBR BOOTKITS", icon: Cpu, color: "#00F0FF" },
  analiz: { label: "VIRUS ANALYSIS", icon: Bug, color: "#FFB800" },
  reverse: { label: "REVERSE ENGINEERING", icon: ShieldOff, color: "#FF6BD6" },
};

const FALLBACKS = {
  bootkit: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  analiz: "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwyfHxjeWJlcnNlY3VyaXR5JTIwYWJzdHJhY3R8ZW58MHx8fHwxNzgwMjQwODc5fDA&ixlib=rb-4.1.0&q=85",
  reverse: "https://images.unsplash.com/photo-1614064548237-096f735f344f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwzfHxjeWJlcnNlY3VyaXR5JTIwYWJzdHJhY3R8ZW58MHx8fHwxNzgwMjQwODc5fDA&ixlib=rb-4.1.0&q=85",
};

export default function PostCard({ post, featured = false }) {
  const meta = CATEGORY_META[post.category] || CATEGORY_META.analiz;
  const Icon = meta.icon;
  const img = post.image_path ? fileUrl(post.image_path) : FALLBACKS[post.category] || FALLBACKS.analiz;
  const detailLink = post.category === "reverse" ? `/reverse-engineering` : `/analizler/${post.slug}`;

  return (
    <Link
      to={detailLink}
      className={`glow-card group block ${featured ? "glow-card-featured md:col-span-8 row-span-2" : "md:col-span-4"}`}
      data-testid={`post-card-${post.slug}`}
    >
      <div className="relative overflow-hidden" style={{ height: featured ? 320 : 180 }}>
        <img src={img} alt={post.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,11,20,0) 0%, rgba(5,11,20,0.9) 100%)" }} />
        <div className="absolute inset-0 grid-bg opacity-40 mix-blend-overlay" />
        {featured && (
          <div className="absolute top-4 left-4 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em]"
               style={{ background: "rgba(0,240,255,0.15)", border: "1px solid #00F0FF", color: "#00F0FF" }}>
            ★ ÖNE ÇIKAN ANALİZ
          </div>
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: meta.color }} strokeWidth={1.5} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className={`font-display font-semibold ${featured ? "text-2xl md:text-3xl" : "text-lg"} text-white leading-tight mb-3 group-hover:text-[#00F0FF] transition-colors`}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-[#A0AEC0] leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[#00F0FF] uppercase tracking-wider">
          <span>İncele</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}
