import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMdItems } from '../apis/mdAPI';

function MdProductCard({ item }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E4E4E4] bg-white overflow-hidden">
      {/* 이미지 */}
      <div className="relative w-full" style={{ height: 164 }}>
        <img
          src={item.thumbnailImageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.isSoldOut && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <span className="text-xl font-extrabold text-black tracking-[-0.2px]">Sold out</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-2.5">
        <p className="text-sm font-extrabold text-[#1A1A1A] truncate">{item.name}</p>
        <p className="text-xs text-[#1A1A1A] tracking-[-0.1px]">
          {item.price.toLocaleString()}원
        </p>
      </div>
    </div>
  );
}

function MD() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMdItems()
      .then((data) => {
        console.log('[getMdItems] 응답:', data);
        setItems(data);
      })
      .catch((err) => {
        console.error('[getMdItems] 오류:', err);
        setError('MD 목록을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">MD</h1>
        <span className="text-sm text-gray-400">총 {items.length}개</span>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">불러오는 중...</div>
      ) : error ? (
        <div className="py-24 text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-500 hover:underline"
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center text-sm text-gray-400">등록된 MD가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <button key={item.id} onClick={() => navigate(`/md/${item.id}`)} className="text-left">
              <MdProductCard item={item} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MD;
