import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Main from './pages/main';
import Notification from './pages/Notification';
import NotiDetail from './pages/NotiDetail';
import MD from './pages/MD';
import Login from './pages/Login';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/notifications/:id" element={<NotiDetail />} />
        <Route path="/md" element={<MD />} />
        <Route path="/login" element={<Login />} />
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
