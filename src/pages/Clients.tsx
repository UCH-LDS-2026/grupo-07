import { useState } from 'react';
import CreateClientModal from '../components/CreateClientModal';
import ClientDetailModal from '../components/ClientDetailModal';
import SearchBar from '../components/SearchBar';

interface ClientsProps {
  clients: any[];
  currency: string;
  projects: any[];
  onDelete: (clientName: string) => void;
  // NUEVAS PROPS PARA EL GUARDADO REAL
  userId: string;
  onRefresh: () => void;
}

export default function Clients({ 
  clients, 
  currency, 
  projects, 
  onDelete,
  userId,
  onRefresh
}: ClientsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenDetail = (client: any) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase().trim();
    return (
      client.name.toLowerCase().includes(search) ||
      (client.company && client.company.toLowerCase().includes(search)) ||
      (client.email && client.email.toLowerCase().includes(search))
    );
  });

  return (
    <main className="min-h-screen p-8 lg:p-12 relative">
      <div className="scanline-overlay"></div>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
        <div>
          <h2 className="font-outfit text-white text-4xl md:text-5xl font-extrabold tracking-tighter neon-text transition-colors">
            DIRECTORIO <span className="text-primary-container font-light">// RELACIONES</span>
          </h2>
          <p className="text-outline font-space text-xs mt-2 tracking-[0.3em] uppercase transition-colors">
            Módulo de Gestión Estratégica de Clientes [NEXUS_DB]
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-space font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            NUEVO CLIENTE
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
        <div className="border-white/5 glass-card p-6 border-l-4 border-l-primary-container hover:bg-white/[0.03] transition-colors cursor-default rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-outline font-space text-[10px] uppercase tracking-widest transition-colors">Clientes Activos</span>
            <span className="material-symbols-outlined text-primary-container">person_check</span>
          </div>
          <div className="text-3xl font-bold text-white font-outfit transition-colors">
            {clients.filter(c => c.status === 'Active').length}
          </div>
          <div className="text-[10px] font-space text-primary-container mt-1 font-bold">ENTIDADES OPERATIVAS</div>
        </div>

        <div className="border-white/5 glass-card p-6 border-l-4 border-l-outline hover:bg-white/[0.03] transition-colors cursor-default rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-outline font-space text-[10px] uppercase tracking-widest transition-colors">Clientes Inactivos</span>
            <span className="material-symbols-outlined text-outline">person_off</span>
          </div>
          <div className="text-3xl font-bold text-white font-outfit transition-colors">
            {clients.filter(c => c.status !== 'Active').length}
          </div>
          <div className="text-[10px] font-space text-outline mt-1 font-bold">FUERA DE TERMINAL</div>
        </div>
      </section>

      {/* Directory Table */}
      <section className="glass-card overflow-hidden relative z-10 rounded-2xl shadow-sm transition-colors">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01] transition-colors">
          <h3 className="font-outfit text-xl text-white font-bold transition-colors">Terminal de Datos de Clientes</h3>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-outline font-space text-[10px] uppercase tracking-widest bg-white/[0.02] border-b border-white/5 transition-colors">
              <tr>
                <th className="px-8 py-5 font-medium">IDENTIDAD</th>
                <th className="px-8 py-5 font-medium">COMPAÑÍA</th>
                <th className="px-8 py-5 font-medium">PROYECTOS_ACTIVOS</th>
                <th className="px-8 py-5 font-medium">FACTURACIÓN</th>
                <th className="px-8 py-5 font-medium">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-outline font-space text-[10px] uppercase tracking-[0.4em]">
                    {searchTerm ? `No hay resultados para "${searchTerm}"` : "Sin entidades registradas"}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, i) => (
                  <tr 
                    key={i} 
                    onClick={() => handleOpenDetail(client)}
                    className="hover:bg-white/[0.04] transition-all group cursor-pointer active:bg-white/[0.06]"
                  >
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-white font-bold text-sm font-outfit uppercase group-hover:text-primary-container transition-colors">{client.name}</p>
                        <p className="text-[10px] text-outline font-space">{client.email}</p>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-on-surface-variant font-space text-[11px] uppercase">{client.company}</td>
                    <td className="px-8 py-6">
                      <span className="text-primary-container font-space text-[11px] font-bold">{(client.projectsCount || 0)} PROYECTOS</span>
                    </td>
                    <td className="px-8 py-6 text-white font-bold font-space text-sm transition-colors">
                      {currency}{(client.billing || 0).toLocaleString()}
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-outline'}`}></span>
                        <span className={`text-[10px] font-bold font-space uppercase ${client.status === 'Active' ? 'text-green-500' : 'text-outline'}`}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Decorative Gradients */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden block">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container/10 blur-[180px]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[150px]"></div>
      </div>

      <CreateClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={userId}
        onClientCreated={onRefresh}
      />

      <ClientDetailModal 
        client={selectedClient}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        currency={currency}
        projects={projects}
        onDelete={onDelete}
      />
    </main>
  );
}