import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter basename="/diakForum">
      <Routes>
        {/* Ha be van lépve Home, ha nincs Login */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        
        {/* Auth utak */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;