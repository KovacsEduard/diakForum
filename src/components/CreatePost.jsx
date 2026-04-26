import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export default function CreatePost({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kategóriák betöltése az adatbázisból
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // A PostForm-ban, ahol a beküldés van:
  // Profil adat betöltése a bejelentkezett felhasználónak
  useEffect(() => {
    async function loadDefaultContact() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('default_contact')
          .eq('id', user.id)
          .maybeSingle(); // single() helyett maybeSingle(), így nem dob hibát ha még nincs profil

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
  // Ellenőrzi, hogy a link tartalmazza-e a messengerre utaló kulcsszavakat
  const messengerRegex = /^(https?:\/\/)?(www\.)?(m\.me|facebook\.com\/messages|fb\.me)\/.+/;
  return messengerRegex.test(link);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Be kell jelentkezned!');

    if (!contact.trim()) {
    return alert('Kérjük, add meg a Messenger elérhetőségedet!');
  }

  // 2. Ellenőrzés: Valódi Messenger link-e
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

        // Kép URL lekérése (v2 syntax)
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

      onSuccess(); // Frissíti a listát és bezárja a modalt
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      {/* MÓDOSÍTOTT SZÍNEK: Használjuk a CSS változóidat, 
         hogy a modál is váltson témát! 
      */}
      <div
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
        className="w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300"
      >
        <div className="p-8 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-black">Új probléma beküldése</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:scale-110 transition-transform">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <input
            type="text"
            placeholder="Mi a probléma? (röviden)"
            style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
            className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Részletes leírás..."
            style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
            className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all h-32 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>
              Kategória
            </label>
            <select
              style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
              className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all cursor-pointer"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Válassz kategóriát (opcionális)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>
              Elérhetőség (Messenger link)
            </label>
            <input
              type="text"
              placeholder="https://m.me/felhasznalonev"
              style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
              className="w-full p-4 rounded-2xl border outline-none focus:ring-2 ring-blue-500 transition-all"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>
              Kép csatolása (opcionális)
            </label>

            <label className="relative cursor-pointer group">
              <div
                style={{ backgroundColor: 'var(--bg-body)', borderColor: 'var(--border)' }}
                className="w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-all"
              >
                <div className="text-blue-500 group-hover:scale-110 transition-transform">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                </div>
                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                  {image ? image.name : "Fájl kiválasztása"}
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-[1.5rem] transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Feltöltés...' : 'Közzététel'}
          </button>
        </form>
      </div>
    </div>
  );
}