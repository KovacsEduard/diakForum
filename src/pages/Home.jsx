import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard'; // Ezt is kiszervezzük!
import Header from '../components/Header';   // Ezt is!

export default function Home() {
  const { user, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header user={user} onSignOut={signOut} />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-xl font-bold italic underline decoration-blue-500 underline-offset-8">
            Aktuális segélykérések
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl transition-all"
          >
            + Új probléma megosztása
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 opacity-50 italic">Posztok betöltése...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
            ))}
          </div>
        )}

        {isModalOpen && (
          <CreatePost
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => { setIsModalOpen(false); fetchPosts(); }}
          />
        )}
      </div>
    </div>
  );
}