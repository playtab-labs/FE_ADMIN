// title/content가 다국어 객체이거나 문자열일 수 있음
const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.ko ?? value.en ?? Object.values(value)[0] ?? '';
};

const getDate = (item) => {
  if (item.postedAt) return item.postedAt.split('T')[0].replace(/-/g, '.');
  return item.date ?? '';
};

function Badge({ type }) {
  return (
    <span
      className={`shrink-0 text-[10px] font-semibold px-[7px] py-[5px] rounded-full text-[#1A1A1A] ${
        type === 'NEW' ? 'bg-[#FFDAD1]' : 'bg-[#FFA38C]'
      }`}
    >
      {type}
    </span>
  );
}

function NotiList({ items, onView, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm">등록된 공지사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      {items.map((item) => {
        const badge = item.isPinned ? '필독' : item.badge ?? undefined;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 p-4 rounded-lg border border-[#E4E4E4] bg-white hover:border-gray-400 transition-colors"
          >
            {/* 카드 본문 — 클릭하면 상세 이동 */}
            <button
              onClick={() => onView(item.id)}
              className="flex-1 min-w-0 text-left flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex-1 font-semibold text-[#1A1A1A] text-[15px] leading-[17px] truncate">
                  {getText(item.title)}
                </p>
                {badge && <Badge type={badge} />}
              </div>
              <p className="text-xs text-[#656565] font-light">{getDate(item)}</p>
              <p className="text-sm text-[#1A1A1A] font-light mt-[7px] line-clamp-2">
                {getText(item.content)}
              </p>
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={() => onDelete(item.id)}
              className="shrink-0 mt-0.5 text-xs px-2.5 py-1.5 rounded-md border border-[#E4E4E4] text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default NotiList;
