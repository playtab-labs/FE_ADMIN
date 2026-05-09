import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMdItemDetail, updateMdOptionValue } from '../apis/mdAPI';

function SaleTypeBadge({ type }) {
  const config = {
    preorder: { label: '사전예약', bg: 'bg-[#E4E4E4]', text: 'text-[#656565]' },
    onsite:   { label: '현장판매', bg: 'bg-[#FFA38C]', text: 'text-[#1A1A1A]' },
  };
  const { label, bg, text } = config[type];
  return (
    <span className={`${bg} ${text} text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg tracking-[-0.1px]`}>
      {label}
    </span>
  );
}

function SizeButton({ value, onToggle, isToggling }) {
  const soldOut = value.isSoldOut;
  return (
    <button
      onClick={() => onToggle(value.id)}
      disabled={isToggling}
      className={`px-2 py-1 rounded-lg text-xs font-extrabold tracking-[-0.1px] transition-colors ${
        isToggling
          ? 'opacity-50 cursor-wait'
          : soldOut
          ? 'bg-[#E4E4E4] text-[#656565] line-through'
          : 'bg-[#FFA38C]/40 text-[#1A1A1A]'
      }`}
    >
      {value.valueName}
    </button>
  );
}

function MDDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingIds, setTogglingIds] = useState(new Set());

  useEffect(() => {
    getMdItemDetail(id)
      .then((data) => {
        console.log('[getMdItemDetail] 응답:', data);
        setDetail(data);
      })
      .catch((err) => {
        console.error('[getMdItemDetail] 오류:', err);
        setError('MD 상세 정보를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSoldOut = async (groupId, valueId) => {
    if (togglingIds.has(valueId)) return;

    const group = detail.optionGroups.find((g) => g.id === groupId);
    const value = group?.values.find((v) => v.id === valueId);
    if (!value) return;

    const nextSoldOut = !value.isSoldOut;

    setTogglingIds((prev) => new Set(prev).add(valueId));
    try {
      await updateMdOptionValue(valueId, {
        optionGroupId: Number(groupId),
        valueName: { ko: value.valueName },
        extraPrice: value.extraPrice,
        isSoldOut: nextSoldOut,
        displayOrder: value.displayOrder,
      });
      setDetail((prev) => ({
        ...prev,
        optionGroups: prev.optionGroups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                values: g.values.map((v) =>
                  v.id === valueId ? { ...v, isSoldOut: nextSoldOut } : v
                ),
              }
            : g
        ),
      }));
    } catch (err) {
      console.error('[toggleSoldOut] 오류:', err);
      alert('품절 상태 변경에 실패했습니다.');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(valueId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="py-24 text-center text-sm text-gray-400">불러오는 중...</div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="py-24 text-center">
          <p className="text-sm text-red-400 mb-3">{error || 'MD를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/md')}
            className="text-sm text-blue-500 hover:underline"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 상단 바 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/md')}
          className="text-sm text-[#656565] hover:text-[#1A1A1A] transition-colors"
        >
          ← 목록
        </button>
        <h1 className="text-xl font-bold text-[#1A1A1A] truncate">{detail.name}</h1>
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-2xl overflow-hidden">
        {/* 썸네일 이미지 */}
        <div className="relative w-full aspect-square bg-gray-100">
          {detail.thumbnailImageUrl ? (
            <img
              src={detail.thumbnailImageUrl}
              alt={detail.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              이미지 없음
            </div>
          )}
          {detail.isSoldOut && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-black tracking-[-0.2px]">SOLD OUT</span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* 뱃지 */}
          <div className="flex gap-2">
            <SaleTypeBadge type="preorder" />
            <SaleTypeBadge type="onsite" />
          </div>

          {/* 상품명 + 가격 */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-[-0.18px]">
              {detail.name}
            </h2>
            <span className="text-sm text-[#1A1A1A] tracking-[-0.14px]">
              {detail.price.toLocaleString()}원
            </span>
          </div>

          {/* 상품 설명 */}
          {detail.productDescription && (
            <p className="text-xs text-[#656565] tracking-[-0.1px]">{detail.productDescription}</p>
          )}

          {/* 구분선 */}
          <div className="h-px bg-[#E4E4E4]" />

          {/* 옵션 그룹 */}
          {detail.optionGroups
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((group) => (
              <div key={group.id}>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-3">{group.name}</p>
                <div className="flex flex-wrap gap-2">
                  {group.values
                    .slice()
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((value) => (
                      <SizeButton
                        key={value.id}
                        value={value}
                        onToggle={(valueId) => toggleSoldOut(group.id, valueId)}
                        isToggling={togglingIds.has(value.id)}
                      />
                    ))}
                </div>
                <p className="text-xs text-[#BFBFBF] mt-2">버튼을 눌러 품절 여부를 변경하세요</p>
              </div>
            ))}
        </div>
      </div>

      {/* 상세 이미지 */}
      {detail.detailImageUrl && (
        <div className="mt-6">
          <img
            src={detail.detailImageUrl}
            alt="상세 이미지"
            className="w-full rounded-2xl border border-[#E4E4E4]"
          />
        </div>
      )}
    </div>
  );
}

export default MDDetail;
