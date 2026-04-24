import { MessageCircle, Trash2, CheckCircle, X } from 'lucide-react'; // X ikon a bezáráshoz
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
    const { user, profile } = useAuth();
    const [isImageOpen, setIsImageOpen] = useState(false); // Állapot a nagyításhoz

    const handleDelete = async () => {
        if (!confirm('Biztosan törlöd?')) return;
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (error) alert(error.message); else onUpdate();
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

                {/* TARTALOM RÉSZ (Változatlan marad) */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-wider">
                            {post.categories?.name || 'Egyéb'}
                        </span>
                        {post.is_solved && <CheckCircle className="text-green-500" size={20} />}
                    </div>

                    <h3 className="text-xl font-bold mb-2 leading-tight">
                        {post.title}
                    </h3>

                    <p className="custom-text-muted text-sm italic mb-6 line-clamp-2">
                        "{post.description}"
                    </p>

                    <div className="mt-auto">
                        <p className="text-[11px] custom-text-muted mb-4 font-medium uppercase tracking-wide">
                            Beküldte: <span className="font-bold text-slate-900 dark:text-slate-200">{post.profiles?.full_name || 'Ismeretlen'}</span>
                        </p>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                            <a
                                href={post.contact_info}
                                target="_blank"
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
                            >
                                <MessageCircle size={18} /> Segítek
                            </a>

                            {(user?.id === post.user_id || profile?.is_admin) && (
                                <button onClick={handleDelete} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            )}
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
        </>
    );
}