import { LogOut, User, Sun, Moon, X, Save, Loader2, Camera, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Header({ user, onSignOut }) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', default_contact: '', avatar_url: '' });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (user && isProfileOpen) fetchProfile();
  }, [user, isProfileOpen]);

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfileData(data);
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }));
    } else {
      alert("Hiba a feltöltésnél: " + uploadError.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isProfileOpen]);

  async function handleSaveProfile() {
    let contactLink = profileData.default_contact?.trim();

    if (!contactLink) {
      alert("Kérjük, adj meg egy Messenger linket!");
      return;
    }

    if (!contactLink.startsWith('http')) {
      contactLink = 'https://' + contactLink;
    }

    const messengerRegex = /^(https?:\/\/)?(www\.)?(m\.me|facebook\.com\/messages|fb\.me)\/.+/;

    if (!messengerRegex.test(contactLink)) {
      alert("Érvénytelen Messenger link! Használj m.me/felhasznalonev formátumot.");
      return;
    }

    const updatedData = {
      ...profileData,
      default_contact: contactLink
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id);

    if (!error) {
      setIsProfileOpen(false);
      window.location.reload();
    } else {
      alert("Hiba történt a mentés során: " + error.message);
    }
  }

  return (
    <header className="w-full header-blur sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="relative max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* LOGÓ ÉS MÁRKA NÉV (Stílusos színátmenettel, mint a bejelentkezésen) */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 bg-clip-text text-transparent">
            DiákFórum
          </h1>
        </div>

        {/* VEZÉRLŐ GOMBOK */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-3 rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-yellow-400 hover:scale-105 transition-all shadow-sm cursor-pointer"
            title="Téma váltása"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={() => setIsProfileOpen(true)} 
            className="p-3 rounded-2xl custom-card shadow-sm hover:scale-105 transition-all border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center gap-2"
            title="Profil szerkesztése"
          >
            <User size={18} />
          </button>

          <button 
            onClick={onSignOut} 
            className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-sm cursor-pointer"
            title="Kijelentkezés"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* PROFIL MODÁL */}
      {isProfileOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsProfileOpen(false)}
          />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)'
            }}
            className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl border flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 overflow-hidden"
          >
            {/* Fejléc */}
            <div className="p-8 pb-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1 mb-0.5">
                  <Sparkles size={12} /> Fiókbeállítások
                </span>
                <h2 className="text-2xl font-black">Profilom</h2>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-full hover:bg-slate-500/10 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Tartalom */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex flex-col items-center py-2">
                <label className="relative cursor-pointer group">
                  <div
                    style={{
                      backgroundColor: 'var(--bg-body)',
                      borderColor: 'var(--border)'
                    }}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-500 shadow-inner"
                  >
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={28} style={{ color: 'var(--text-muted)' }} />
                    )}
                    {loading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Kép módosítása
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider ml-2" style={{ color: 'var(--text-muted)' }}>
                    Teljes név
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    style={{
                      backgroundColor: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border)'
                    }}
                    className="w-full p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium text-sm"
                    placeholder="Írd be a neved..."
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-2 mr-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Messenger link
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHelpOpen(true)}
                      className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Hol találom?
                    </button>
                  </div>
                  <input
                    type="text"
                    value={profileData.default_contact || ''}
                    onChange={(e) => setProfileData({ ...profileData, default_contact: e.target.value })}
                    style={{
                      backgroundColor: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border)'
                    }}
                    className="w-full p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium text-sm"
                    placeholder="https://m.me/..."
                  />
                </div>
              </div>
            </div>

            {/* SÚGÓ MODÁL */}
            {isHelpOpen && (
              <div className="absolute inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-main)'
                  }}
                  className="w-full max-w-sm rounded-[2.5rem] p-6 border shadow-2xl relative space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-blue-500">Hol a Messenger linkem?</h3>
                    <button
                      onClick={() => setIsHelpOpen(false)}
                      style={{ color: 'var(--text-muted)' }}
                      className="hover:opacity-80 font-bold text-lg p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    <p>Így találod meg a saját Messenger elérésedet:</p>
                    <ol className="list-decimal list-inside space-y-2 font-medium" style={{ color: 'var(--text-main)' }}>
                      <li>Nyisd meg a Messenger alkalmazást telefonon vagy számítógépen.</li>
                      <li>Menj a <span className="font-bold text-blue-500">Beállítások</span> menübe.</li>
                      <li>Keresd meg a <span className="font-bold text-blue-500">Felhasználónév (Username)</span> opciót.</li>
                      <li>A linked alapformátuma ez lesz: <br />
                        <code className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded select-all inline-block mt-1">
                          https://m.me/a.felhasznaloneved
                        </code>
                      </li>
                      <li>Csak cseréld le a neves részt a sajátodra!</li>
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Értem, köszönöm!
                  </button>
                </div>
              </div>
            )}

            {/* Mentés gomb */}
            <div className="p-8 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
              >
                <Save size={18} /> Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}