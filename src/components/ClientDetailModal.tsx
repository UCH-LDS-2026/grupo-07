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

  // Filtrado tolerante a espacios y mayúsculas
  const clientProjects = (projects || []).filter(p => 
    p.client?.trim().toLowerCase() === client.name?.trim().toLowerCase() || 
    (client.company && p.client?.trim().toLowerCase() === client.company?.trim().toLowerCase())
  );

  // Cálculos dinámicos para evitar el error de $0
  const dynamicBilling = clientProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const dynamicPaid = clientProjects.reduce((acc, p) => acc + (Number(p.paid) || 0), 0);

  // Recuperación de contactos desde proyectos
  const fallbackPhone = clientProjects.find(p => p.client_phone)?.client_phone;
  const fallbackEmail = clientProjects.find(p => p.client_email)?.client_email;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="w-full max-w-3xl glass-card relative z-10 animate-in slide-in-from-bottom-8 duration-500 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50"></div>
        
        <div className="p-8 lg:p-12">
          <button onClick={onClose} className="absolute top-6 right-6 text-outline hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className={`px-4 py-1 rounded-full text-[10px] font-space font-bold uppercase tracking-widest mb-4 ${
                client.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-outline border border-white/10'
              }`}>
                {client.status || 'INACTIVO'}
              </div>
            </div>

            <div className="flex-grow">
              <div className="mb-8">
                <h2 className="text-white font-outfit text-4xl font-extrabold tracking-tighter uppercase mb-1">{client.name}</h2>
                <p className="text-primary-container font-space text-xs tracking-[0.2em] uppercase font-bold">{client.company || 'CLIENTE PARTICULAR'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Correo Electrónico</span>
                  <p className="text-white font-space text-sm">{client.email || fallbackEmail || 'NO REGISTRADO'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Teléfono</span>
                  <p className="text-white font-space text-sm">{client.phone || fallbackPhone || 'NO REGISTRADO'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">Facturación Total</span>
                  <p className="text-white font-bold font-space text-lg">{currency}{dynamicBilling.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-green-500/80 font-space text-[10px] uppercase tracking-[0.2em]">Total Abonado</span>
                  <p className="text-green-400 font-bold font-space text-lg">{currency}{dynamicPaid.toLocaleString()}</p>
                </div>
              </div>

              {/* Lista de Proyectos */}
              <div className="mb-8">
                <h4 className="text-white font-outfit font-bold uppercase tracking-widest text-sm mb-4">Estado de Proyectos ({clientProjects.length})</h4>
                <div className="space-y-3">
                  {clientProjects.length > 0 ? clientProjects.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                      <span className="text-white font-space text-xs font-bold uppercase">{p.title}</span>
                      <span className="text-primary-container text-[10px] font-bold font-space">{p.status}</span>
                    </div>
                  )) : <p className="text-outline font-space text-[10px] italic">Sin proyectos registrados</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
            <button onClick={() => confirm(`¿Eliminar a ${client.name}?`) && (onDelete(client.name), onClose())} 
              className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 font-space font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              ELIMINAR CLIENTE
            </button>
            <button onClick={onClose} className="px-8 py-3 rounded-xl border border-white/10 text-white font-space font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
              Cerrar Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;