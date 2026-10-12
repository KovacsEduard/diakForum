import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { X, HelpCircle, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function CreatePost({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false); // Súgó modál állapota

  // Kategóriák betöltése az adatbázisból
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Profil adat betöltése a bejelentkezett felhasználónak
  useEffect(() => {
    async function loadDefaultContact() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('default_contact')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.default_contact) {
          setContact(data.default_contact);
        }
      } catch (err) {
        console.error("Hiba az alapértelmezett név lekérésekor:", err);
      }
    }
    loadDefaultContact();
  }, [user]);

  const validateMessengerLink = (link) => {
    if (!link) return false;
    const messengerRegex = /^(https?:\/\/)?(www\.)?(m\.me|facebook\.com\/messages|fb\.me)\/.+/;
    return messengerRegex.test(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Be kell jelentkezned!');

    if (!contact.trim()) {
      return alert('Kérjük, add meg a Messenger elérhetőségedet!');
    }

    if (!validateMessengerLink(contact)) {
      return alert('Kérjük, érvényes Messenger linket adj meg! (Pl: https://m.me/felhasznalonev)');
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Képfeltöltés (ha van kép)
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // 2. Adatok mentése a posts táblába
      const { error } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          title,
          description,
          category_id: categoryId || null,
          contact_info: contact,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
        <div
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
          className="w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Fejléc */}
          <div className="p-8 border-b flex justify-between items-center sticky top-0 backdrop-blur-xl z-10" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1 mb-1">
                <Sparkles size={12} /> DiákFórum Közösség
              </span>
              <h2 className="text-2xl font-black">Új probléma beküldése</h2>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="p-2 hover:bg-slate-500/10 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 ml-2" style={{ color: 'var(--text-muted)' }}>
                Mi a probléma?
              </label>
              <input
                type="text"
                placeholder="Pl. Nem értem a matek házit / Elveszett a kulcsom"
                style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all font-medium text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 ml-2" style={{ color: 'var(--text-muted)' }}>
                Részletes leírás
              </label>
              <textarea
                placeholder="Írd le részletesen, hogy miben kell segítség..."
                style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all h-32 resize-none font-medium text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider ml-2" style={{ color: 'var(--text-muted)' }}>
                Kategória
              </label>
              <select
                style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all cursor-pointer font-medium text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Válassz kategóriát (opcionális)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-2 mr-2">
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Messenger link
                </label>
                {/* Kérdőjel Súgó Gomb */}
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle size={14} /> Hol találom?
                </button>
              </div>
              <input
                type="text"
                placeholder="https://m.me/felhasznaloneved"
                style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all font-medium text-sm"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-[11px] font-black uppercase tracking-wider ml-2" style={{ color: 'var(--text-muted)' }}>
                Kép csatolása (opcionális)
              </label>

              <label className="relative cursor-pointer group">
                <div
                  style={{ backgroundColor: 'var(--bg-body)', borderColor: 'var(--border)' }}
                  className="w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-all"
                >
                  <div className="text-blue-500 group-hover:scale-110 transition-transform">
                    <ImageIcon size={28} />
                  </div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                    {image ? image.name : "Kattints a kép kiválasztásához"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer text-sm uppercase tracking-wider"
            >
              {loading ? 'Közzététel folyamatban...' : 'Probléma közzététele'}
            </button>
          </form>
        </div>
      </div>

      {/* SÚGÓ MODÁL A MESSENGER LINKHEZ */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
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
                <li>Nyisd meg a Messenger alkalmazást telefonon vagy gépen.</li>
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
    </>
  );
}