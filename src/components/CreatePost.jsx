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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Be kell jelentkezned!');

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-black">Új probléma beküldése</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Mi a probléma? (röviden)"
            className="w-full p-4 rounded-xl border dark:bg-gray-700 dark:border-gray-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Részletes leírás..."
            className="w-full p-4 rounded-xl border dark:bg-gray-700 dark:border-gray-600 h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <select
            className="w-full p-4 rounded-xl border dark:bg-gray-700 dark:border-gray-600"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Válassz kategóriát (opcionális)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Elérhetőség (pl. Messenger link, email)"
            className="w-full p-4 rounded-xl border dark:bg-gray-700 dark:border-gray-600"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Kép csatolása:</label>

            <label className="relative cursor-pointer group">
              {/* Ez a látható doboz */}
              <div className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {image ? image.name : "Kattints a kép kiválasztásához"}
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG vagy GIF (max. 50MB)</p>
                </div>
              </div>

              {/* Ez a valódi input, amit elrejtünk, de a label miatt kattintható marad */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>

            {/* Ha már választottál képet, mutassunk egy kis előnézetet (opcionális) */}
            {image && (
              <div className="mt-2 text-[10px] text-blue-500 font-bold flex items-center gap-1">
                <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-md">Kép kiválasztva! ✓</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Küldés folyamatban...' : 'Közzététel'}
          </button>
        </form>
      </div>
    </div>
  );
}