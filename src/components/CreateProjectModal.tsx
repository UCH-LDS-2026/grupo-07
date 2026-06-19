import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
  userId: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreated, userId }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]); 
  
  const [newProject, setNewProject] = useState({
    title: '',
    clientId: '',
    clientName: '',
    purpose: '',
    tech: '',
    deadline: '',
    phone: '',
    email: '',
    driveUrl: '',
    gitRepo: '',
    budget: '',
    taxRate: '0' // Control dinámico de impuestos
  });

  // 1. CARGAR CLIENTES DESDE EL DIRECTORIO AISLADOS POR USUARIO
  useEffect(() => {
    const fetchClients = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('user_id', userId)
        .order('name', { ascending: true });
      
      if (!error && data) setClients(data);
    };

    if (isOpen) fetchClients();
  }, [isOpen, userId]);

  // 2. ACTUALIZAR DATOS CUANDO SE SELECCIONA UN CLIENTE
  const handleClientChange = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setNewProject({
        ...newProject,
        clientId: selected.id,
        clientName: selected.name,
        email: selected.email || '',
        phone: selected.phone || ''
      });
    } else {
      setNewProject({ ...newProject, clientId: '', clientName: '', email: '', phone: '' });
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      console.error("Error: No se detectó ID de operador.");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            title: newProject.title,
            client: newProject.clientName, // Retained for backwards compatibility if needed
            client_id: newProject.clientId || null, // Direct UUID assignment
            purpose: newProject.purpose,
            tech: newProject.tech,
            deadline: newProject.deadline || null,
            client_phone: newProject.phone, 
            client_email: newProject.email,
            git_repo: newProject.gitRepo,
            drive_url: newProject.driveUrl,
            budget: parseFloat(newProject.budget) || 0,
            paid: 0, // Arranque limpio y automatizado en 0
            tax_rate: parseInt(newProject.taxRate), // Guardado de tasa internacional
            status: 'ACTIVE',
            progress: 0,
            user_id: userId
          }
        ]);

      if (error) throw error;

      console.log(`Protocolo de desarrollo iniciado para: ${newProject.title}`);
      onProjectCreated(); 
      onClose();
      
      // Reseteo total del formulario sin el campo obsoleto
      setNewProject({ 
        title: '', clientId: '', clientName: '', purpose: '', tech: '', deadline: '', 
        phone: '', email: '', driveUrl: '', gitRepo: '', budget: '', taxRate: '0' 
      });

    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error al sincronizar: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <form 
        onSubmit={handleCreateProject}
        className="w-full max-w-2xl glass-card p-10 relative z-10 animate-in zoom-in-95 duration-300 border-primary-container/20 shadow-[0_0_50px_rgba(0,240,255,0.1)] max-h-[90vh] !overflow-y-auto custom-scrollbar bg-[#0a0c10] rounded-3xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-white font-outfit text-2xl font-bold uppercase tracking-tighter">Nuevo despliegue de proyecto</h3>
            <p className="text-primary-container font-space text-[10px] uppercase tracking-widest mt-1">Configuración impositiva internacional activa</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* NOMBRE PROYECTO */}
          <div className="space-y-2">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Nombre del Proyecto</label>
            <input 
              required type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none"
              placeholder="E.g. Proyecto Quantum"
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
            />
          </div>

          {/* SELECTOR DE CLIENTE (CONECTADO AL DIRECTORIO) */}
          <div className="space-y-2">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Cliente / Entidad (Directorio)</label>
            <select 
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none appearance-none"
              value={newProject.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              <option value="" className="bg-[#0a0c10]">SELECCIONAR CLIENTE...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#0a0c10]">{c.name}</option>
              ))}
            </select>
          </div>

          {/* DATOS AUTOMÁTICOS (SOLO LECTURA) */}
          <div className="space-y-2 opacity-50">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Email de Contacto (Auto)</label>
            <input 
              readOnly type="email" 
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm cursor-not-allowed"
              value={newProject.email}
              placeholder="Sincronizado..."
            />
          </div>

          <div className="space-y-2 opacity-50">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Teléfono (Auto)</label>
            <input 
              readOnly type="tel" 
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm cursor-not-allowed"
              value={newProject.phone}
              placeholder="Sincronizado..."
            />
          </div>

          {/* PROPÓSITO & OBJETIVO */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Propósito & Objetivo</label>
            <textarea 
              required rows={3}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none resize-none"
              placeholder="Describe para qué sirve..."
              value={newProject.purpose}
              onChange={(e) => setNewProject({...newProject, purpose: e.target.value})}
            />
          </div>

          {/* STACK TECNOLÓGICO */}
          <div className="space-y-2">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Stack Tecnológico</label>
            <input 
              required type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none"
              placeholder="React, Node, Rust..."
              value={newProject.tech}
              onChange={(e) => setNewProject({...newProject, tech: e.target.value})}
            />
          </div>

          {/* TIEMPO DE ENTREGA */}
          <div className="space-y-2">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Tiempo de Entrega</label>
            <input 
              type="date" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none color-scheme-dark"
              value={newProject.deadline}
              onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
            />
          </div>

          {/* URL REPOSITORIO GIT */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">URL Repositorio Git</label>
            <input 
              type="url" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none"
              placeholder="https://github.com/..."
              value={newProject.gitRepo}
              onChange={(e) => setNewProject({...newProject, gitRepo: e.target.value})}
            />
          </div>

          {/* FINANZAS E IMPUESTOS OPTIMIZADOS (2 COLUMNAS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <div className="space-y-2">
              <label className="text-white/50 font-space text-[10px] uppercase tracking-widest ml-1">Cotización Total</label>
              <input 
                required type="number" 
                min="0"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container outline-none"
                placeholder="0.00"
                value={newProject.budget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setNewProject({...newProject, budget: ''});
                  } else {
                    const num = Number(val);
                    setNewProject({...newProject, budget: num < 0 ? '0' : val});
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-cyan-400 font-space text-[10px] font-bold uppercase tracking-widest ml-1">Gravamen / Tax (%)</label>
              <select 
                className="w-full bg-white/[0.05] border border-cyan-500/20 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none appearance-none cursor-pointer"
                value={newProject.taxRate}
                onChange={(e) => setNewProject({...newProject, taxRate: e.target.value})}
              >
                <option value="0" className="bg-[#0a0c10]">0% (Exento / Export)</option>
                <option value="16" className="bg-[#0a0c10]">16% (México / Otros)</option>
                <option value="19" className="bg-[#0a0c10]">19% (Chile / Otros)</option>
                <option value="21" className="bg-[#0a0c10]">21% (Argentina / Otros)</option>
                <option value="25" className="bg-[#0a0c10]">25% (Europa / Otros)</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className={`w-full py-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-black font-space font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#00f0ff]/20 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'}`}
        >
          {loading ? 'SINCRONIZANDO...' : 'INICIAR PROTOCOLO DE DESARROLLO'}
        </button>
      </form>
    </div>
  );
};

export default CreateProjectModal;