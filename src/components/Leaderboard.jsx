import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trophy, HelpCircle, Sparkles, Flame, CheckCircle } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, points')
        .order('points', { ascending: false })
        .limit(5);

      if (error) throw error;
      setLeaders(data || []);
    } catch (err) {
      console.error('Hiba a ranglista betöltésekor:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dinamikus rang és stílus a helyezés (index) alapján
  const getRankStyle = (index) => {
    switch (index) {
      case 0: // #1 Helyezett -> BRUTÁLIS PIROS GLOW EFFECT
        return {
          title: '🔥 SULI LEGENDA',
          style: 'bg-red-500/15 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse font-black scale-105'
        };
      case 1: // #2 Helyezett -> Arany fény
        return {
          title: '⚡ ARANY FŐNÖK',
          style: 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
        };
      case 2: // #3 Helyezett -> Ezüst
        return {
          title: '⭐ TOP SEGÍTŐ',
          style: 'bg-blue-500/15 border-blue-500/30 text-blue-400 font-bold'
        };
      case 3: // #4 Helyezett -> Bronz
        return {
          title: '🛡️ AKTÍV DIÁK',
          style: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 font-semibold'
        };
      default: // 5. helytől lefelé -> Szimpla írás
        return {
          title: '🌱 Újonc Tag',
          style: 'border-transparent text-gray-400 font-normal opacity-80'
        };
    }
  };

  return (
    <>
      <div 
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} 
        className="p-6 rounded-[2.5rem] border shadow-xl space-y-4 relative"
      >
        {/* FEJLÉC ÉS SZABÁLYOK GOMB */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-blue-500">
            <Trophy size={16} /> Top Segítő Diákok
          </h3>
          <button
            onClick={() => setIsRulesOpen(true)}
            className="text-[10px] font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 transition-all hover:scale-105"
          >
            <HelpCircle size={12} /> Szabályok
          </button>
        </div>

        {/* LISTA */}
        {loading ? (
          <div className="text-center py-6 text-xs opacity-60 font-bold animate-pulse">Ranglista betöltése...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-6 text-xs opacity-60 font-bold">Még nincsenek aktív diákok.</div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => {
              const rankInfo = getRankStyle(index);
              return (
                <div 
                  key={leader.id} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${index === 0 ? 'my-1' : ''}`}
                  style={{ backgroundColor: 'var(--bg-body)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black w-4 text-center ${index === 0 ? 'text-red-500 text-sm' : index === 1 ? 'text-amber-400' : index === 2 ? 'text-blue-400' : 'opacity-50'}`}>
                      #{index + 1}
                    </span>

                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      {leader.avatar_url ? (
                        <img src={leader.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="font-black text-xs text-blue-500">{leader.full_name?.charAt(0) || 'D'}</span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-black" style={{ color: 'var(--text-main)' }}>
                        {leader.full_name || 'Diák'}
                      </p>
                      <span className={`inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 transition-all ${rankInfo.style}`}>
                        {rankInfo.title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-blue-500 block">
                      {leader.points || 0} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JÁTÉKSZABÁLYOK MODÁL (Kivéve az el nem készült funkciókat) */}
      {isRulesOpen && (
        <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
            className="w-full max-w-md rounded-[2.5rem] p-6 border shadow-2xl relative space-y-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-black text-blue-500 flex items-center gap-2">
                <Sparkles size={18} /> Játékszabályok & Rangok
              </h3>
              <button
                onClick={() => setIsRulesOpen(false)}
                className="hover:opacity-80 font-bold text-lg p-1 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* PONTSZERZÉS */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Hogyan gyűjthetsz pontot?</h4>
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center gap-2 text-xs font-bold text-blue-400">
                <CheckCircle size={16} /> Új probléma / poszt közzététele: <strong>+10 pont</strong>
              </div>
            </div>

            {/* RANGLISTA ALAPÚ RANGOK */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Hogyan szerezhetsz vagány rangot?</h4>
              <p className="text-[11px] opacity-70">A rangok közvetlenül a **Top Ranglistán elfoglalt helyezésedtől** függnek. Minél előrébb törsz a pontjaiddal, annál komolyabb címet kapsz!</p>
              
              <div className="space-y-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center justify-between shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <span className="font-black text-red-400">🔥 1. Helyezett</span>
                  <span className="font-bold text-[11px] text-red-300">Suli Legenda (Izzó piros hatás)</span>
                </div>

                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                  <span className="font-black text-amber-400">⚡ 2. Helyezett</span>
                  <span className="font-bold text-[11px] text-amber-300">Arany Főnök</span>
                </div>

                <div className="p-2.5 rounded-xl border border-blue-500/25 bg-blue-500/10 flex items-center justify-between">
                  <span className="font-black text-blue-400">⭐ 3. Helyezett</span>
                  <span className="font-bold text-[11px] text-blue-300">Top Segítő</span>
                </div>

                <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
                  <span className="font-black text-indigo-300">🛡️ 4. Helyezett</span>
                  <span className="font-bold text-[11px] text-indigo-300">Aktív Diák</span>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-500/20 bg-slate-500/5 flex items-center justify-between">
                  <span className="font-normal text-gray-400">🌱 5. helytől lefelé</span>
                  <span className="font-normal text-[11px] text-gray-400">Újonc Tag (Szimpla írás)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              Rendben, megértettem!
            </button>
          </div>
        </div>
      )}
    </>
  );
}