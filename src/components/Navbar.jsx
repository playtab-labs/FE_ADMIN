import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
  }`;

function Navbar() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6">
      <NavLink to="/" className="text-base font-bold text-gray-800 hover:text-blue-600 transition-colors">
        Playtap Admin
      </NavLink>

      <div className="flex items-center gap-1">
        <NavLink to="/" end className={navLinkClass}>
          홈
        </NavLink>
        <NavLink to="/notifications" className={navLinkClass}>
          공지사항
        </NavLink>
        <NavLink to="/md" className={navLinkClass}>
          MD
        </NavLink>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="ml-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            로그아웃
          </button>
        ) : (
          <NavLink
            to="/login"
            className="ml-3 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            로그인
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
