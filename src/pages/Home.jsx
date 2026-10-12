import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Header from '../components/Header';
import { ArrowUp, Sparkles, Filter, ChevronDown, Check } from 'lucide-react';

export default function Home() {
  const { user, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Állapotok az egyedi lenyíló menükhöz
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const categoryRef = useRef(null);
  const sortRef = useRef(null);

  // Kattintás figyelése kívül, hogy bezáródjon a menü
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from('posts')
      .select('*, categories(name, color_code), profiles(full_name, avatar_url, default_contact)');

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    query = query.order('created_at', { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (!error) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortOrder]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Aktuális kategória neve a gombon
  const currentCategoryName = selectedCategory === 'all' 
    ? 'Minden kategória' 
    : categories.find(c => c.id === selectedCategory)?.name || 'Kategória';

  const currentSortName = sortOrder === 'desc' ? 'Legújabb elöl' : 'Legrégebbi elöl';

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header user={user} onSignOut={signOut} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">

        {/* HERO / ÜDVÖZLŐ SÁV */}
        <div className="mb-10 p-8 rounded-[2.5rem] relative overflow-hidden border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-500 flex items-center justify-center md:justify-start gap-1">
              <Sparkles size={14} /> DiákFórum Közösségi Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Aktuális segélykérések
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-75 max-w-xl" style={{ color: 'var(--text-muted)' }}>
              Segíts a diáktársaidnak, oszd meg a problémádat, vagy találj azonnali megoldást egyetlen kattintással!
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/25 transition-all text-sm uppercase tracking-wider whitespace-nowrap cursor-pointer active:scale-95"
          >
            + Új probléma megosztása
          </button>
        </div>

        {/* ELEGÁNS EGYEDI SZŰRŐ SÁV */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="text-xs font-black uppercase tracking-wider opacity-60 flex items-center gap-2">
            <Filter size={14} /> Összesen {posts.length} bejegyzés
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            
            {/* 1. EGYEDI KATEGÓRIA DROPDOWN */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsSortOpen(false); }}
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                className="px-5 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 shadow-sm hover:border-blue-500 transition-all cursor-pointer"
              >
                <span>{currentCategoryName}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-blue-500' : 'opacity-60'}`} />
              </button>

              {isCategoryOpen && (
                <div 
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1"
                >
                  <button
                    onClick={() => { setSelectedCategory('all'); setIsCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-500/10'}`}
                  >
                    <span>Minden kategória</span>
                    {selectedCategory === 'all' && <Check size={14} />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setIsCategoryOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-500/10'}`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. EGYEDI RENDEZÉS DROPDOWN */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => { setIsSortOpen(!isSortOpen); setIsCategoryOpen(false); }}
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                className="px-5 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 shadow-sm hover:border-blue-500 transition-all cursor-pointer"
              >
                <span>{currentSortName}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-blue-500' : 'opacity-60'}`} />
              </button>

              {isSortOpen && (
                <div 
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1"
                >
                  <button
                    onClick={() => { setSortOrder('desc'); setIsSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${sortOrder === 'desc' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-500/10'}`}
                  >
                    <span>Legújabb elöl</span>
                    {sortOrder === 'desc' && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => { setSortOrder('asc'); setIsSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${sortOrder === 'asc' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-500/10'}`}
                  >
                    <span>Legrégebbi elöl</span>
                    {sortOrder === 'asc' && <Check size={14} />}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* POSZTOK LISTÁJA */}
        {loading ? (
          <div className="text-center py-24 opacity-60 font-bold animate-pulse text-sm">Posztok betöltése folyamatban...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 rounded-[2.5rem] border border-dashed opacity-75 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <p className="font-bold text-base">Nincs találat a kiválasztott szűrők alapján.</p>
            <p className="text-xs opacity-60">Próbálj meg másik kategóriát választani vagy hozz létre egy új bejegyzést!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.path || posts.map(post => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  categories: post.categories || { name: 'Egyéb', color_code: '#3b82f6' }
                }}
                onUpdate={fetchPosts}
              />
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

      {/* VISSZA A TETEJÉRE GOMB */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer animate-in fade-in zoom-in-95"
          title="Vissza a tetejére"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}