import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: fullName || 'Felhasználó',
              points: 0
            }
          ]);

        if (profileError) throw profileError;
      }

      alert('Sikeres regisztráció!');
      navigate('/login');

    } catch (err) {
      setError(err.message || 'Hiba történt a regisztráció során.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="w-full max-w-md rounded-[2.5rem] p-8 border shadow-2xl relative z-10 backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 bg-clip-text text-transparent">
            DIÁKFÓRUM
          </h1>
          <p className="text-xs font-semibold tracking-wide uppercase opacity-75" style={{ color: 'var(--text-muted)' }}>
            Regisztráció
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Teljes Név</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
              placeholder="Kovács Péter"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Email cím</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
              placeholder="pelda@diak.hu"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Jelszó</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg focus:outline-none opacity-75 hover:opacity-100 cursor-pointer"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-lg cursor-pointer"
          >
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

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