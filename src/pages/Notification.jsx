import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import NotiList from '../components/NotiList';
import { getNotices, deleteNotice } from '../apis/noticeAPI';

function Notification() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotices();
      console.log('[getNotices] 응답:', data);
      // contentPreview → content로 매핑해 NotiList와 호환
      setItems(data.map((n) => ({ ...n, content: n.contentPreview })));
    } catch (err) {
      console.error('[getNotices] 오류:', err);
      setError('공지사항을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleDelete = async (id) => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(id);
      setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
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
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button
                onClick={fetchNotices}
                className="text-sm text-blue-500 hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <NotiList
              items={items}
              onView={(id) => navigate(`/notifications/${id}`)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Notification;
