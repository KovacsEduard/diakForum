import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header({ user, onSignOut }) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    /* A külső réteg: 'w-screen' és 'left-0' biztosítja, hogy 
       még ha a body-nak van is marginja, a header az egész kijelzőt átérje.
    */
    <header className="w-full h-20 header-blur sticky top-0 z-50">

      {/* A belső réteg: 'max-w-7xl' tartja középen a tartalmat, 
          hogy ne lógjon ki a szöveg a monitor szélére. 
      */}
      <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">

        {/* BAL OLDAL: Logó és Felhasználó */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl tracking-tighter">DF</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight leading-none">DIÁKFÓRUM</h1>
            <span className="text-[10px] custom-text-muted font-bold uppercase tracking-widest mt-1">
              {user?.email?.split('@')[0]}
            </span>
          </div>
        </div>

        {/* JOBB OLDAL: Gombok */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="
    p-3 rounded-2xl transition-all duration-300 active:scale-95
    /* Világos mód színei */
    bg-white border border-slate-200 text-slate-600 shadow-sm
    /* Sötét mód színei (.dark osztály esetén) */
    dark:bg-slate-800 dark:border-slate-700 dark:text-yellow-400
    /* Hover effektek */
    hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:shadow-md
  "
            title={darkMode ? "Világos mód" : "Sötét mód"}
          >
            {darkMode ? (
              <Sun size={20} className="animate-pulse" /> // Sötétben a nap sárga és "lüktet"
            ) : (
              <Moon size={20} className="text-slate-700" /> // Világosban a hold sötétszürke
            )}
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-slate-500 hover:text-red-500 font-bold transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Kilépés</span>
          </button>
        </div>
      </div>
    </header>
  );
}