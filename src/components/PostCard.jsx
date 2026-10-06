import { MessageCircle, Trash2, CheckCircle, X } from 'lucide-react'; // X ikon a bezáráshoz
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
    const { user, profile } = useAuth();
    const [isImageOpen, setIsImageOpen] = useState(false); // Állapot a nagyításhoz
    const [isPostOpen, setIsPostOpen] = useState(false);

    const handleDelete = async () => {
        // 1. Megerősítés kérése
        if (!window.confirm('Biztosan törölni szeretnéd ezt a posztot?')) return;

        try {
            // 2. Törlés a Supabase-ből
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id) // Csak azt a posztot töröljük, aminek az ID-ja megegyezik
                .eq('user_id', user.id); // Plusz biztonság: csak a sajátját törölhesse

            if (error) throw error;

            // 3. UI frissítése
            // Az onUpdate() függvényt a Home.jsx-ből kaptuk prop-ként, 
            // ez újra lefutatja a fetchPosts-ot, így eltűnik a poszt.
            if (onUpdate) {
                onUpdate();
            }

        } catch (error) {
            console.error('Hiba a törlés során:', error);
            alert('Nem sikerült törölni a posztot: ' + error.message);
        }
    };



    return (
        <>
            <div className="custom-card flex flex-col h-full rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">

                {/* KÉPKERET - Fix magasság, változó háttérszínnel */}
                <div
                    className="w-full h-52 image-placeholder flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800 relative group"
                    onClick={() => post.image_url && setIsImageOpen(true)}
                >
                    {post.image_url ? (
                        <>
                            <img
                                src={post.image_url}
                                alt=""
                                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold transition-opacity">
                                    Kattints a nagyításhoz
                                </span>
                            </div>
                        </>
                    ) : (
                        /* Ha nincs kép, a placeholder háttér és egy halvány ikon látszik */
                        <div className="text-slate-300 dark:text-slate-700 transition-colors">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* TARTALOM RÉSZ */}
                <div className="p-6 flex flex-col flex-1">
                    {/* Erre a részre kattintva nyílik meg a teljes poszt */}
                    <div className="cursor-pointer" onClick={() => setIsPostOpen(true)}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-wider">
                                {post.categories?.name || 'Egyéb'}
                            </span>
                            {post.is_solved && <CheckCircle className="text-green-500" size={20} />}
                        </div>

                        <h3 className="text-xl font-bold mb-2 leading-tight">
                            {post.title}
                        </h3>

                        {/* Itt marad a line-clamp-2, hogy a kártyán rövid legyen */}
                        <p className="custom-text-muted text-sm italic mb-6 line-clamp-2">
                            "{post.description}"
                        </p>
                    </div>

                    <div className="mt-auto">
                        {/* ... Profilkép rész változatlan ... */}

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center gap-2">
                            {/* ÚJ: Részletek gomb */}
                            <button
                                onClick={() => setIsPostOpen(true)}
                                className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                Részletek megnyitása
                            </button>

                            <div className="flex items-center gap-2">
                                <a href={post.profiles?.default_contact || post.contact_info} target="_blank" className="...">
                                    <MessageCircle size={18} />
                                </a>

                                {(user?.id === post.user_id || profile?.is_admin) && (
                                    <button onClick={handleDelete} className="...">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN IMAGE MODAL */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <X size={40} />
                    </button>

                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()} // Ne záródjon be, ha magára a képre kattintasz
                    />
                </div>
            )}

            {/* FULLSCREEN POST MODAL */}
            {isPostOpen && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsPostOpen(false)}>
                    <div
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-200"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Fejléc kép (ha van) */}
                        {post.image_url && (
                            <div className="w-full h-64 overflow-hidden">
                                <img src={post.image_url} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase mb-2 inline-block">
                                        {post.categories?.name || 'Egyéb'}
                                    </span>
                                    <h2 className="text-3xl font-black leading-tight">{post.title}</h2>
                                </div>
                                <button onClick={() => setIsPostOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Itt már NINCS line-clamp, tehát a teljes szöveg látszik */}
                            <div className="text-lg leading-relaxed italic mb-8 opacity-90" style={{ color: 'var(--text-main)' }}>
                                "{post.description}"
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    {/* Itt is megjelenítjük a profilt */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                                        {post.profiles?.avatar_url ? (
                                            <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold">{post.profiles?.full_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-wide">{post.profiles?.full_name}</p>
                                        <p className="text-xs text-slate-400">Posztoló</p>
                                    </div>
                                </div>

                                <a
                                    href={post.profiles?.default_contact || post.contact_info}
                                    target="_blank"
                                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <MessageCircle size={20} /> Segítek a megoldásban
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}