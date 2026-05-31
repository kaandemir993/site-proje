import React, { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Send, Mail, Lock, Globe } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Mesajınız alındı. En kısa sürede dönüş yapılacaktır.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Gönderim başarısız: " + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16" data-testid="contact-page">
      <div className="label-overline">// SECURE_CHANNEL</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mt-3 text-white">
        İleti<span className="neon-text">şim</span>
      </h1>
      <p className="mt-4 text-[#A0AEC0] max-w-2xl">
        Bir tehdit ihbarı, işbirliği teklifi veya teknik soru için aşağıdaki güvenli kanaldan bize ulaşabilirsiniz.
      </p>

      <div className="mt-12 grid md:grid-cols-5 gap-10">
        <form onSubmit={submit} className="md:col-span-3 space-y-5" data-testid="contact-form">
          <div>
            <label className="label-overline block mb-2">// AD</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" data-testid="contact-name" />
          </div>
          <div>
            <label className="label-overline block mb-2">// E-POSTA</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="analyst@example.com" data-testid="contact-email" />
          </div>
          <div>
            <label className="label-overline block mb-2">// MESAJ</label>
            <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Bize bahsetmek istediğiniz analiz veya tehdit..." data-testid="contact-message" />
          </div>
          <button type="submit" disabled={sending} className="btn-neon btn-neon-solid" data-testid="contact-submit">
            <Send className="w-4 h-4" /> {sending ? "GÖNDERİLİYOR..." : "İLETİYİ ŞİFRELE & GÖNDER"}
          </button>
        </form>

        <aside className="md:col-span-2 space-y-4">
          {[
            { icon: Mail, label: "E-POSTA", val: "info@cyberguard.lab" },
            { icon: Lock, label: "PGP", val: "0xA1B2 C3D4 E5F6 7890" },
            { icon: Globe, label: "BÖLGE", val: "TR / GLOBAL" },
          ].map((it, i) => (
            <div key={i} className="glow-card p-5 flex items-start gap-4" data-testid={`contact-info-${i}`}>
              <it.icon className="w-5 h-5 text-[#00F0FF] mt-0.5" strokeWidth={1.5} />
              <div>
                <div className="label-overline">// {it.label}</div>
                <div className="font-mono text-sm text-white mt-1 break-all">{it.val}</div>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
