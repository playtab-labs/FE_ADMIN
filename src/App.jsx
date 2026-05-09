import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import Navbar from './components/Navbar';
import Main from './pages/main';
import Notification from './pages/Notification';
import NotiDetail from './pages/NotiDetail';
import MD from './pages/MD';
import MDDetail from './pages/MDDetail';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
        <Route path="/notifications/:id" element={<ProtectedRoute><NotiDetail /></ProtectedRoute>} />
        <Route path="/md" element={<ProtectedRoute><MD /></ProtectedRoute>} />
        <Route path="/md/:id" element={<ProtectedRoute><MDDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
