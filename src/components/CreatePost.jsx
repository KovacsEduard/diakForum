import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext'; // EZ HIÁNYZOTT!
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function CreatePost({ onClose, onSuccess }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Form állapotok
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contact, setContact] = useState(profile?.default_contact || '');
  const [image, setImage] = useState(null);

  // Kategóriák betöltése
  useEffect(() => {
    async function getCategories() {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    }
    getCategories();
  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!user?.id) {
      alert("Hiba: Nem vagy bejelentkezve vagy az azonosítás sikertelen!");
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Képfeltöltés, ha van kiválasztva kép
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      }

      // 2. Poszt mentése az adatbázisba
      const { error } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          title,
          description,
          category_id: categoryId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Új probléma kiírása</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} className="dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cím */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Mi a probléma?</label>
            <input
              type="text"
              required
              placeholder="Pl: Matek korrepetálás kellene"
              className="w-full px-4 py-2 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Kategória */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Kategória</label>
            <select
              required
              className="w-full px-4 py-2 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Válassz kategóriát...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Leírás */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Részletek</label>
            <textarea
              rows="3"
              required
              placeholder="Írd le pontosan, miben kérsz segítséget..."
              className="w-full px-4 py-2 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Elérhetőség */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Messenger link (vagy más elérhetőség)</label>
            <input
              type="text"
              required
              placeholder="https://m.me/felhasznalonev"
              className="w-full px-4 py-2 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          {/* Képfeltöltés */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Kép csatolása (opcionális)</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="file-upload"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer group-hover:border-blue-500 transition"
              >
                {image ? (
                  <span className="text-sm text-blue-500 font-medium truncate">{image.name}</span>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <ImageIcon size={20} />
                    <span className="text-sm">Kattints a kép kiválasztásához</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Küldés gomb */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Posztolás'}
          </button>
        </form>
      </div>
    </div>
  );
}
