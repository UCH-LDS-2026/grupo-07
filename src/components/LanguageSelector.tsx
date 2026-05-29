import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';

  return (
    <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-full p-1 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-500">
      <button
        onClick={() => i18n.changeLanguage('es')}
        className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
          currentLang === 'es'
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02] border border-transparent'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
          currentLang === 'en'
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02] border border-transparent'
        }`}
      >
        EN
      </button>
    </div>
  );
}
