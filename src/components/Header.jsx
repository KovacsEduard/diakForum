import { LogOut, User, Sun, Moon, X, Save, Upload, Loader2, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import logoVilagos from '../assets/logo-vilagos.png';
import logoSotet from '../assets/logo-sotet.png';

export default function Header({ user, onSignOut }) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', default_contact: '', avatar_url: '' });

  // Automatikus betöltés, amikor megnyitod a profilt
  useEffect(() => {
    if (user && isProfileOpen) fetchProfile();
  }, [user, isProfileOpen]);

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfileData(data);
  }

  // Fájlfeltöltés kezelése
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

  // 1. EZ A HIÁNYZÓ RÉSZ: Ez vezérli a tényleges stílusváltást
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 2. EZ IS FONTOS: Akadályozzuk meg az oldal görgetését, ha nyitva a profil
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

    // 1. Ha üres az elérhetőség, döntsd el, hogy engeded-e (itt most kötelezővé tesszük)
    if (!contactLink) {
      alert("Kérjük, adj meg egy Messenger linket!");
      return;
    }

    // 2. Automatikus javítás: ha nincs előtte http, tegyük elé
    if (!contactLink.startsWith('http')) {
      contactLink = 'https://' + contactLink;
    }

    // 3. Messenger-specifikus ellenőrzés (Regex)
    const messengerRegex = /^(https?:\/\/)?(www\.)?(m\.me|facebook\.com\/messages|fb\.me)\/.+/;

    if (!messengerRegex.test(contactLink)) {
      alert("Érvénytelen Messenger link! Használj m.me/felhasznalonev formátumot.");
      return;
    }

    // Frissített adatok előkészítése a mentéshez
    const updatedData = {
      ...profileData,
      default_contact: contactLink
    };

    // 4. Mentés a Supabase-be
    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id);

    if (!error) {
      setIsProfileOpen(false);
      // A reload helyett elegánsabb lenne csak a state-et frissíteni, 
      // de ha az egész oldalt akarod frissíteni, ez maradjon:
      window.location.reload();
    } else {
      alert("Hiba történt a mentés során: " + error.message);
    }
  }

  return (
    <header className="w-full header-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center">
          <img src={darkMode ? logoSotet : logoVilagos} alt="Logo" className="h-10 w-auto" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-slate-800 text-white dark:bg-yellow-400 dark:text-slate-900 transition-all">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={() => setIsProfileOpen(true)} className="p-3 rounded-2xl custom-card shadow-sm hover:scale-105 transition-all">
            <User size={20} />
          </button>

          <button onClick={onSignOut} className="p-2 text-slate-500 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* PROFIL MODÁL - FIX pozíció az egész képernyőn */}
      {isProfileOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center p-4">

          {/* Háttér homályosítás - itt maradt a fekete áttetszőség a fókusz miatt */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setIsProfileOpen(false)}
          />

          {/* A Modál Doboza - Kizárólag a CSS változóiddal */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)'
            }}
            className="
        relative 
        w-full max-w-md 
        rounded-[2.5rem] 
        shadow-[0_0_50px_rgba(0,0,0,0.3)]
        border
        flex flex-col
        max-h-[85vh] 
        animate-in zoom-in duration-300
      "
          >

            {/* 1. Fejléc */}
            <div className="p-8 pb-4 flex justify-between items-center">
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>Profilom</h2>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* 2. Tartalom */}
            <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
              <div className="space-y-6">

                <div className="flex flex-col items-center py-4">
                  <label className="relative cursor-pointer group">
                    <div
                      style={{
                        backgroundColor: 'var(--bg-image-placeholder)',
                        borderColor: 'var(--border)'
                      }}
                      className="w-24 h-24 rounded-[2rem] border-2 border-dashed overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-500"
                    >
                      {profileData.avatar_url ? (
                        <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={32} style={{ color: 'var(--text-muted)' }} />
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-muted)' }}>
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
                      className="w-full p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all"
                      placeholder="Írd be a neved..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-muted)' }}>
                      Messenger link
                    </label>
                    <input
                      type="text"
                      value={profileData.default_contact || ''}
                      onChange={(e) => setProfileData({ ...profileData, default_contact: e.target.value })}
                      style={{
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border)'
                      }}
                      className="w-full p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all"
                      placeholder="https://m.me/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Mentés gomb */}
            <div className="p-8 pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}