"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  video_url: string | null;
  is_representative: boolean;
  date: string | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState("");
  const [defaultTheme, setDefaultTheme] = useState<'white' | 'dark'>('white');
  const [savingName, setSavingName] = useState(false);
  const [bgmUrls, setBgmUrls] = useState<(string | null)[]>([null, null, null]);
  const [uploadingBgm, setUploadingBgm] = useState<number | null>(null);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("vision");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [faviconSaved, setFaviconSaved] = useState(false);

  // Drag & drop
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [batchItems, setBatchItems] = useState<{ file: File; title: string; description: string; preview: string }[]>([]);
  const [batchCategory, setBatchCategory] = useState("vision");
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const dropFileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "vision",
    description: "",
    image_url: "",
    video_url: "",
    is_representative: false,
    date: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(type === "image" ? "이미지는 5MB 이하만 가능합니다." : "영상은 50MB 이하만 가능합니다.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (type === "image") {
          setFormData((prev) => ({ ...prev, image_url: data.url }));
        } else {
          setFormData((prev) => ({ ...prev, video_url: data.url }));
        }
        alert("업로드 완료!");
      } else {
        alert(data.error || "업로드 실패");
      }
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류 발생");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const stored = localStorage.getItem("admin_auth");
    if (stored === "true") {
      setIsAuthenticated(true);
      fetchItems();
      fetchSettings();
    } else {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      setChildName(json.child_name || "");
      setBgmUrls([
        json.bgm_1 || null,
        json.bgm_2 || null,
        json.bgm_3 || null,
      ]);
      setFaviconUrl(json.favicon_url || null);
      if (json.default_theme === 'dark') setDefaultTheme('dark');
      else setDefaultTheme('white');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBgmUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".mp3") && file.type !== "audio/mpeg") {
      alert("MP3 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      alert("MP3 파일은 1개당 4.5MB 이하만 가능합니다.");
      return;
    }

    setUploadingBgm(slot);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const newUrls = [...bgmUrls];
      newUrls[slot] = data.url;
      setBgmUrls(newUrls);

      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`bgm_${slot + 1}`]: data.url }),
      });
      alert(`BGM ${slot + 1} 업로드 완료!`);
    } catch (err) {
      console.error(err);
      alert("업로드에 실패했습니다.");
    } finally {
      setUploadingBgm(null);
      e.target.value = "";
    }
  };

  const handleBgmDelete = async (slot: number) => {
    if (!confirm(`BGM ${slot + 1}을 삭제하시겠습니까?`)) return;
    const newUrls = [...bgmUrls];
    newUrls[slot] = null;
    setBgmUrls(newUrls);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`bgm_${slot + 1}`]: "" }),
    });
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("파비콘 이미지는 2MB 이하만 가능합니다.");
      return;
    }
    setUploadingFavicon(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const { url } = await res.json();
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favicon_url: url }),
      });
      setFaviconUrl(url);
      setFaviconSaved(true);
      setTimeout(() => setFaviconSaved(false), 3000);
    } catch {
      alert("업로드에 실패했습니다.");
    } finally {
      setUploadingFavicon(false);
      e.target.value = "";
    }
  };

  const handleFaviconDelete = async () => {
    if (!confirm("파비콘을 기본 이미지로 초기화하시겠습니까?")) return;
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favicon_url: "" }),
    });
    setFaviconUrl(null);
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("upload failed");
    const { url } = await res.json();
    return url;
  };

  const processFiles = async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (valid.length === 0) return;
    if (valid.length > 1) {
      setShowModal(false);
      setBatchItems(filesToBatchItems(valid));
      return;
    }
    const file = valid[0];
    if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) { alert("이미지는 5MB 이하만 가능합니다."); return; }
    if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) { alert("영상은 50MB 이하만 가능합니다."); return; }
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file);
      const name = file.name.replace(/\.[^/.]+$/, "");
      if (file.type.startsWith("video/")) setFormData(prev => ({ ...prev, video_url: url, title: prev.title || name }));
      else setFormData(prev => ({ ...prev, image_url: url, title: prev.title || name }));
    } catch { alert("업로드에 실패했습니다."); }
    finally { setUploading(false); }
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsModalDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handlePageDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (!showModal) setIsPageDragging(true);
  };
  const handlePageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsPageDragging(false);
  };
  const handlePageDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const filesToBatchItems = (files: File[]) => files.map(f => ({
    file: f,
    title: f.name.replace(/\.[^/.]+$/, ""),
    description: "",
    preview: URL.createObjectURL(f),
  }));

  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsPageDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length === 0) return;
    if (files.length === 1) {
      resetForm();
      setShowModal(true);
      setTimeout(() => processFiles(files), 100);
    } else {
      setBatchItems(filesToBatchItems(files));
    }
  };

  const handleBatchUpload = async () => {
    setBatchUploading(true);
    setBatchProgress(0);
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < batchItems.length; i++) {
      const { file, title, description } = batchItems[i];
      try {
        const url = await uploadFileToStorage(file);
        const isVideo = file.type.startsWith("video/");
        await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || file.name.replace(/\.[^/.]+$/, ""),
            category: batchCategory,
            description,
            image_url: isVideo ? "" : url,
            video_url: isVideo ? url : null,
            is_representative: false,
            date: today,
          }),
        });
      } catch (err) { console.error(err); }
      setBatchProgress(i + 1);
    }
    batchItems.forEach(item => URL.revokeObjectURL(item.preview));
    setBatchItems([]);
    setBatchUploading(false);
    fetchItems();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkCategoryChange = async () => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    for (const id of selectedIds) {
      await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, category: bulkCategory }),
      });
    }
    setSelectedIds(new Set());
    setBulkProcessing(false);
    fetchItems();
  };

  const handleBulkSetRepresentative = async () => {
    if (selectedIds.size !== 1) return;
    const id = [...selectedIds][0];
    const item = items.find(i => i.id === id);
    if (!item) return;
    setBulkProcessing(true);
    await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_representative: true, category: item.category }),
    });
    setSelectedIds(new Set());
    setBulkProcessing(false);
    fetchItems();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}개 항목을 삭제하시겠습니까?`)) return;
    setBulkProcessing(true);
    for (const id of selectedIds) {
      await fetch(`/api/admin?id=${id}`, { method: "DELETE" });
    }
    setSelectedIds(new Set());
    setBulkProcessing(false);
    fetchItems();
  };

  const saveChildName = async () => {
    setSavingName(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ child_name: childName }),
      });
      if (!res.ok) throw new Error();
      alert("저장되었습니다.");
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSavingName(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const { success } = await res.json();
    if (success) {
      localStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      fetchItems();
      fetchSettings();
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      alert("비밀번호가 변경되었습니다.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      alert(err.message || "변경에 실패했습니다.");
    } finally {
      setSavingPw(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setItems(json.data || []);
    } catch (err) {
      console.error(err);
      alert("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      image_url: formData.image_url,
      video_url: formData.video_url || null,
      is_representative: formData.is_representative,
      date: formData.date || null,
    };

    try {
      const res = await fetch("/api/admin", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem ? { id: editingItem.id, ...payload } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert(editingItem ? "수정되었습니다." : "추가되었습니다.");
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("삭제되었습니다.");
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description || "",
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      is_representative: item.is_representative,
      date: item.date || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      category: "vision",
      description: "",
      image_url: "",
      video_url: "",
      is_representative: false,
      date: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-8">관리자 로그인</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 mb-6"
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              로그인
            </button>
          </form>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-4 text-gray-500 hover:text-gray-700"
          >
            ← 포트폴리오로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 relative"
      onDragEnter={handlePageDragEnter}
      onDragLeave={handlePageDragLeave}
      onDragOver={handlePageDragOver}
      onDrop={handlePageDrop}
    >
      {/* Page-level drop overlay */}
      {isPageDragging && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-3xl px-12 py-10 text-center shadow-2xl">
            <div className="text-5xl mb-3">📂</div>
            <p className="text-xl font-bold">여기에 놓으세요</p>
            <p className="text-sm text-gray-500 mt-1">이미지·영상 여러 개 동시 업로드 가능</p>
          </div>
        </div>
      )}

      {/* Batch upload panel */}
      {batchItems.length > 0 && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">일괄 업로드</h2>
              <p className="text-sm text-gray-500 mt-0.5">{batchItems.length}개 파일 · 각 제목과 설명을 입력하세요</p>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">카테고리</label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                  disabled={batchUploading}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="vision">비전</option>
                  <option value="experience">경험</option>
                  <option value="achievement">성취</option>
                </select>
              </div>
            </div>

            {/* Scrollable item list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {batchItems.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 border border-gray-100 rounded-xl">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.file.type.startsWith("video/") ? (
                      <video src={item.preview} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.preview} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  {/* Fields */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => setBatchItems(prev => prev.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it))}
                      placeholder="제목"
                      disabled={batchUploading}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => setBatchItems(prev => prev.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))}
                      placeholder="설명 (선택)"
                      disabled={batchUploading}
                      rows={2}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    />
                  </div>
                  {/* Remove */}
                  {!batchUploading && (
                    <button
                      onClick={() => setBatchItems(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-300 hover:text-red-400 text-lg shrink-0 self-start"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            {batchUploading && (
              <div className="px-5 pb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>업로드 중...</span>
                  <span>{batchProgress} / {batchItems.length}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(batchProgress / batchItems.length) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { batchItems.forEach(it => URL.revokeObjectURL(it.preview)); setBatchItems([]); setBatchProgress(0); }}
                disabled={batchUploading}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >취소</button>
              <button
                onClick={handleBatchUpload}
                disabled={batchUploading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
              >{batchUploading ? "업로드 중..." : `${batchItems.length}개 업로드`}</button>
            </div>
          </div>
        </div>
      )}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-xl font-bold whitespace-nowrap">관리페이지</h1>
          <div className="flex gap-1.5 sm:gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-2.5 sm:px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 text-sm whitespace-nowrap"
            >
              글쓰기
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-2.5 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap"
            >
              홈
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 사이트 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">아이 이름</label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="이름 입력"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
          <button
            onClick={saveChildName}
            disabled={savingName}
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
          >
            {savingName ? "저장 중..." : "저장"}
          </button>
        </div>

        {/* 시작 모드 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">시작 화면 모드</p>
            <p className="text-xs text-gray-400 mt-0.5">{defaultTheme === 'dark' ? '🌙 다크모드로 시작' : '☀️ 화이트모드로 시작'}</p>
          </div>
          <button
            onClick={async () => {
              const next = defaultTheme === 'white' ? 'dark' : 'white';
              setDefaultTheme(next);
              await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ default_theme: next }),
              });
            }}
            style={{
              width: '56px', height: '30px', borderRadius: '15px', border: 'none',
              background: defaultTheme === 'dark' ? '#1c1c1e' : '#e5e5ea',
              position: 'relative', cursor: 'pointer',
              transition: 'background 0.3s',
            }}
          >
            <span style={{
              position: 'absolute', top: '3px',
              left: defaultTheme === 'dark' ? '29px' : '3px',
              width: '24px', height: '24px', borderRadius: '12px',
              background: defaultTheme === 'dark' ? '#fff' : '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'left 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px',
            }}>
              {defaultTheme === 'dark' ? '🌙' : '☀️'}
            </span>
          </button>
        </div>

        {/* 파비콘 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-700">파비콘 / 앱 아이콘 (PNG, 2MB 이하)</h2>
            {faviconSaved && (
              <span className="text-xs text-green-600 font-medium">✅ 적용됨</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 shadow-sm">
              <img
                key={faviconUrl}
                src={faviconUrl || "/favicon.png"}
                alt="favicon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <span className="inline-block px-3 py-2 bg-gray-100 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                    {uploadingFavicon ? "업로드 중..." : "이미지 변경"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={uploadingFavicon}
                    onChange={handleFaviconUpload}
                  />
                </label>
                {faviconUrl && (
                  <button
                    onClick={handleFaviconDelete}
                    className="px-3 py-2 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    초기화
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">브라우저 탭 아이콘 및 앱 설치 아이콘에 사용됩니다</p>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">비밀번호 변경</h2>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
            <input
              type="password"
              placeholder="새 비밀번호"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
            <button
              type="submit"
              disabled={savingPw}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 self-end"
            >
              {savingPw ? "변경 중..." : "변경"}
            </button>
          </form>
        </div>

        {/* BGM 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">배경음악 (MP3, 최대 3개, 1개당 4.5MB 이하)</h2>
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((slot) => (
              <div key={slot} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-12 shrink-0">BGM {slot + 1}</span>
                {bgmUrls[slot] ? (
                  <>
                    <audio src={bgmUrls[slot]!} controls className="h-8 flex-1 min-w-0" />
                    <button
                      onClick={() => handleBgmDelete(slot)}
                      className="text-xs text-red-400 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 shrink-0"
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <label className="flex-1 cursor-pointer">
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                      {uploadingBgm === slot ? "업로드 중..." : "MP3 선택"}
                    </span>
                    <input
                      type="file"
                      accept=".mp3,audio/mpeg"
                      className="hidden"
                      disabled={uploadingBgm !== null}
                      onChange={(e) => handleBgmUpload(e, slot)}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8">
          {(["vision", "experience", "achievement"] as const).map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            const catLabel = cat === "vision" ? "비전" : cat === "experience" ? "경험" : "성취";
            const catColor = cat === "vision" ? "bg-blue-100 text-blue-700" : cat === "experience" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700";
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${catColor}`}>{catLabel}</span>
                  <span className="text-xs text-gray-400">{catItems.length}개</span>
                  <button
                    onClick={() => {
                      const catIds = catItems.map(i => i.id);
                      const allSelected = catIds.every(id => selectedIds.has(id));
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        if (allSelected) catIds.forEach(id => next.delete(id));
                        else catIds.forEach(id => next.add(id));
                        return next;
                      });
                    }}
                    className="text-xs text-gray-400 hover:text-gray-700 ml-1"
                  >
                    {catItems.every(i => selectedIds.has(i.id)) ? "해제" : "전체선택"}
                  </button>
                </div>
                <div className="grid gap-4">
                  {catItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 shadow-sm border flex gap-4 transition-colors ${
                selectedIds.has(item.id) ? "border-blue-400 bg-blue-50/40" : "border-gray-100"
              }`}
            >
              {/* Checkbox */}
              <div className="flex items-start pt-1 shrink-0">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              </div>
              <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : item.video_url ? (
                  <video src={item.video_url} muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.category === "vision"
                        ? "bg-blue-100 text-blue-700"
                        : item.category === "experience"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {item.category === "vision" ? "비전" : item.category === "experience" ? "경험" : "성취"}
                    </span>
                    {item.is_representative && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        대표
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-9 h-9 flex items-center justify-center text-lg border border-gray-200 rounded-lg hover:bg-gray-50"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-9 h-9 flex items-center justify-center text-lg border border-red-200 rounded-lg hover:bg-red-50"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {item.description || "설명 없음"}
                </p>
                {item.date && (
                  <p className="text-xs text-gray-400 mt-2">{item.date}</p>
                )}
              </div>
            </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 항목이 없습니다. 새 항목을 추가해주세요.
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">
                {editingItem ? "항목 수정" : "글쓰기"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalDragging(true); }}
                  onDragLeave={(e) => { e.stopPropagation(); setIsModalDragging(false); }}
                  onDrop={(e) => { e.stopPropagation(); handleModalDrop(e); }}
                  onClick={() => dropFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isModalDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {uploading ? (
                    <p className="text-sm text-gray-500">업로드 중...</p>
                  ) : formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  ) : formData.video_url ? (
                    <video src={formData.video_url} className="max-h-48 mx-auto rounded-lg" controls />
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📁</div>
                      <p className="text-sm font-medium text-gray-700">이미지 또는 영상을 드래그하거나 클릭</p>
                      <p className="text-xs text-gray-400 mt-1">이미지 5MB · 영상 50MB 이하</p>
                    </>
                  )}
                  <input
                    ref={dropFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      e.target.value = "";
                      processFiles(files);
                    }}
                  />
                </div>
                {(formData.image_url || formData.video_url) && (
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: "", video_url: "" }))}
                    className="text-xs text-red-400 hover:underline">파일 제거</button>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">제목</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="vision">비전</option>
                    <option value="experience">경험</option>
                    <option value="achievement">성취</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">날짜</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_representative"
                    checked={formData.is_representative}
                    onChange={(e) => setFormData({ ...formData, is_representative: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_representative" className="text-sm">
                    대표 항목으로 표시
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="relative bg-gray-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex flex-col gap-2 pointer-events-auto max-w-lg w-full">
            {/* Close button */}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-500 flex items-center justify-center text-white text-sm shadow-lg transition-colors"
            >✕</button>
            {/* Row 1: 선택 정보 */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium whitespace-nowrap">{selectedIds.size}개 선택</span>
              <button onClick={() => setSelectedIds(new Set(items.map(i => i.id)))}
                className="text-xs text-gray-400 hover:text-white whitespace-nowrap">전체선택</button>
              <button onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-400 hover:text-white whitespace-nowrap">해제</button>
            </div>
            {/* Row 2: 액션 버튼들 */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedIds.size === 1 && (
                <button
                  onClick={handleBulkSetRepresentative}
                  disabled={bulkProcessing}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                >⭐ 대표 설정</button>
              )}
              <button
                onClick={handleBulkDelete}
                disabled={bulkProcessing}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
              >🗑️ 삭제</button>
              <div className="flex-1" />
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                disabled={bulkProcessing}
                className="px-2 py-1.5 rounded-lg text-sm bg-gray-700 text-white border border-gray-600 focus:outline-none"
              >
                <option value="vision">비전</option>
                <option value="experience">경험</option>
                <option value="achievement">성취</option>
              </select>
              <button
                onClick={handleBulkCategoryChange}
                disabled={bulkProcessing}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
              >{bulkProcessing ? "처리 중..." : "카테고리 변경"}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}