import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEY } from './Notification';

const EMPTY_FORM = { title: '', date: '', content: '', badge: '', image: '' };

const BADGE_STYLES = {
  NEW: 'bg-blue-100 text-blue-700',
  필독: 'bg-red-100 text-red-700',
};

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function toInputDate(date) {
  return date ? date.replace(/\./g, '-') : '';
}

function toDisplayDate(date) {
  return date ? date.replace(/-/g, '.') : '';
}

function NotiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [mode, setMode] = useState(isNew ? 'edit' : 'view');
  const [item, setItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    const found = loadItems().find((i) => i.id === id);
    if (!found) {
      navigate('/notifications');
      return;
    }
    setItem(found);
    setForm({
      title: found.title ?? '',
      date: toInputDate(found.date),
      content: found.content ?? '',
      badge: found.badge ?? '',
      image: found.image ?? '',
    });
  }, [id, isNew, navigate]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = '제목을 입력해주세요.';
    if (!form.date) next.date = '날짜를 선택해주세요.';
    if (!form.content.trim()) next.content = '내용을 입력해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((prev) => ({ ...prev, image: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleImageFile(file);
  };

  const handleDelete = () => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    const updated = loadItems().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    navigate('/notifications');
  };

  const handleSave = () => {
    if (!validate()) return;

    const items = loadItems();
    const payload = {
      id: isNew ? Date.now().toString() : id,
      title: form.title.trim(),
      date: toDisplayDate(form.date),
      content: form.content.trim(),
      badge: form.badge || undefined,
      image: form.image || undefined,
    };

    const updated = isNew
      ? [payload, ...items]
      : items.map((i) => (i.id === id ? payload : i));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (isNew) {
      navigate('/notifications');
    } else {
      setItem(payload);
      setMode('view');
    }
  };

  const handleEditCancel = () => {
    if (item) {
      setForm({
        title: item.title ?? '',
        date: toInputDate(item.date),
        content: item.content ?? '',
        badge: item.badge ?? '',
        image: item.image ?? '',
      });
      setErrors({});
    }
    setMode('view');
  };

  // ── VIEW MODE ──────────────────────────────────────────────────────────────
  if (mode === 'view' && item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/notifications')}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 inline-block"
        >
          ← 목록
        </button>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              {item.badge && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[item.badge] ?? 'bg-gray-100 text-gray-600'}`}>
                  {item.badge}
                </span>
              )}
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
          </div>

          <div className="mx-6 h-px bg-gray-200" />

          <div className="px-6 py-5">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
            {item.image && (
              <img
                src={item.image}
                alt="공지 이미지"
                className="mt-4 w-full rounded-lg border border-gray-200 object-contain max-h-72"
              />
            )}
          </div>

          <div className="mx-6 h-px bg-gray-200" />

          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setMode('edit')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EDIT / CREATE MODE ─────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={isNew ? () => navigate('/notifications') : handleEditCancel}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← {isNew ? '목록' : '돌아가기'}
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? '새 공지 추가' : '공지사항 수정'}
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="공지사항 제목을 입력하세요"
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition ${
              errors.title ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition ${
                errors.date ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">뱃지</label>
            <select
              name="badge"
              value={form.badge}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="">없음</option>
              <option value="NEW">NEW</option>
              <option value="필독">필독</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="공지사항 내용을 입력하세요"
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition resize-none ${
              errors.content ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이미지 (선택)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFile(e.target.files[0])}
          />
          {form.image ? (
            <div className="relative inline-block">
              <img
                src={form.image}
                alt="첨부 이미지"
                className="max-h-48 rounded-lg border border-gray-200 object-contain"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current.click()}
              onDrop={handleImageDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <p className="text-sm text-gray-400">클릭 또는 드래그하여 이미지 첨부</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={isNew ? () => navigate('/notifications') : handleEditCancel}
          className="px-5 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isNew ? '등록' : '수정 저장'}
        </button>
      </div>
    </div>
  );
}

export default NotiDetail;
