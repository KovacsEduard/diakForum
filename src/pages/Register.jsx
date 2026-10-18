import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <--- Jelszó láthatóság state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert('Sikeres regisztráció! Kérjük, ellenőrizd az emailed a megerősítéshez, vagy jelentkezz be.');
      navigate('/login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.hostname === 'localhost'
            ? `${window.location.origin}/`
            : `${window.location.origin}/diakForum/`
        },
      });
      if (error) throw error;
    } catch (err) {
      setError('Nem sikerült bejelentkezni a Google fiókkal.');
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
              A közösség, ami összeköt.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Email cím
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
              placeholder="pelda@diak.hu"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Jelszó
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} // <--- Dinamikusan váltja a típust
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                placeholder="••••••••"
              />
              {/* Szem ikon gomb a jelszó mutatásához/elrejtéséhez */}
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
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        {/* ELVÁLASZTÓ */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 font-bold text-[10px]" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
              vagy folytasd ezzel
            </span>
          </div>
        </div>

        {/* GOOGLE REGISZTRÁCIÓ / BEJELENTKEZÉS GOMB */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
          className="w-full py-3 px-4 border rounded-xl font-bold text-xs flex items-center justify-center gap-3 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google fiókkal
        </button>

        {/* BEJELENTKEZÉSI LINK */}
        <div className="mt-6 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Már van fiókod?{' '}
          <Link to="/login" className="font-bold text-blue-500 hover:underline">
            Jelentkezz be itt!
          </Link>
        </div>

      </div>
    </div>
  );
}