import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { STORAGE_KEY } from './Notification';
import { createNotice, updateNotice, deleteNotice } from '../apis/noticeAPI';

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

const EMPTY_FORM = {
  titleKo: '', titleEn: '', titleJa: '',
  contentKo: '', contentEn: '', contentJa: '',
  postedAt: '',
  isPinned: false,
  isVisible: true,
  imageUrl: '',
};

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

function NotiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [mode, setMode] = useState(isNew ? 'edit' : 'view');
  const [item, setItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('ko');

  useEffect(() => {
    if (isNew) return;
    const found = loadItems().find((i) => i.id === id);
    if (!found) {
      navigate('/notifications');
      return;
    }
    setItem(found);
    setForm({
      titleKo: found.title ?? '',
      titleEn: '', titleJa: '',
      contentKo: found.content ?? '',
      contentEn: '', contentJa: '',
      postedAt: found.date ? found.date.replace(/\./g, '-') : '',
      isPinned: found.isPinned ?? false,
      isVisible: found.isVisible ?? true,
      imageUrl: found.imageUrl ?? '',
    });
  }, [id, isNew, navigate]);

  const validate = () => {
    const next = {};
    if (!form.titleKo.trim()) next.titleKo = '한국어 제목을 입력해주세요.';
    if (!form.contentKo.trim()) next.contentKo = '한국어 내용을 입력해주세요.';
    if (!form.postedAt) next.postedAt = '날짜를 선택해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (isNew) {
      setLoading(true);
      try {
        const body = {
          title: {
            ...(form.titleKo && { ko: form.titleKo.trim() }),
            ...(form.titleEn && { en: form.titleEn.trim() }),
            ...(form.titleJa && { ja: form.titleJa.trim() }),
          },
          content: {
            ...(form.contentKo && { ko: form.contentKo.trim() }),
            ...(form.contentEn && { en: form.contentEn.trim() }),
            ...(form.contentJa && { ja: form.contentJa.trim() }),
          },
          postedAt: new Date(form.postedAt).toISOString(),
          isPinned: form.isPinned,
          isVisible: form.isVisible,
          imageUrl: form.imageUrl.trim() || '',
        };

        console.log('[createNotice] 요청 body:', body);
        const result = await createNotice(body);
        console.log('[createNotice] 응답:', result);

        // API가 반환한 id를 그대로 저장
        const items = loadItems();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([result, ...items]));
        navigate('/notifications');
      } catch (err) {
        console.error('[createNotice] 오류:', err);
        alert(err.response?.data?.message ?? '등록에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const body = {
          title: {
            ...(form.titleKo && { ko: form.titleKo.trim() }),
            ...(form.titleEn && { en: form.titleEn.trim() }),
            ...(form.titleJa && { ja: form.titleJa.trim() }),
          },
          content: {
            ...(form.contentKo && { ko: form.contentKo.trim() }),
            ...(form.contentEn && { en: form.contentEn.trim() }),
            ...(form.contentJa && { ja: form.contentJa.trim() }),
          },
          postedAt: new Date(form.postedAt).toISOString(),
          isPinned: form.isPinned,
          isVisible: form.isVisible,
          imageUrl: form.imageUrl.trim() || '',
        };

        console.log('[updateNotice] 요청 body:', body);
        const result = await updateNotice(item.id, body);
        console.log('[updateNotice] 응답:', result);

        const items = loadItems();
        const updated = items.map((i) => (String(i.id) === String(item.id) ? result : i));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setItem(result);
        setMode('view');
      } catch (err) {
        console.error('[updateNotice] 오류:', err);
        alert(err.response?.data?.message ?? '수정에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(item.id);
      const updated = loadItems().filter((i) => String(i.id) !== String(item.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      navigate('/notifications');
    } catch (err) {
      console.error('[deleteNotice] 오류:', err);
      alert(err.response?.data?.message ?? '삭제에 실패했습니다.');
    }
  };

  const handleEditCancel = () => {
    if (item) {
      setForm({
        titleKo: item.title ?? '',
        titleEn: '', titleJa: '',
        contentKo: item.content ?? '',
        contentEn: '', contentJa: '',
        postedAt: item.date ? item.date.replace(/\./g, '-') : '',
        isPinned: item.isPinned ?? false,
        isVisible: item.isVisible ?? true,
        imageUrl: item.imageUrl ?? '',
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
              {item.isPinned && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">고정</span>
              )}
              {!item.isVisible && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">비공개</span>
              )}
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
          </div>

          <div className="mx-6 h-px bg-gray-200" />

          <div className="px-6 py-5">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
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

        {/* 언어 탭 */}
        <div className="flex gap-1 border-b border-gray-200 pb-1">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={`px-3 py-1.5 text-sm rounded-t-md transition-colors ${
                activeLang === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* 제목 */}
        {LANGS.map((lang) => (
          activeLang === lang.code && (
            <div key={`title-${lang.code}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 {lang.code === 'ko' && <span className="text-red-500">*</span>}
              </label>
              <input
                name={`title${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`}
                value={form[`title${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`]}
                onChange={handleChange}
                placeholder={`${lang.label} 제목을 입력하세요`}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition ${
                  lang.code === 'ko' && errors.titleKo ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {lang.code === 'ko' && errors.titleKo && (
                <p className="text-red-500 text-xs mt-1">{errors.titleKo}</p>
              )}
            </div>
          )
        ))}

        {/* 내용 */}
        {LANGS.map((lang) => (
          activeLang === lang.code && (
            <div key={`content-${lang.code}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용 {lang.code === 'ko' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                name={`content${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`}
                value={form[`content${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`]}
                onChange={handleChange}
                placeholder={`${lang.label} 내용을 입력하세요`}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition resize-none ${
                  lang.code === 'ko' && errors.contentKo ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {lang.code === 'ko' && errors.contentKo && (
                <p className="text-red-500 text-xs mt-1">{errors.contentKo}</p>
              )}
            </div>
          )
        ))}

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            게시일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="postedAt"
            value={form.postedAt}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition ${
              errors.postedAt ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.postedAt && <p className="text-red-500 text-xs mt-1">{errors.postedAt}</p>}
        </div>

        {/* 옵션 */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isPinned"
              checked={form.isPinned}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">상단 고정</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isVisible"
              checked={form.isVisible}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">공개</span>
          </label>
        </div>

        {/* 이미지 URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL (선택)</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="미리보기"
              className="mt-2 max-h-40 rounded-lg border border-gray-200 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
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
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '등록 중...' : isNew ? '등록' : '수정 저장'}
        </button>
      </div>
    </div>
  );
}

export default NotiDetail;
