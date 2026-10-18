import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Itt frissítjük a bejelentkezett felhasználó jelszavát
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setMessage('A jelszavad sikeresen megváltozott! Mostmár bejelentkezhetsz az új jelszóval.');
      // Opcionálisan átirányíthatod a főoldalra vagy bejelentkezéshez 2-3 másodperc múlva
    } catch (err) {
      setError(err.message || 'Nem sikerült frissíteni a jelszót.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Új jelszó megadása</h2>
      <form onSubmit={handleUpdatePassword}>
        <input
          type="password"
          placeholder="Add meg az új jelszót"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Mentés...' : 'Jelszó frissítése'}
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}