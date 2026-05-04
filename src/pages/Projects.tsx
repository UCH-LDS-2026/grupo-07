import { useState } from 'react';




interface ProjectsProps {
  projects: any[];
  onOpenCreateModal: () => void;
  currency: string;
  onUpdateStatus: (projectId: number, status: string) => void;
  onUpdateProgress: (projectId: number, progress: number) => void;
  onDelete: (projectId: number) => void;
}


export default function Projects({ projects, onOpenCreateModal, currency, onUpdateStatus, onUpdateProgress, onDelete }: ProjectsProps) {




  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);


  const currentProject = projects.find(p => p.id === selectedProjectId);

  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);

  const handleOpenDetail = (project: any) => {
    setSelectedProjectId(project.id);
    setTempProgress(project.progress);
  };


  return (
    <main className="ml-64 min-h-screen p-8 lg:p-12 relative overflow-hidden bg-[#05070a]">
      <div className="scanline-overlay"></div>
      
      {/* Top Header HUD */}
      <header className="flex items-center justify-between mb-12 relative z-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-outfit text-white text-xl font-black tracking-tighter">NEXUS SGE</h2>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <span className="text-primary-container font-space text-[10px] font-bold uppercase tracking-[0.3em]">Projects Terminal</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-primary-container transition-all">
            <span className="material-symbols-outlined text-outline text-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-[10px] font-space text-white placeholder:text-outline/50 w-48 outline-none uppercase tracking-widest"
              placeholder="CMD+K SEARCH..."
              type="text"
            />
          </div>
        </div>

      </header>

      {/* Title Section */}
      <section className="mb-12 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-[1px] bg-primary-container/50"></div>
          <span className="text-primary-container font-space text-[10px] font-bold uppercase tracking-widest">Development Module</span>
        </div>
        <h1 className="text-white font-outfit text-4xl font-extrabold tracking-tighter mb-2">TERMINAL DE PROYECTOS</h1>
        <p className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Módulo de Desarrollo Operativo [NEXUS]</p>
      </section>

      {/* Grid Projects */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 relative z-10">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card border-white/5">
            <p className="text-outline font-space text-[10px] uppercase tracking-[0.4em]">Sin proyectos activos registrados</p>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => handleOpenDetail(project)}
              className="glass-card p-8 group border-white/5 hover:border-primary-container/30 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white text-xl font-bold font-outfit mb-1">{project.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                      project.status === 'PAUSED' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 
                      'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    }`}></span>
                    <span className={`text-[10px] font-space font-bold uppercase tracking-widest ${
                      project.status === 'ACTIVE' ? 'text-green-500' : 
                      project.status === 'PAUSED' ? 'text-orange-400' : 
                      'text-blue-400'
                    }`}>{project.status}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors opacity-30 group-hover:opacity-100">{project.icon}</span>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[9px] font-space text-outline/70 uppercase tracking-widest">{project.description || project.client}</span>
                  <span className="text-[10px] font-space font-bold text-primary-container">{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-container to-secondary-container transition-all duration-1000 ease-out" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[9px] font-space text-outline font-bold uppercase tracking-tighter">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <div className="text-right">
                  <p className="text-white font-bold font-outfit text-lg">{currency}{project.budget.toLocaleString()}</p>
                  <p className="text-outline text-[9px] font-space uppercase">Cotización</p>
                </div>
                <a 
                  href={project.gitRepo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-primary-container text-[10px] font-space font-bold hover:underline"
                >
                  VIEW REPO
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </div>
          ))
        )}
      </section>





      {/* Project Detail Drawer */}
      {currentProject && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => { setSelectedProjectId(null); }}
          ></div>
          <div className="w-full max-w-xl h-full bg-[#05070a] border-l border-white/10 relative z-10 animate-in slide-in-from-right duration-500 overflow-y-auto custom-scrollbar">
            <div className="p-12">
              <button 
                onClick={() => { setSelectedProjectId(null); }}
                className="flex items-center gap-2 text-outline hover:text-primary-container transition-colors mb-12 font-space text-[10px] font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                VOLVER AL TERMINAL
              </button>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className={`font-outfit text-4xl font-extrabold tracking-tighter mb-2 transition-colors duration-500 ${
                    currentProject.status === 'ACTIVE' ? 'text-primary-container' :
                    currentProject.status === 'PAUSED' ? 'text-orange-400' :
                    'text-blue-400'
                  }`}>{currentProject.title}</h2>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      {['ACTIVE', 'PAUSED', 'FINISHED'].map((status) => {
                        const isSelected = currentProject.status === status;
                        const colors = {
                          ACTIVE: 'hover:bg-primary-container/20 hover:border-primary-container/40 hover:text-primary-container active:bg-primary-container active:text-on-primary',
                          PAUSED: 'hover:bg-orange-500/20 hover:border-orange-500/40 hover:text-orange-400 active:bg-orange-500 active:text-white',
                          FINISHED: 'hover:bg-blue-600/20 hover:border-blue-600/40 hover:text-blue-400 active:bg-blue-600 active:text-white',
                        };
                        return (
                          <button
                            key={status}
                            onClick={() => onUpdateStatus(currentProject.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold font-space transition-all border ${
                              isSelected
                                ? status === 'ACTIVE' ? 'bg-primary-container text-on-primary border-primary-container shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' :
                                  status === 'PAUSED' ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                                  'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                : `bg-white/[0.03] text-outline border-white/5 ${colors[status as keyof typeof colors]}`
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-outline font-space text-[10px] uppercase tracking-widest">Protocol v2.4.0</span>
                  </div>


                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative overflow-hidden group">
                  <div className={`absolute inset-0 blur-2xl opacity-20 transition-colors duration-500 ${
                    currentProject.status === 'ACTIVE' ? 'bg-primary-container' :
                    currentProject.status === 'PAUSED' ? 'bg-orange-500' :
                    'bg-blue-600'
                  }`}></div>
                  <span className={`material-symbols-outlined text-3xl transition-colors duration-500 relative z-10 ${
                    currentProject.status === 'ACTIVE' ? 'text-primary-container' :
                    currentProject.status === 'PAUSED' ? 'text-orange-400' :
                    'text-blue-400'
                  }`}>{currentProject.icon}</span>
                </div>
              </div>

              <div className="space-y-12">
                {/* Description */}
                <div>
                  <h4 className="text-primary-container font-space text-[10px] font-bold uppercase tracking-[0.2em] mb-4">MISIÓN_DEL_PROYECTO</h4>
                  <p className="text-white/80 font-body-base text-sm leading-relaxed">
                    {currentProject.purpose}
                  </p>
                </div>

                {/* Ecosystem / Client */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-outline font-space text-[10px] font-bold uppercase tracking-[0.2em] mb-4">CLIENTE_Y_ENTIDAD</h4>
                  <p className="text-white text-sm font-bold">
                    {currentProject.client}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-primary-container font-space text-[10px] font-bold uppercase tracking-[0.2em] mb-6">TECNOLOGÍAS_IMPLEMENTADAS</h4>
                  <div className="flex flex-wrap gap-3">
                    {currentProject.tags.map((tag: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01]">
                        <span className="text-primary-container text-[10px] font-bold font-space">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources / Links */}
                <div>
                  <h4 className="text-primary-container font-space text-[10px] font-bold uppercase tracking-[0.2em] mb-6">RECURSOS_Y_ACCESOS</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {currentProject.gitRepo && (
                      <a 
                        href={currentProject.gitRepo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-primary-container/30 transition-all bg-white/[0.01] group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary-container">code</span>
                          <span className="text-white text-xs font-bold font-space uppercase">Repositorio Git</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-sm">open_in_new</span>
                      </a>
                    )}
                    {currentProject.driveUrl && (
                      <a 
                        href={currentProject.driveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-primary-container/30 transition-all bg-white/[0.01] group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary-container">description</span>
                          <span className="text-white text-xs font-bold font-space uppercase">Documentación Drive</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-sm">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Project Analytics */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="glass-card p-4 text-center border-white/5 cursor-pointer hover:border-primary-container/30 transition-all group"
                    onClick={() => {
                      setTempProgress(currentProject.progress);
                      setIsEditingProgress(true);
                    }}
                  >
                    <p className="text-outline text-[9px] font-space uppercase mb-1 group-hover:text-primary-container transition-colors">PROGRESO</p>
                    {isEditingProgress ? (
                      <div className="flex items-center justify-center gap-2">
                        <input 
                          autoFocus
                          type="number" 
                          min="0" 
                          max="100"
                          className="w-16 bg-white/5 border border-primary-container/30 rounded px-2 py-1 text-white text-center font-bold text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={tempProgress}
                          onChange={(e) => setTempProgress(parseInt(e.target.value) || 0)}

                          onBlur={() => {
                            onUpdateProgress(currentProject.id, tempProgress);
                            setIsEditingProgress(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onUpdateProgress(currentProject.id, tempProgress);
                              setIsEditingProgress(false);
                            }
                          }}
                        />
                        <span className="text-white font-bold">%</span>
                      </div>
                    ) : (
                      <p className="text-white font-bold">{currentProject.progress}%</p>
                    )}
                  </div>
                  <div className="glass-card p-4 text-center border-white/5">
                    <p className="text-outline text-[9px] font-space uppercase mb-1">FECHA_ENTREGA</p>
                    <p className="text-primary-container font-bold">{currentProject.deadline}</p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-outline font-space text-[10px] font-bold uppercase tracking-[0.2em] mb-4">RESUMEN_FINANCIERO</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] text-outline font-space uppercase mb-1">Cotización</p>
                      <p className="text-white font-bold font-outfit text-xl">{currency}{currentProject.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-outline font-space uppercase mb-1">Abonado</p>
                      <p className="text-green-400 font-bold font-outfit text-xl">{currency}{currentProject.paid.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${(currentProject.paid / currentProject.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>



                <div className="mt-12 space-y-4">
                  <button 
                    onClick={() => {
                      if (confirm(`¿Estás seguro de que deseas ELIMINAR el proyecto "${currentProject.title}"? Esto también eliminará al cliente asociado.`)) {
                        onDelete(currentProject.id);
                        setSelectedProjectId(null);
                      }
                    }}
                    className="w-full py-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 font-space font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
                  >
                    ELIMINAR PROYECTO Y CLIENTE
                  </button>

                  <button className="w-full py-4 rounded-2xl bg-primary-container text-on-primary font-space font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined">launch</span>
                    DESPLEGAR TERMINAL DE DESARROLLO
                  </button>
                </div>

            </div>
          </div>
        </div>
      )}

      {/* Footer HUD */}
      <footer className="fixed bottom-12 left-72 right-12 z-10 py-4 px-8 glass-card border-white/5 bg-black/40 flex justify-between items-center">
        <div className="flex gap-8 items-center text-[9px] font-space font-bold text-outline uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span>System Status:</span>
            <span className="text-green-500">Optimal</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span>Active Tasks:</span>
            <span className="text-white">42</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span>Uptime:</span>
            <span className="text-white">99.98%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-space font-bold text-outline uppercase tracking-widest">
          <span>Operator: Alpha-9</span>
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button 
        onClick={onOpenCreateModal}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-container text-on-primary shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
      </button>

      {/* Decorative Gradients */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container/5 blur-[180px]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[150px]"></div>
      </div>
    </main>
  );
}
