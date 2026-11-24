import React, { useState } from 'react';
import { ShieldCheck, Trash2, X, Mail, Lock, FileText } from 'lucide-react';

export function LegalModal({ activeTab, onClose }) {
  const [tab, setTab] = useState(activeTab || 'privacy');

  if (!activeTab) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2rem] border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
      >
        {/* Fejléc */}
        <div className="p-6 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider">Adatvédelem és GDPR</h3>
              <p className="text-[11px] opacity-70" style={{ color: 'var(--text-muted)' }}>
                DiákFórum projektcsapat • Utolsó frissítés: 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
            title="Bezárás"
          >
            <X size={20} />
          </button>
        </div>

        {/* Fülek */}
        <div className="px-6 pt-3 border-b flex gap-2" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'privacy'
                ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <FileText size={14} /> Adatkezelési tájékoztató
          </button>
          <button
            type="button"
            onClick={() => setTab('deletion')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'deletion'
                ? 'border-red-500 text-red-500 bg-red-500/5'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Trash2 size={14} /> Törlési kérelem kezelése
          </button>
        </div>

        {/* Görgethető tartalom */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed">
          {tab === 'privacy' ? (
            <>
              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">1. Ki az adatkezelő?</h4>
                <p>
                  Az adatkezelő a <strong>Diákfórum projektcsapata</strong> (közös adatkezelők). Az adatkezeléssel kapcsolatos kérdéseidet, kérelmeidet (pl. törlés, helyesbítés) az alábbi elérhetőségen jelezheted:
                </p>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 font-bold text-blue-500">
                  <Mail size={16} />
                  <a href="mailto:gepeszinfo7@gmail.com" className="hover:underline">gepeszinfo7@gmail.com</a>
                </div>
                <p className="opacity-80">A kéréseket indokolatlan késedelem nélkül, legkésőbb 30 napon belül teljesítjük.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">2. Milyen személyes adatokat kezelünk és miért?</h4>
                <p>Csak a szolgáltatás nyújtásához szükséges adatokat kezeljük (adatminimalizálás – GDPR 5. cikk).</p>
                <p className="font-bold pt-1">Kötelező adatok (a fórum használatához szükségesek):</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Név</strong> – profil megjelenítése, azonosítás (jogalap: szerződés teljesítése – GDPR 6. cikk (1) b)</li>
                  <li><strong>E-mail cím</strong> – regisztráció, bejelentkezés, kapcsolattartás (jogalap: szerződés teljesítése)</li>
                </ul>
                <p className="font-bold pt-1">Opcionális adatok (nem kötelezőek, hozzájárulással):</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Profilkép</strong> – profil megjelenítése (jogalap: hozzájárulás – GDPR 6. cikk (1) a)</li>
                  <li><strong>Feltöltött képek (posztokban)</strong> – kérdések/válaszok illusztrálása (jogalap: hozzájárulás)</li>
                  <li><strong>Messenger link (ha megadod)</strong> – kapcsolatfelvétel más diákokkal (jogalap: hozzájárulás)</li>
                </ul>
                <p className="opacity-80 pt-1">
                  A regisztráció e-mail + jelszóval vagy Google-fiókkal lehetséges. Google bejelentkezés esetén a Google által átadott alapadatokat (név, e-mail) kezeljük a bejelentkezéshez.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">3. 16 év alatti felhasználók</h4>
                <p>
                  A Diákfórumot 16 év alattiak is használhatják. Magyarországon a digitális szolgáltatásokhoz szükséges hozzájárulás korhatára <strong>16 év</strong>. 16 év alatti felhasználó esetén a személyes adatok kezeléséhez a szülő vagy törvényes képviselő hozzájárulása szükséges. A regisztrációval a felhasználó (vagy a szülő) kijelenti, hogy jogosult a hozzájárulás megadására.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">4. Hol és meddig tároljuk az adatokat?</h4>
                <p>
                  Az adatokat a <strong>Supabase</strong> szolgáltatásában tároljuk (adatfeldolgozó, GDPR 28. cikk). Az adatokat a fiók aktív fennállásáig tároljuk. A fiók törlésekor (vagy törlési kérelem esetén) az adatokat töröljük vagy anonimizáljuk. A feltöltött képek a poszt / fiók törléséig maradnak meg.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">5. Ki férhet hozzá az adatokhoz? Hogyan védjük őket?</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Az adatokhoz a projektcsapat tagjai (adminok / moderátorok) férhetnek hozzá, a szolgáltatás működtetése és a moderálás céljából.</li>
                  <li>A jelszavakat titkosítva (hash) tároljuk, soha nem látjuk őket nyílt formában.</li>
                  <li>A kapcsolat HTTPS-en keresztül történik.</li>
                  <li>Moderálás (posztok törlése, felhasználók korlátozása) – a biztonságos és tiszteletteljes közösség érdekében.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">6. Milyen jogaid vannak az adataiddal kapcsolatban?</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Tájékoztatáshoz</strong> – hogy milyen adataidat kezeljük</li>
                  <li><strong>Hozzáféréshez</strong> – másolatot kérhetsz az adataidról</li>
                  <li><strong>Helyesbítéshez</strong> – javíthatod a hibás adatokat</li>
                  <li><strong>Törléshez („elfeledtetéshez való jog”)</strong> – kérheted a fiókod és adatainak törlését</li>
                  <li><strong>Hozzájárulás visszavonásához</strong> – a profilképet, Messenger linket bármikor eltávolíthatod</li>
                  <li><strong>Tiltakozáshoz és adathordozhatósághoz</strong></li>
                  <li><strong>Panaszhoz</strong> – a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH, <a href="https://www.naih.hu" target="_blank" rel="noreferrer" className="text-blue-500 underline">www.naih.hu</a>)</li>
                </ul>
                <p className="opacity-80">
                  A kérelmeket a <strong>gepeszinfo7@gmail.com</strong> e-mail címen jelezd.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-blue-500 uppercase tracking-wider text-xs">7. Hozzájárulás és visszavonás</h4>
                <p>
                  A regisztrációval elfogadod ezt az adatkezelési tájékoztatót. A profilkép, a posztokhoz feltöltött képek és a Messenger link megadása önkéntes. A hozzájárulást bármikor visszavonhatod az adott adat törlésével vagy a fiók törlésével.
                </p>
                <p className="text-[11px] opacity-70 pt-2">
                  Készült a GDPR (EU) 2016/679 rendelet és a 2011. évi CXII. törvény (Infotv.) alapján. Utolsó frissítés: 2026.
                </p>
              </section>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs">
                <strong>Jogalap:</strong> GDPR 17. cikk (törléshez való jog). <strong>Határidő:</strong> indokolatlan késedelem nélkül, legfeljebb 30 nap. Törlési kérelem küldése: <a href="mailto:gepeszinfo7@gmail.com?subject=DiákFórum%20fiók%20törlési%20kérelem" className="font-bold underline text-red-500">gepeszinfo7@gmail.com</a>
              </div>

              <section className="space-y-1.5">
                <h4 className="font-black text-red-500 uppercase tracking-wider text-xs">1. Kérelem fogadása</h4>
                <p>
                  A felhasználó e-mailben (<span className="font-semibold">gepeszinfo7@gmail.com</span>) vagy az appban kéri az adatai törlését. Rövid visszaigazolást küldünk a kérelem beérkezéséről, és legfeljebb 30 napon belül végrehajtjuk.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-red-500 uppercase tracking-wider text-xs">2. Azonosítás</h4>
                <p>
                  Ellenőrizzük, hogy a kérelem valóban a fiók tulajdonosától érkezett (e-mail egyezés, szükség esetén bejelentkezés). Csak ezután törlünk.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-red-500 uppercase tracking-wider text-xs">3. Mit törlünk (Supabase)?</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Storage</strong> – profilkép és a posztokban lévő képek törlése</li>
                  <li><strong>Adatbázis</strong> – név, e-mail, Messenger link, profiladatok törlése</li>
                  <li><strong>Posztok szövege</strong> – törlés vagy anonimizálás („Törölt felhasználó”)</li>
                  <li><strong>Supabase Auth</strong> – a felhasználói fiók törlése (bejelentkezés megszűnik)</li>
                  <li><strong>Jelszó-hash</strong> – az Auth törlésével együtt eltűnik</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-red-500 uppercase tracking-wider text-xs">4. Backup és visszajelzés</h4>
                <p>
                  A biztonsági mentésekből is eltávolítjuk / felülírjuk az adatokat ésszerű időn belül. A törlés teljesítéséről rövid visszaigazoló e-mailt küldünk a felhasználónak, és belső nyilvántartást vezetünk az elszámoltathatóság érdekében (GDPR 5. cikk (2)).
                </p>
              </section>
            </>
          )}
        </div>

        {/* Lábléc gomb */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Megértettem
          </button>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const [modalTab, setModalTab] = useState(null);

  return (
    <>
      <footer
        className="w-full border-t py-6 px-4 mt-auto"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <Lock size={14} className="text-blue-500" />
            <span>© 2026 DiákFórum • GDPR-megfelelő adatkezelés</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-bold">
            <button
              type="button"
              onClick={() => setModalTab('privacy')}
              className="hover:text-blue-500 transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Adatkezelési tájékoztató
            </button>
            <span className="opacity-30">•</span>
            <button
              type="button"
              onClick={() => setModalTab('deletion')}
              className="hover:text-red-500 transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Törlési kérelem kezelése
            </button>
            <span className="opacity-30">•</span>
            <a
              href="mailto:gepeszinfo7@gmail.com"
              className="hover:text-blue-500 transition-colors"
            >
              gepeszinfo7@gmail.com
            </a>
          </div>
        </div>
      </footer>

      <LegalModal activeTab={modalTab} onClose={() => setModalTab(null)} />
    </>
  );
}