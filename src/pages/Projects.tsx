import { useState, useEffect } from 'react';
import { Project } from '../lib/types';
import { supabase } from '../lib/supabase';
import CreateProjectModal from '../components/CreateProjectModal';

interface ProjectsProps {
  projects: Project[];
  currency: string;
  onUpdateStatus: (projectId: number, status: string) => void;
  onUpdateProgress: (projectId: number, progress: number) => void;
  onDelete: (projectId: number) => void;
  fetchProjects: () => void;
}

export default function Projects({ 
  projects, 
  currency, 
  onUpdateStatus, 
  onUpdateProgress, 
  onDelete,
  fetchProjects
}: ProjectsProps) {

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setUserId(data.session.user.id);
    };
    getSession();
  }, []);

  // Buscamos el proyecto actual cada vez que cambia el ID seleccionado o la lista de proyectos
  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Filtrar proyectos según búsqueda
  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      p.title.toLowerCase().includes(search) ||
      (p.client && p.client.toLowerCase().includes(search)) ||
      p.status.toLowerCase().includes(search) ||
      (p.tech && p.tech.toLowerCase().includes(search))
    );
  });

  const handleOpenDetail = (project: Project) => {
    setSelectedProjectId(project.id);
    setTempProgress(project.progress);
    setIsEditingProgress(false);
  };

  const handleUpdateProgressSubmit = async () => {
    if (selectedProjectId !== null) {
      const validatedProgress = Math.min(Math.max(tempProgress, 0), 100);
      
      // Ejecutamos la función que viene de App.tsx
      await onUpdateProgress(selectedProjectId, validatedProgress);
      
      // Cerramos el modo edición tras confirmar el cambio
      setIsEditingProgress(false);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-12 relative overflow-hidden bg-[#05070a]">
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="scanline-overlay"></div>
      
      <header className="flex items-center justify-between mb-12 relative z-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-outfit text-white text-xl font-black tracking-tighter">NEXUS SGE</h2>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <span className="text-primary-container font-space text-[10px] font-bold uppercase tracking-[0.3em]">Operational Terminal</span>
        </div>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-white/30 text-sm">search</span>
          <input
            type="text"
            placeholder="BUSCAR PROYECTO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-full pl-10 pr-4 py-2 text-white text-[10px] font-space uppercase tracking-widest placeholder:text-white/20 focus:border-primary-container/50 outline-none w-64 transition-all focus:w-80"
          />
        </div>
      </header>

      <section className="mb-12 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-[1px] bg-primary-container/50"></div>
          <span className="text-primary-container font-space text-[10px] font-bold uppercase tracking-widest">Client & Project Assets</span>
        </div>
        <h1 className="text-white font-outfit text-4xl font-extrabold tracking-tighter mb-2">GESTIÓN TERMINAL</h1>
        <p className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Módulo Emma-Nexus [DB_SYNC_READY]</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 relative z-10">
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => handleOpenDetail(project)}
            className="glass-card p-8 group border-white/5 hover:border-primary-container/30 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-primary-container font-space text-[9px] font-bold uppercase mb-1">
                  {project.client || 'Cliente Particular'}
                </p>
                <h3 className="text-white text-xl font-bold font-outfit mb-1">{project.title}</h3>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors opacity-30 group-hover:opacity-100">
                {project.icon || 'deployed_code'}
              </span>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-space font-bold text-primary-container">{project.progress}%</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-space uppercase border ${
                  project.status === 'ACTIVE' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : project.status === 'PAUSED'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <p className="text-white font-bold font-outfit text-lg">{currency}{project.budget.toLocaleString()}</p>
              <span className="text-primary-container text-[10px] font-bold font-space group-hover:translate-x-1 transition-transform flex items-center gap-1">
                DETALLES <span className="material-symbols-outlined text-xs">chevron_right</span>
              </span>
            </div>
          </div>
        ))}
      </section>

      {currentProject && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedProjectId(null)}></div>
          <div className="w-full max-w-xl h-full bg-[#05070a] border-l border-white/10 relative z-10 p-12 overflow-y-auto custom-scrollbar">
            <button onClick={() => setSelectedProjectId(null)} className="flex items-center gap-2 text-outline hover:text-primary-container transition-colors mb-12 font-space text-[10px] font-bold uppercase">
              <span className="material-symbols-outlined text-sm">arrow_back</span> VOLVER AL TERMINAL
            </button>

            <div className="space-y-12">
              <header>
                <p className="text-primary-container font-space text-xs font-bold uppercase mb-2">CLIENTE: {currentProject.client || 'N/A'}</p>
                <h2 className="text-white text-4xl font-black font-outfit">{currentProject.title}</h2>
              </header>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h4 className="text-outline font-space text-[10px] font-bold uppercase mb-4">ESTADO_DEL_PROYECTO</h4>
                <div className="flex gap-4">
                  {['ACTIVE', 'PAUSED', 'FINISHED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(currentProject.id, status)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-bold font-space border transition-all ${
                        currentProject.status === status ? 'bg-primary-container text-black border-primary-container' : 'border-white/10 text-outline'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                className="glass-card p-6 border-white/5 hover:border-primary-container/30 transition-all cursor-pointer group"
                onClick={() => !isEditingProgress && setIsEditingProgress(true)}
              >
                <p className="text-outline text-[9px] font-space uppercase mb-4 group-hover:text-primary-container">PROGRESO_OPERATIVO</p>
                {isEditingProgress ? (
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex items-center">
                      <input 
                        autoFocus
                        type="number"
                        className="bg-white/5 border border-primary-container/40 text-white rounded-lg p-2 font-space w-24 outline-none focus:border-primary-container"
                        value={tempProgress}
                        onChange={(e) => setTempProgress(Number(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateProgressSubmit()}
                      />
                      <span className="absolute right-3 text-primary-container font-bold text-xs">%</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateProgressSubmit();
                      }}
                      className="flex items-center justify-center bg-primary-container text-black rounded-lg h-[42px] px-4 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">done_all</span>
                      <span className="font-space text-[10px] font-black ml-2">LISTO</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white text-2xl font-bold font-outfit">{currentProject.progress}%</p>
                    <span className="material-symbols-outlined text-outline text-sm opacity-0 group-hover:opacity-100">edit</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (confirm(`¿Eliminar definitivamente "${currentProject.title}"?`)) {
                    onDelete(currentProject.id);
                    setSelectedProjectId(null);
                  }
                }}
                className="w-full py-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 font-space font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
              >
                ELIMINAR ACTIVO Y REGISTROS ASOCIADOS
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-container text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </button>

      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => {
          fetchProjects();
          setIsCreateModalOpen(false);
        }}
        userId={userId || ''}
      />
    </main>
  );
}