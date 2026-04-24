import { useNavigate } from 'react-router-dom';

function Main() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <h1>Playtap Admin</h1>

      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className='bg-gray-500 text-white font-bold py-2 px-4 rounded'
      >
        공지사항 추가하기
      </button>

      <button
        type="button"
        onClick={() => navigate('/md')}
        className='bg-gray-500 text-white font-bold py-2 px-4 rounded ml-4'
      >
        MD 관리하기
      </button>
    </div>
  );
}

export default Main;