import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setMessage('A jelszavad sikeresen megváltozott! Mindjárt átirányítunk a bejelentkezéshez...');
      
      // 3 másodperc múlva automatikusan átirányítjuk a login oldalra
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Nem sikerült frissíteni a jelszót.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>

      {/* MARKETING DESIGN ELEM: Háttérben sugárzó kék-narancs fényhatások */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md rounded-[2.5rem] p-8 border shadow-2xl relative z-10 backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>

        {/* MÁRKA ÉS LOGÓ MEGJELENÍTÉS */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="DiákFórum Logo"
              className="w-20 h-20 object-cover rounded-xl shadow-md"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 bg-clip-text text-transparent">
              DIÁKFÓRUM
            </h1>
            <p className="text-xs font-semibold tracking-wide uppercase opacity-75 mt-1" style={{ color: 'var(--text-muted)' }}>
              Új jelszó megadása
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Új jelszó
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                placeholder="••••••••"
              />
              {/* Szem ikon gomb */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg focus:outline-none opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                title={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer active:scale-98"
          >
            {loading ? 'Mentés...' : 'Jelszó frissítése'}
          </button>
        </form>

      </div>
    </div>
  );
}