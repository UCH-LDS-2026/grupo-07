import React, { useState, useEffect, useCallback } from 'react';

interface Command {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onNavigate: (page: any) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const commands: Command[] = [
    { id: 'dash', label: 'Ir a Command Center', icon: 'dashboard', shortcut: 'G D', action: () => onNavigate('dashboard'), category: 'Navegación' },
    { id: 'clients', label: 'Ver Directorio de Clientes', icon: 'group', shortcut: 'G C', action: () => onNavigate('clients'), category: 'Navegación' },
    { id: 'projects', label: 'Ver Proyectos', icon: 'account_tree', shortcut: 'G P', action: () => onNavigate('projects'), category: 'Navegación' },
    { id: 'expenses', label: 'Ver Finanzas', icon: 'payments', shortcut: 'G F', action: () => onNavigate('expenses'), category: 'Navegación' },
    { id: 'new-client', label: 'Registrar Nuevo Cliente', icon: 'person_add', shortcut: 'N C', action: () => alert('Abriendo Formulario...'), category: 'Acciones' },
    { id: 'focus', label: 'Activar Deep Work Mode', icon: 'bolt', shortcut: 'D W', action: () => alert('Sincronizando con NEXUS IA...'), category: 'Productividad' },

    { id: 'export', label: 'Exportar Reporte Financiero', icon: 'download', shortcut: 'E R', action: () => {}, category: 'Sistema' },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) || 
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Palette Container */}
      <div className="w-full max-w-2xl glass-card border-primary-container/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">terminal</span>
          <input 
            autoFocus
            type="text" 
            placeholder="Escribe un comando o busca algo..."
            className="bg-transparent border-none focus:ring-0 text-white w-full font-space text-sm placeholder:text-outline"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-1">
             <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-outline font-space">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {Object.entries(
            filteredCommands.reduce((acc, cmd) => {
              if (!acc[cmd.category]) acc[cmd.category] = [];
              acc[cmd.category].push(cmd);
              return acc;
            }, {} as Record<string, Command[]>)
          ).map(([category, items]) => (
            <div key={category} className="mb-4 last:mb-0">
              <h3 className="px-3 py-2 text-[10px] font-space font-bold text-primary-container/50 uppercase tracking-[0.2em]">{category}</h3>
              <div className="space-y-1">
                {items.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); setIsOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary-container/10 group transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors">{cmd.icon}</span>
                      <span className="text-sm text-white group-hover:translate-x-1 transition-transform">{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <div className="flex gap-1">
                        {cmd.shortcut.split(' ').map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-outline font-space font-bold uppercase">{s}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-outline text-xs font-space uppercase tracking-widest">Sin resultados para "{search}"</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-white/[0.02] border-t border-white/10 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-outline">keyboard_arrow_up</span>
              <span className="material-symbols-outlined text-xs text-outline">keyboard_arrow_down</span>
              <span className="text-[9px] text-outline font-space uppercase">Navegar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-outline">keyboard_return</span>
              <span className="text-[9px] text-outline font-space uppercase">Seleccionar</span>
            </div>
          </div>
          <span className="text-[9px] text-primary-container font-space font-bold uppercase tracking-widest opacity-50">NEXUSSGE_CMD_V1.0</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
