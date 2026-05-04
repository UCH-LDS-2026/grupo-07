import React from 'react';

interface Client {
  name: string;
  email: string;
  company: string;
  projects: number;
  billing: number;
  paid: number;
  status: string;
  img: string;
  phone?: string;
  driveUrl?: string;
  projectSpecification?: string;
}

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  projects: any[];
  onDelete: (clientName: string) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, isOpen, onClose, currency, projects, onDelete }) => {
  if (!isOpen || !client) return null;


  const clientProjects = projects.filter(p => p.client === client.name || p.client === client.company);


  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      <div className="w-full max-w-3xl glass-card relative z-10 animate-in slide-in-from-bottom-8 duration-500 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Decorative header line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50"></div>
        
        <div className="p-8 lg:p-12">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-outline hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <div className="flex flex-col md:flex-row gap-10">
            {/* Profile Info Status */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className={`px-4 py-1 rounded-full text-[10px] font-space font-bold uppercase tracking-widest mb-4 ${
                client.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-outline border border-white/10'
              }`}>
                {client.status}
              </div>
            </div>


            {/* Right Column: Details */}
            <div className="flex-grow">
              <div className="mb-8">
                <h2 className="text-white font-outfit text-4xl font-extrabold tracking-tighter uppercase mb-1">
                  {client.name}
                </h2>
                <p className="text-primary-container font-space text-xs tracking-[0.2em] uppercase font-bold">
                  {client.company}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Correo Electrónico</span>
                  <p className="text-white font-space text-sm">{client.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Teléfono</span>
                  <p className="text-white font-space text-sm">{client.phone || 'NO REGISTRADO'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Facturación Total</span>
                  <p className="text-white font-bold font-space text-lg">{currency}{client.billing.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-green-500/80 font-space text-[10px] uppercase tracking-[0.2em]">Total Abonado</span>
                  <p className="text-green-400 font-bold font-space text-lg">{currency}{client.paid.toLocaleString()}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Repositorio Drive</span>
                  {client.driveUrl ? (
                    <a 
                      href={client.driveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-container hover:text-white transition-colors font-space text-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">link</span>
                      ACCEDER A ARCHIVOS
                    </a>
                  ) : (
                    <p className="text-outline font-space text-sm italic">SIN VÍNCULO ASIGNADO</p>
                  )}
                </div>
              </div>

              {/* Projects Status List */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary-container text-xl">folder_shared</span>
                  <h4 className="text-white font-outfit font-bold uppercase tracking-widest text-sm">Estado de Proyectos</h4>
                </div>
                <div className="space-y-3">
                  {clientProjects.length > 0 ? clientProjects.map((project: any) => (
                    <div key={project.id} className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                      <span className="text-white font-space text-xs font-bold uppercase">{project.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold font-space uppercase ${
                        project.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        project.status === 'PAUSED' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        PROYECTO {project.status}
                      </span>
                    </div>
                  )) : (
                    <p className="text-outline font-space text-[10px] uppercase italic">Sin proyectos registrados actualmente</p>
                  )}
                </div>
              </div>

              {/* Project Specification Section */}

              <div className="glass-card bg-white/[0.02] border-white/5 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary-container text-xl">assignment</span>
                  <h4 className="text-white font-outfit font-bold uppercase tracking-widest text-sm">Especificación del Proyecto</h4>
                </div>
                <div className="text-on-surface-variant font-space text-xs leading-relaxed">
                  {client.projectSpecification ? (
                    <p>{client.projectSpecification}</p>
                  ) : (
                    <p className="italic text-outline">No hay especificaciones detalladas para los {client.projects} proyectos activos.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
            <button 
              onClick={() => {
                if (confirm(`¿Estás seguro de que deseas ELIMINAR al cliente "${client.name}"? Esto también eliminará todos sus proyectos asociados.`)) {
                  onDelete(client.name);
                  onClose();
                }
              }}
              className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 font-space font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              ELIMINAR CLIENTE Y PROYECTOS
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-xl border border-white/10 text-white font-space font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
            >
              Cerrar Terminal
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
