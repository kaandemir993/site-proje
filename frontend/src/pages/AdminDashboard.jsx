import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { fileUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload, Star, FileText } from "lucide-react";

const CATEGORIES = [
  { id: "bootkit", label: "BIOS & MBR Bootkits" },
  { id: "analiz", label: "Genel Analiz" },
  { id: "reverse", label: "Reverse Engineering" },
];

const EMPTY = { title: "", category: "analiz", excerpt: "", content: "", code_block: "", code_language: "asm", image_path: null, featured: false };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // post object or null

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login", { replace: true });
  }, [user, loading, navigate]);

  const load = async () => {
    try {
      const r = await api.get("/posts");
      setPosts(r.data);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { if (user) load(); }, [user]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setShowForm(true); };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/upload", fd);
      setForm((f) => ({ ...f, image_path: r.data.path }));
      toast.success("Görsel yüklendi");
    } catch (err) {
      toast.error("Yükleme başarısız: " + (err.response?.data?.detail || err.message));
    } finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/posts/${editing.id}`, form);
        toast.success("Yazı güncellendi");
      } else {
        await api.post("/posts", form);
        toast.success("Yazı yayınlandı");
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      toast.error("Kayıt başarısız: " + (err.response?.data?.detail || err.message));
    } finally { setSaving(false); }
  };

  const removePost = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      toast.success("Yazı silindi");
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error("Silme başarısız: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div className="text-center py-20 font-mono text-[#00F0FF]">// LOADING...</div>;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="admin-dashboard">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="label-overline">// CONTROL_CENTER</div>
          <h1 className="font-display font-bold text-3xl md:text-4xl uppercase mt-2 text-white">Yönetim Paneli</h1>
          <p className="mt-2 text-sm text-[#A0AEC0]">Hoş geldin, <span className="text-[#00F0FF]">{user.name}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={openNew} className="btn-neon btn-neon-solid" data-testid="new-post-btn">
            <Plus className="w-4 h-4" /> Yeni Yazı
          </button>
          <button onClick={async () => { await logout(); navigate("/"); }} className="btn-neon" data-testid="admin-logout-btn">
            Çıkış
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="glow-card overflow-hidden" data-testid="posts-table">
        <table className="w-full">
          <thead style={{ background: "rgba(0,240,255,0.05)" }}>
            <tr className="text-left">
              <th className="px-6 py-4 label-overline">Başlık</th>
              <th className="px-6 py-4 label-overline hidden md:table-cell">Kategori</th>
              <th className="px-6 py-4 label-overline hidden md:table-cell">Öne Çıkan</th>
              <th className="px-6 py-4 label-overline text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-[#718096] font-mono text-sm">// Henüz yazı yok</td></tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-t border-[#00F0FF]/10" data-testid={`row-${p.slug}`}>
                  <td className="px-6 py-4">
                    <div className="font-display font-semibold text-white">{p.title}</div>
                    <div className="font-mono text-xs text-[#718096] mt-1">/{p.slug}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#00F0FF]">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {p.featured && <Star className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 neon-border text-[#00F0FF]" data-testid={`edit-${p.slug}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(p)} className="p-2 border border-[#FF003C]/40 text-[#FF003C] hover:bg-[#FF003C] hover:text-white transition-all" data-testid={`delete-${p.slug}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(5,11,20,0.92)" }} data-testid="delete-confirm-modal">
          <div className="w-full max-w-md glow-card p-8 relative" style={{ borderColor: "#FF003C", boxShadow: "0 0 40px rgba(255,0,60,0.25)" }}>
            <div className="label-overline" style={{ color: "#FF003C" }}>// DANGER_ZONE</div>
            <h2 className="font-display font-bold text-2xl uppercase mt-2 text-white">Yazıyı Sil?</h2>
            <p className="mt-3 text-sm text-[#A0AEC0] leading-relaxed">
              Şu yazı kalıcı olarak silinecek:
            </p>
            <div className="mt-3 p-3 border border-[#FF003C]/30 font-mono text-sm text-white break-words">
              {confirmDelete.title}
            </div>
            <p className="mt-3 font-mono text-xs text-[#FF003C] uppercase tracking-wider">
              // bu işlem geri alınamaz
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-neon" data-testid="confirm-delete-cancel">
                Vazgeç
              </button>
              <button onClick={() => removePost(confirmDelete.id)} className="btn-neon btn-danger" data-testid="confirm-delete-yes">
                <Trash2 className="w-4 h-4" /> Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4" style={{ background: "rgba(5,11,20,0.92)" }} data-testid="post-form-modal">
          <form onSubmit={submit} className="w-full max-w-3xl glow-card p-8 relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-[#A0AEC0] hover:text-[#FF003C]" data-testid="close-form-btn">
              <X />
            </button>
            <div className="label-overline">// {editing ? "EDIT_POST" : "NEW_POST"}</div>
            <h2 className="font-display font-bold text-2xl uppercase mt-2 mb-6 text-white">
              {editing ? "Yazıyı Düzenle" : "Yeni Yazı Oluştur"}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="label-overline block mb-2">// BAŞLIK</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="form-title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-overline block mb-2">// KATEGORİ</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="form-category">
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-overline block mb-2">// KOD DİLİ</label>
                  <select value={form.code_language || "asm"} onChange={(e) => setForm({ ...form, code_language: e.target.value })} data-testid="form-lang">
                    <option value="asm">Assembly</option>
                    <option value="c">C / C++</option>
                    <option value="py">Python</option>
                    <option value="ps">PowerShell</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-overline block mb-2">// ÖZET</label>
                <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} data-testid="form-excerpt" />
              </div>
              <div>
                <label className="label-overline block mb-2">// İÇERİK <span className="text-[#718096] normal-case tracking-normal">(boş satır = paragraf)</span></label>
                <textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} data-testid="form-content" />
              </div>
              <div>
                <label className="label-overline block mb-2">// KOD BLOĞU (opsiyonel)</label>
                <textarea className="mono" rows={8} value={form.code_block || ""} onChange={(e) => setForm({ ...form, code_block: e.target.value })} placeholder="; Assembly kodunuzu buraya yapıştırın" data-testid="form-code" />
              </div>
              <div>
                <label className="label-overline block mb-2">// GÖRSEL</label>
                <div className="flex items-center gap-3">
                  <label className="btn-neon cursor-pointer" data-testid="upload-label">
                    <Upload className="w-4 h-4" /> {uploading ? "Yükleniyor..." : "Görsel Seç"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} data-testid="upload-input" />
                  </label>
                  {form.image_path && (
                    <div className="flex items-center gap-3">
                      <img src={fileUrl(form.image_path)} alt="" className="w-20 h-14 object-cover neon-border" />
                      <button type="button" onClick={() => setForm({ ...form, image_path: null })} className="text-[#FF003C] font-mono text-xs uppercase" data-testid="remove-image-btn">Kaldır</button>
                    </div>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer" data-testid="form-featured-label">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" style={{ width: "auto" }} data-testid="form-featured" />
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#A0AEC0]">Ana sayfada öne çıkar</span>
              </label>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-neon" data-testid="form-cancel">İptal</button>
              <button type="submit" disabled={saving} className="btn-neon btn-neon-solid" data-testid="form-submit">
                <FileText className="w-4 h-4" /> {saving ? "Kaydediliyor..." : (editing ? "Güncelle" : "Yayınla")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
