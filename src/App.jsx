import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import Login from './pages/Login';
import CreatePost from './components/CreatePost';
import { MessageCircle, Trash2, CheckCircle } from 'lucide-react';

function App() {
  const { user, profile, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Posztok lekérése az adatbázisból
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, categories(name, color_code), profiles(full_name)')
      .order('created_at', { ascending: false });

    if (!error) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b dark:border-gray-800 mb-8">
          <div>
            <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">DIÁKFÓRUM</h1>
            <p className="text-xs text-gray-500 font-medium">{user.email}</p>
          </div>
          <button onClick={signOut} className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold transition-all">
            Kilépés
          </button>
        </header>

        {/* Új poszt gomb és cím */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-xl font-bold italic underline decoration-blue-500 underline-offset-8">Aktuális segélykérések</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl shadow-blue-500/20 shadow-xl transition-all active:scale-95"
          >
            + Új probléma megosztása
          </button>
        </div>

        {/* Posztok listája */}
        {loading ? (
          <div className="text-center py-20 opacity-50 italic">Posztok betöltése...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {post.image_url && (
                    <img src={post.image_url} alt="Poszt képe" className="w-full h-48 object-cover rounded-2xl mb-4" />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md">
                      {post.categories?.name || 'Egyéb'}
                    </span>
                    {post.is_solved && (
                      <span className="flex items-center gap-1 text-green-500 text-xs font-bold">
                        <CheckCircle size={14} /> Megoldva
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold leading-tight mb-2">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 italic">
                    "{post.description}"
                  </p>
                </div>

                <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                  <a 
                    href={post.contact_info} 
                    target="_blank" 
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    <MessageCircle size={16} /> Segítek
                  </a>
                  
                  {(user.id === post.user_id || profile?.is_admin) && (
                    <button className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-gray-500 font-medium">Még senki nem kért segítséget. Legyél te az első!</p>
          </div>
        )}

        {isModalOpen && (
          <CreatePost 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchPosts(); // Újratölti a listát a beküldés után
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;