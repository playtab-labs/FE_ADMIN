import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NotiList from '../components/NotiList';
import { deleteNotice } from '../apis/noticeAPI';

export const STORAGE_KEY = 'playtap_notiItems';

const INITIAL_ITEMS = [
  {
    id: '1',
    title: '[안내] 플레이탭 2026 공지사항 제목',
    date: '2026.04.01',
    content: '공지사항 내용이 들어가는 자리입니다. 자세한 내용은 본문을 확인해 주세요. 자세한 내용은 본문을 확인해 주세요. 자세한 내용은 본문을 확인해 주세요',
    badge: 'NEW',
  },
  {
    id: '2',
    title: '[안내] 플레이탭 2026 공지사항 제목',
    date: '2026.03.25',
    content: '공지사항 내용이 들어가는 자리입니다. 자세한 내용은 본문을 확인해 주세요.',
    badge: '필독',
  },
  {
    id: '3',
    title: '[안내] 플레이탭 2026 공지사항 제목',
    date: '2026.03.10',
    content: '공지사항 내용이 들어가는 자리입니다. 자세한 내용은 본문을 확인해 주세요.',
  },
  {
    id: '4',
    title: '[안내] 플레이탭 2026 공지사항 제목',
    date: '2026.02.28',
    content: '공지사항 내용이 들어가는 자리입니다. 자세한 내용은 본문을 확인해 주세요.',
  },
  {
    id: '5',
    title: '[안내] 플레이탭 2026 공지사항 제목',
    date: '2026.02.14',
    content: '공지사항 내용이 들어가는 자리입니다. 자세한 내용은 본문을 확인해 주세요.',
  },
];

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_ITEMS;
  }
}

function Notification() {
  const navigate = useNavigate();
  const [items, setItems] = useState(loadItems);

  const handleDelete = async (id) => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(id);
      const updated = items.filter((item) => String(item.id) !== String(id));
      setItems(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('[deleteNotice] 오류:', err);
      alert(err.response?.data?.message ?? '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">공지사항 관리</h1>
        <button
          onClick={() => navigate('/notifications/new')}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 새 공지 추가
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">
            총 <strong className="text-gray-800">{items.length}</strong>건
          </span>
        </div>
        <div className="px-4">
          <NotiList
            items={items}
            onView={(id) => navigate(`/notifications/${id}`)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default Notification;
