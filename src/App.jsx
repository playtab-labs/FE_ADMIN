import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import Notification from './pages/Notification';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;