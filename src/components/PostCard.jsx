import { MessageCircle, Trash2, CheckCircle, X, Clock } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
    const { user, profile } = useAuth();
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isPostOpen, setIsPostOpen] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a posztot?')) return;

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id)
                .eq('user_id', user.id);

            if (error) throw error;

            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Hiba a törlés során:', error);
            alert('Nem sikerült törölni a posztot: ' + error.message);
        }
    };

    const getDefaultImageUrl = (categoryName) => {
        const baseUrl = import.meta.env.BASE_URL;
        switch (categoryName?.toLowerCase()) {
            case 'tanulás':
                return `${baseUrl}tanulas.avif`;
            case 'buli':
                return `${baseUrl}buli.avif`;
            case 'elveszett tárgyak':
                return `${baseUrl}elveszettTargyak.jpg`;
            case 'egyéb':
                return `${baseUrl}egyeb.avif`;
            default:
                return `${baseUrl}egyeb.avif`;
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'épp most';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} perce`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} órája`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} napja`;

        return date.toLocaleDateString('hu-HU');
    };

    return (
        <>
            {/* PRÉMIUM DESIGN KÁRTYA: Egyedi szegély, lágy hover árnyék és finom scale */}
            <div className="custom-card flex flex-col h-full rounded-[2.2rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group/card">

                {/* KÉPKERET - Fix magasság, zoom effekttel */}
                <div
                    className="w-full h-52 image-placeholder flex items-center justify-center overflow-hidden relative cursor-pointer"
                    onClick={() => post.image_url && setIsImageOpen(true)}
                >
                    <img
                        src={post.image_url || getDefaultImageUrl(post.categories?.name)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    
                    {/* Üveghatású overlay nagyítási felirattal */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[11px] font-bold tracking-wide shadow-lg">
                            Kattints a nagyításhoz 🔍
                        </span>
                    </div>

                    {/* Státusz badge a kép sarkában, ha megoldódott */}
                    {post.is_solved && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                            <CheckCircle size={14} /> Megoldva
                        </div>
                    )}
                </div>

                {/* TARTALOM RÉSZ */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                    <div className="cursor-pointer" onClick={() => setIsPostOpen(true)}>
                        
                        {/* Kategória és Időbélyeg elrendezése */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                                {post.categories?.name || 'Egyéb'}
                            </span>
                            
                            <div className="flex items-center gap-1 text-[11px] opacity-60 font-medium">
                                <Clock size={12} />
                                <span>{formatTimeAgo(post.created_at)}</span>
                            </div>
                        </div>

                        {/* Cím */}
                        <h3 className="text-xl font-black mb-2 leading-snug group-hover/card:text-blue-500 transition-colors">
                            {post.title}
                        </h3>

                        {/* Leírás */}
                        <p className="custom-text-muted text-sm italic mb-6 line-clamp-2 leading-relaxed opacity-90">
                            "{post.description}"
                        </p>
                    </div>

                    {/* LÁBLÉC / AKCIÓK */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center gap-2">
                        <button
                            onClick={() => setIsPostOpen(true)}
                            className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                        >
                            Részletek megnyitása →
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Messenger gomb / Kapcsolat */}
                            <a 
                                href={post.profiles?.default_contact || post.contact_info} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 transition-all shadow-sm"
                                title="Kapcsolatfelvétel"
                            >
                                <MessageCircle size={18} />
                            </a>

                            {/* Törlés gomb (ha saját vagy admin) */}
                            {(user?.id === post.user_id || profile?.is_admin) && (
                                <button 
                                    onClick={handleDelete} 
                                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-sm"
                                    title="Poszt törlése"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN IMAGE MODAL */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-3 bg-white/10 rounded-full"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <X size={28} />
                    </button>

                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* FULLSCREEN POST MODAL */}
            {isPostOpen && (
                <div 
                    className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={() => setIsPostOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border relative"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Bezáró gomb */}
                        <button 
                            onClick={() => setIsPostOpen(false)} 
                            className="absolute top-5 right-5 z-20 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>

                        {/* Fejléc kép */}
                        {post.image_url && (
                            <div className="w-full h-72 overflow-hidden relative">
                                <img src={post.image_url} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent"></div>
                            </div>
                        )}

                        <div className="p-8 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-[11px] font-black uppercase tracking-wider border border-blue-500/20">
                                        {post.categories?.name || 'Egyéb'}
                                    </span>
                                    <span className="text-xs opacity-60 font-medium flex items-center gap-1">
                                        <Clock size={12} /> {formatTimeAgo(post.created_at)}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black leading-tight">{post.title}</h2>
                            </div>

                            {/* Teljes leírás */}
                            <div className="text-base leading-relaxed italic opacity-95 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10" style={{ color: 'var(--text-main)' }}>
                                "{post.description}"
                            </div>

                            {/* Profil adatok és Kapcsolat */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                        {post.profiles?.avatar_url ? (
                                            <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="font-black text-blue-500">{post.profiles?.full_name?.charAt(0) || 'D'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-wide">{post.profiles?.full_name || 'Ismeretlen felhasználó'}</p>
                                        <p className="text-xs opacity-60">Posztoló diák</p>
                                    </div>
                                </div>

                                <a
                                    href={post.profiles?.default_contact || post.contact_info}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95"
                                >
                                    <MessageCircle size={18} /> Segítek a megoldásban
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}