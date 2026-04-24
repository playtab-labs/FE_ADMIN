import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Main from './pages/main';
import Notification from './pages/Notification';
import NotiDetail from './pages/NotiDetail';
import MD from './pages/MD';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { isLoggedIn } = useAuth();
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
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
