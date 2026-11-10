import { MessageCircle, Trash2, CheckCircle, X, Clock } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
    const { user, profile } = useAuth();
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isPostOpen, setIsPostOpen] = useState(false);
    const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [selectedHelperId, setSelectedHelperId] = useState('');

    const handleDelete = async () => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a posztot?')) return;

        try {
            // 1. Ha a poszt meg volt oldva és volt hozzá tartozó segítő, vonjuk le tőle a +20 pontot
            if (post.is_solved && post.solved_by_user_id) {
                const { data: helperProfile } = await supabase
                    .from('profiles')
                    .select('points')
                    .eq('id', post.solved_by_user_id)
                    .single();

                if (helperProfile) {
                    const updatedHelperPoints = Math.max(0, (helperProfile.points || 0) - 20);
                    await supabase
                        .from('profiles')
                        .update({ points: updatedHelperPoints })
                        .eq('id', post.solved_by_user_id);
                }
            }

            // 2. A poszt szerzőjétől vonjuk le a posztért járó 10 pontot
            const { data: authorProfile } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', post.user_id)
                .single();

            if (authorProfile) {
                const updatedAuthorPoints = Math.max(0, (authorProfile.points || 0) - 10);
                await supabase
                    .from('profiles')
                    .update({ points: updatedAuthorPoints })
                    .eq('id', post.user_id);
            }

            // 3. Maga a poszt törlése az adatbázisból
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
            case '🧩 egyéb / vegyes':
                return `${baseUrl}egyeb.avif`;
            case '🔍 elveszett tárgyak':
                return `${baseUrl}elveszettTargyak.avif`;
            case '🎮 közösség & programok':
                return `${baseUrl}kozosseg.avif`;
            case 'buli🍔 menza & büfé':
                return `${baseUrl}menza.avif`;
            case '💡 sulis ötletek & fejlesztések':
                return `${baseUrl}otletek.avif`;
            case '🆘 segítség & tanácsadás':
                return `${baseUrl}segitseg.avif`;
            case '📚 tanulás & korrepetálásulás':
                return `${baseUrl}tanulas.avif`;
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

    const getRankStyle = (rankTitle) => {
        switch (rankTitle) {
            case '🔥 Suli Legenda':
                return 'bg-red-500/15 border-red-500/50 text-red-400 font-black shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse';
            case '⚡ Arany Főnök':
                return 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold';
            case '⭐ Top Segítő':
                return 'bg-blue-500/15 border-blue-500/30 text-blue-400 font-bold';
            case '🛡️ Aktív Diák':
                return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 font-semibold';
            default:
                return 'bg-slate-500/10 border-slate-500/20 text-gray-400 font-normal';
        }
    };

    const handleToggleSolvedClick = async () => {
        // Mivel a gomb csak akkor látszik, ha nincs megoldva, azonnal nyitjuk a modált
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, rank_title, points')
                .neq('id', user?.id);

            setUsersList(data || []);
            setIsSolveModalOpen(true);
        } catch (err) {
            console.error('Hiba a felhasználók betöltésekor:', err);
        }
    };

    const confirmSolvedWithHelper = async () => {
        if (!selectedHelperId) {
            return alert('Kérjük, válaszd ki, ki segített!');
        }

        try {
            // 1. Lekérdjük a kiválasztott segítő aktuális pontjait közvetlenül az adatbázisból, hogy ne rejtett state-ből dolgozzunk
            const { data: helperData, error: fetchError } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', selectedHelperId)
                .single();

            if (fetchError) throw fetchError;

            const currentPoints = helperData?.points || 0;
            const newPoints = currentPoints + 20;

            // 2. Frissítjük a segítő pontjait a profiles táblában
            const { error: helperError } = await supabase
                .from('profiles')
                .update({ points: newPoints })
                .eq('id', selectedHelperId);

            if (helperError) throw helperError;

            // 3. Frissítjük a posztot: is_solved = true és beállítjuk a solved_by_user_id-t
            const { error: postError } = await supabase
                .from('posts')
                .update({
                    is_solved: true,
                    solved_by_user_id: selectedHelperId
                })
                .eq('id', post.id);

            if (postError) throw postError;

            // 4. Modál bezárása és újratöltés
            setIsSolveModalOpen(false);
            setSelectedHelperId('');
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Hiba a pontok mentése során:', error);
            alert('Hiba történt a pontok jóváírásakor: ' + error.message);
        }
    };
    return (
        <>
            {/* 1. MAGA A KÁRTYA (Kizárólag a kártya tartalma van benne) */}
            <div className="custom-card flex flex-col h-full rounded-[2.2rem] border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group/card">

                {/* KÉPKERET */}
                <div
                    className="w-full h-52 image-placeholder flex items-center justify-center overflow-hidden relative cursor-zoom-in group/image rounded-t-[2.2rem]"
                    onClick={() => setIsImageOpen(true)}
                >
                    <img
                        src={post.image_url || getDefaultImageUrl(post.categories?.name)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[11px] font-bold tracking-wide shadow-lg">
                            Kattints a nagyításhoz 🔍
                        </span>
                    </div>

                    {post.is_solved && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                            <CheckCircle size={14} /> Megoldva
                        </div>
                    )}
                </div>

                {/* TARTALOM RÉSZ */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                    <div className="cursor-pointer" onClick={() => setIsPostOpen(true)}>
                        <div className="flex justify-between items-center mb-3">
                            <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                                {post.categories?.name || 'Egyéb'}
                            </span>

                            <div className="flex items-center gap-1 text-[11px] opacity-60 font-medium">
                                <Clock size={12} />
                                <span>{formatTimeAgo(post.created_at)}</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-black mb-2 leading-snug group-hover/card:text-blue-500 transition-colors">
                            {post.title}
                        </h3>

                        <p className="custom-text-muted text-sm italic mb-6 line-clamp-2 leading-relaxed opacity-90">
                            "{post.description}"
                        </p>
                    </div>

                    {/* LÁBLÉC */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                                    {post.profiles?.avatar_url ? (
                                        <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="font-black text-xs text-blue-500">{post.profiles?.full_name?.charAt(0) || 'D'}</span>
                                    )}
                                </div>
                                <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-black uppercase tracking-wide truncate">
                                            {post.profiles?.full_name || 'Ismeretlen'}
                                        </p>
                                    </div>
                                    <span className={`inline-block px-2 py-0.2 rounded-full text-[8px] uppercase tracking-wider border mt-0.5 ${getRankStyle(post.profiles?.rank_title)}`}>
                                        {post.profiles?.rank_title || '🌱 Újonc Tag'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Alsó gombok sávja */}
                        <div className="flex flex-col gap-3 pt-3">
                            <button
                                onClick={() => setIsPostOpen(true)}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white transition-all text-center cursor-pointer"
                            >
                                Részletek megnyitása →
                            </button>

                            {user?.id !== post.user_id && (
                                <a
                                    href={post.profiles?.default_contact || post.contact_info}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <MessageCircle size={16} /> Kapcsolatfelvétel
                                </a>
                            )}

                            {(user?.id === post.user_id || profile?.is_admin) && (
                                <div className="flex flex-col gap-2 w-full">
                                    {!post.is_solved && (
                                        <button
                                            onClick={handleToggleSolvedClick}
                                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                                            title="Megjelölés megoldottként"
                                        >
                                            <CheckCircle size={16} /> Megoldva
                                        </button>
                                    )}

                                    <button
                                        onClick={handleDelete}
                                        className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                                        title="Poszt törlése"
                                    >
                                        <Trash2 size={16} /> Törlés
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KÉP MODÁL (Kártyán kívül) */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-3 bg-white/10 rounded-full cursor-pointer"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <X size={28} />
                    </button>

                    <img
                        src={post.image_url || getDefaultImageUrl(post.categories?.name)}
                        alt={post.title}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* 3. FULLSCREEN POST MODAL (A kártyán kívülre mozgatva, így nem ragad bele a kártya rétegébe) */}
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
                        <button
                            onClick={() => setIsPostOpen(false)}
                            className="absolute top-5 right-5 z-20 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md cursor-pointer"
                        >
                            <X size={20} />
                        </button>

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

                            <div className="text-base leading-relaxed italic opacity-95 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10" style={{ color: 'var(--text-main)' }}>
                                "{post.description}"
                            </div>

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
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black uppercase tracking-wide">
                                                {post.profiles?.full_name || 'Ismeretlen felhasználó'}
                                            </p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider border mt-0.5 ${getRankStyle(post.profiles?.rank_title)}`}>
                                                {post.profiles?.rank_title || '🌱 Újonc Tag'}
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-60">
                                            {`${post.profiles?.points || 10} pont`}
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={post.contact_info || post.profiles?.default_contact}
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

            {/* 4. SEGÍTŐ KIVÁLASZTÓ MODÁL */}
            {isSolveModalOpen && (
                <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                        className="w-full max-w-md rounded-[2.5rem] p-6 border shadow-2xl relative space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                            <h3 className="text-lg font-black text-green-500">🏆 Ki segített a megoldásban?</h3>
                            <button
                                onClick={() => setIsSolveModalOpen(false)}
                                className="hover:opacity-80 font-bold text-lg p-1 cursor-pointer opacity-70"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs opacity-80">
                            Válaszd ki a listából azt a diákot, aki segített megoldani a problémádat. A kiválasztott felhasználó jutalmul <strong className="text-blue-500">+20 pontot</strong> kap!
                        </p>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {usersList.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => setSelectedHelperId(u.id)}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedHelperId === u.id
                                        ? 'bg-green-500/15 border-green-500 text-green-400 font-bold shadow-sm'
                                        : 'bg-slate-500/5 border-slate-500/20 hover:bg-slate-500/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-500">
                                            {u.full_name?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black">{u.full_name || 'Ismeretlen diák'}</p>
                                            <span className="text-[9px] opacity-60 uppercase">{u.rank_title || 'Újonc Tag'}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold opacity-80">{u.points || 0} pts</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsSolveModalOpen(false)}
                                className="w-1/2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-500/10 hover:bg-slate-500/20 transition-all cursor-pointer"
                            >
                                Mégse
                            </button>
                            <button
                                type="button"
                                onClick={confirmSolvedWithHelper}
                                className="w-1/2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all cursor-pointer"
                            >
                                Mentés & Pont adása
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}