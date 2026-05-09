const BADGE_STYLES = {
  NEW: 'bg-blue-100 text-blue-700',
  필독: 'bg-red-100 text-red-700',
};

// title/content가 다국어 객체일 수도 있고 문자열일 수도 있음
const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.ko ?? value.en ?? Object.values(value)[0] ?? '';
};

const getDate = (item) => {
  if (item.postedAt) return item.postedAt.slice(0, 10).replace(/-/g, '.');
  return item.date ?? '';
};

function NotiList({ items, onView, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-base">등록된 공지사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-4 py-4 px-2 hover:bg-gray-50 rounded transition-colors">
          <button
            onClick={() => onView(item.id)}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              {item.badge && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[item.badge] ?? 'bg-gray-100 text-gray-600'}`}>
                  {item.badge}
                </span>
              )}
              {item.isPinned && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">고정</span>
              )}
              {item.isVisible === false && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">비공개</span>
              )}
              <span className="text-xs text-gray-400">{getDate(item)}</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{getText(item.title)}</p>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{getText(item.content)}</p>
          </button>
          <div className="flex items-center shrink-0 pt-1">
            <button
              onClick={() => onDelete(item.id)}
              className="text-sm px-3 py-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotiList;
