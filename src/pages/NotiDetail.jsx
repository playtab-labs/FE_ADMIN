import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getNoticeDetail, createNotice, updateNotice, deleteNotice } from '../apis/noticeAPI';

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

const formatDate = (postedAt) => postedAt?.split('T')[0].replace(/-/g, '.') ?? '';

// title/content가 다국어 객체({ko: "..."})이거나 문자열일 수 있음
const getStr = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.ko ?? val.en ?? Object.values(val)[0] ?? '';
};

function NotiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [mode, setMode] = useState(isNew ? 'edit' : 'view');
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [activeLang, setActiveLang] = useState('ko');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    setFetchError('');
    getNoticeDetail(id)
      .then((data) => {
        console.log('[getNoticeDetail] 응답:', data);
        setDetail(data);
        setForm({
          titleKo: getStr(data.title),
          titleEn: '', titleJa: '',
          contentKo: getStr(data.content),
          contentEn: '', contentJa: '',
          postedAt: data.postedAt?.split('T')[0] ?? '',
          isPinned: data.isPinned ?? false,
          isVisible: data.isVisible ?? true,
          imageUrl: data.imageUrl ?? '',
        });
      })
      .catch((err) => {
        console.error('[getNoticeDetail] 오류:', err);
        setFetchError('공지사항을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

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

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const base64 = await readFileAsBase64(file);
    setForm((prev) => ({ ...prev, imageUrl: base64 }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const buildBody = () => {
    const title = {
      ...(form.titleKo && { ko: form.titleKo.trim() }),
      ...(form.titleEn && { en: form.titleEn.trim() }),
      ...(form.titleJa && { ja: form.titleJa.trim() }),
    };
    const content = {
      ...(form.contentKo && { ko: form.contentKo.trim() }),
      ...(form.contentEn && { en: form.contentEn.trim() }),
      ...(form.contentJa && { ja: form.contentJa.trim() }),
    };
    const body = {
      title,
      content,
      postedAt: new Date(form.postedAt).toISOString(),
      isPinned: form.isPinned,
      isVisible: form.isVisible,
      imageUrl: form.imageUrl?.trim() || '',
    };
    console.log('[buildBody]', JSON.stringify(body, null, 2));
    return body;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = buildBody();
      if (isNew) {
        console.log('[createNotice] 요청 body:', body);
        const result = await createNotice(body);
        console.log('[createNotice] 응답:', result);
        navigate('/notifications');
      } else {
        console.log('[updateNotice] 요청 body:', body);
        const result = await updateNotice(detail.id, body);
        console.log('[updateNotice] 응답:', result);
        setDetail(result);
        setMode('view');
      }
    } catch (err) {
      console.error('[save] 오류 status:', err.response?.status);
      console.error('[save] 오류 data:', JSON.stringify(err.response?.data, null, 2));
      alert(err.response?.data?.message ?? JSON.stringify(err.response?.data) ?? (isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(detail.id);
      navigate('/notifications');
    } catch (err) {
      console.error('[deleteNotice] 오류:', err);
      alert(err.response?.data?.message ?? '삭제에 실패했습니다.');
    }
  };

  const handleEditCancel = () => {
    if (detail) {
      setForm({
        titleKo: getStr(detail.title),
        titleEn: '', titleJa: '',
        contentKo: getStr(detail.content),
        contentEn: '', contentJa: '',
        postedAt: detail.postedAt?.split('T')[0] ?? '',
        isPinned: detail.isPinned ?? false,
        isVisible: detail.isVisible ?? true,
        imageUrl: detail.imageUrl ?? '',
      });
      setErrors({});
    }
    setMode('view');
  };

  // ── 로딩 / 에러 ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="py-24 text-center text-gray-400 text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/notifications')} className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← 목록
        </button>
        <div className="py-24 text-center">
          <p className="text-sm text-red-400 mb-3">{fetchError}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-blue-500 hover:underline">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // ── VIEW MODE ──────────────────────────────────────────────────────────────
  if (mode === 'view' && detail) {
    const badge = detail.isPinned ? '필독' : undefined;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/notifications')}
            className="text-sm text-[#656565] hover:text-[#1A1A1A] transition-colors"
          >
            ← 목록
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm border border-[#E4E4E4] text-[#656565] rounded-lg hover:border-red-200 hover:text-red-400 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setMode('edit')}
              className="px-3 py-1.5 text-sm bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              수정
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E4] rounded-xl overflow-hidden">
          {/* NoticeDetailHeader */}
          <div className="px-6 pt-6 pb-5 flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-[-0.18px] leading-snug">
              {getStr(detail.title)}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#BFBFBF] tracking-[-0.14px]">
                {formatDate(detail.postedAt)}
              </span>
              {badge && (
                <span
                  className={`text-[10px] font-semibold px-[7px] py-[5px] rounded-full text-[#1A1A1A] ${
                    badge === 'NEW' ? 'bg-[#FFDAD1]' : 'bg-[#FFA38C]'
                  }`}
                >
                  {badge}
                </span>
              )}
              {detail.isVisible === false && (
                <span className="text-[10px] font-semibold px-[7px] py-[5px] rounded-full bg-gray-100 text-gray-400">
                  비공개
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#BFBFBF]" />

          {/* NoticeDetailBody */}
          <div className="px-6 py-5">
            {detail.imageUrl && (
              <>
                <img
                  src={detail.imageUrl}
                  alt="공지 이미지"
                  className="w-full object-cover"
                />
                <div className="h-6" />
              </>
            )}
            <p className="text-sm text-[#1A1A1A] tracking-[-0.14px] whitespace-pre-wrap leading-relaxed">
              {getStr(detail.content)}
            </p>
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
                activeLang === lang.code ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* 제목 */}
        {LANGS.map((lang) => activeLang === lang.code && (
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
        ))}

        {/* 내용 */}
        {LANGS.map((lang) => activeLang === lang.code && (
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
            <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-700">필독</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-700">공개</span>
          </label>
        </div>

        {/* 이미지 */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">이미지 (선택)</label>

          {/* 드래그앤드롭 — 로컬 미리보기 전용 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFile(e.target.files[0])}
          />

          {form.imageUrl ? (
            <div className="relative">
              <img
                src={form.imageUrl}
                alt="이미지"
                className="w-full max-h-60 rounded-lg border border-[#E4E4E4] object-contain bg-gray-50"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-[#1A1A1A] bg-opacity-60 text-white text-xs hover:bg-opacity-80 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-[#E4E4E4] hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-400">
                {isDragging ? '여기에 놓으세요' : '클릭 또는 드래그하여 이미지 추가'}
              </p>
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
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (isNew ? '등록 중...' : '저장 중...') : isNew ? '등록' : '수정 저장'}
        </button>
      </div>
    </div>
  );
}

export default NotiDetail;
