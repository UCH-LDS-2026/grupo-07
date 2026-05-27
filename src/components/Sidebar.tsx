type Page = 'dashboard' | 'clients' | 'projects' | 'expenses' | 'profile' | 'billing' | 'contracts';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onStartProject: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  user: { name: string, role: string, email: string, avatar?: string };
}

export default function Sidebar({ activePage, onNavigate, onStartProject, currency, onCurrencyChange, user }: SidebarProps) {

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Command Center' },
    { id: 'clients', icon: 'group', label: 'Directorio' },
    { id: 'projects', icon: 'account_tree', label: 'Proyectos' },
    { id: 'contracts', icon: 'description', label: 'Contratos' },
    { id: 'billing', icon: 'receipt_long', label: 'Facturas' },
    { id: 'expenses', icon: 'payments', label: 'Finanzas' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#05070a] border-r border-white/5 flex flex-col pt-12 pb-8 px-4 z-40 backdrop-blur-xl">
      <div className="mb-12 px-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-xl">hub</span>
          </div>
          <h1 className="text-xl font-outfit font-black text-white tracking-tighter">NEXUSSGE</h1>
        </div>
        <p className="text-[10px] text-primary-container font-space font-bold uppercase tracking-[0.3em]">Operational OS</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary-container/10 text-primary-container border border-primary-container/20 neon-glow-cyan shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]'
                  : 'text-outline hover:text-white hover:bg-white/5'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${isActive ? 'text-primary-container' : 'text-outline'}`}
              >
                {item.icon}
              </span>
              <span className="font-space text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,240,255,0.8)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        {/* Currency Switcher */}
        <div className="mb-6 px-2">
          <p className="text-[9px] text-outline font-space font-bold uppercase tracking-[0.2em] mb-3 ml-1">Divisa Operativa</p>
          <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
            {['USD', 'ARS'].map((sym) => (
              <button
                key={sym}
                onClick={() => onCurrencyChange(sym)}
                className={`flex-1 py-2 rounded-lg font-space text-[10px] font-bold transition-all ${
                  currency === sym 
                    ? 'bg-primary-container text-on-primary shadow-lg shadow-primary-container/20' 
                    : 'text-outline hover:text-white hover:bg-white/5'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onStartProject}
          className="w-full py-3 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-space font-bold text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all mb-8 shadow-lg shadow-primary-container/10"
        >
          + Iniciar Proyecto
        </button>

        <button 
          onClick={() => onNavigate('profile')}
          className={`w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-all hover:bg-white/5 hover:border-primary-container/30 group ${activePage === 'profile' ? 'border-primary-container/50 bg-primary-container/5' : ''}`}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-primary-container/30 p-0.5 group-hover:border-primary-container/80 transition-colors flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Me" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="text-[10px] font-bold text-primary-container font-outfit">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'US'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#05070a] rounded-full"></div>
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-[11px] font-outfit font-bold text-white truncate uppercase tracking-tighter group-hover:text-primary-container transition-colors">{user?.name || 'Usuario'}</p>
            <p className="text-[9px] text-primary-container font-space font-bold uppercase tracking-widest">{user?.role || 'Operador'}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}