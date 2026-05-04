import { useState } from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: any) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [newProject, setNewProject] = useState({
    title: '',
    client: '',
    purpose: '',
    tech: '',
    deadline: '',
    phone: '',
    email: '',
    driveUrl: '',
    gitRepo: '',
    budget: '',
    paid: ''
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(newProject);
    alert(`Iniciando protocolo de desarrollo para: ${newProject.title}`);
    onClose();
    setNewProject({ title: '', client: '', purpose: '', tech: '', deadline: '', phone: '', email: '', driveUrl: '', gitRepo: '', budget: '', paid: '' });
  };





  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      <form 
        onSubmit={handleCreateProject}
        className="w-full max-w-2xl glass-card p-10 relative z-10 animate-in zoom-in-95 duration-300 border-primary-container/20 shadow-[0_0_50px_rgba(0,240,255,0.1)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-white font-outfit text-2xl font-bold uppercase tracking-tighter">Nuevo despliegue de proyecto</h3>
            <p className="text-primary-container font-space text-[10px] uppercase tracking-widest mt-1">Configuración de parámetros operativos</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-outline hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Nombre del Proyecto</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="E.g. Proyecto Quantum"
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Cliente / Entidad</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="E.g. Cyberdyne Inc"
              value={newProject.client}
              onChange={(e) => setNewProject({...newProject, client: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Propósito & Objetivo</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none resize-none"
              placeholder="Describe para qué sirve..."
              value={newProject.purpose}
              onChange={(e) => setNewProject({...newProject, purpose: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Stack Tecnológico</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="React, Node, Rust..."
              value={newProject.tech}
              onChange={(e) => setNewProject({...newProject, tech: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Tiempo de Entrega</label>
            <input 
              required
              type="date" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              value={newProject.deadline}
              onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Teléfono de Contacto</label>
            <input 
              type="tel" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="+34 000 000 000"
              value={newProject.phone}
              onChange={(e) => setNewProject({...newProject, phone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="cliente@ejemplo.com"
              value={newProject.email}
              onChange={(e) => setNewProject({...newProject, email: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">URL Repositorio Git (GitHub/GitLab)</label>
            <input 
              type="url" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="https://github.com/..."
              value={newProject.gitRepo}
              onChange={(e) => setNewProject({...newProject, gitRepo: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">URL Documentación (Drive/Notion)</label>
            <input 
              type="url" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="https://drive.google.com/..."
              value={newProject.driveUrl}
              onChange={(e) => setNewProject({...newProject, driveUrl: e.target.value})}
            />
          </div>


          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div className="space-y-2">
              <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Cotización Total (€)</label>
              <input 
                required
                type="number" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
                placeholder="0.00"
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Monto Abonado (€)</label>
              <input 
                required
                type="number" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none"
                placeholder="0.00"
                value={newProject.paid}
                onChange={(e) => setNewProject({...newProject, paid: e.target.value})}
              />
            </div>
          </div>
        </div>




        <button 
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-space font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary-container/20"
        >
          INICIAR PROTOCOLO DE DESARROLLO
        </button>
      </form>
    </div>
  );
};

export default CreateProjectModal;
