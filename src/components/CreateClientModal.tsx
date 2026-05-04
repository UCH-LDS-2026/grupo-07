import { useState } from 'react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({ isOpen, onClose }) => {
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    driveUrl: ''
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    // En una aplicación real, aquí enviaríamos los datos a la API/Base de datos
    alert(`Protocolo de registro completado para: ${newClient.name}\nEntidad: ${newClient.company}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      <form 
        onSubmit={handleCreateClient}
        className="w-full max-w-2xl glass-card p-10 relative z-10 animate-in zoom-in-95 duration-300 border-primary-container/20 shadow-[0_0_50px_rgba(0,240,255,0.1)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-white font-outfit text-2xl font-bold uppercase tracking-tighter">Registro de Nueva Entidad</h3>
            <p className="text-primary-container font-space text-[10px] uppercase tracking-widest mt-1">Sincronización de base de datos de clientes [NEXUS_DB]</p>
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
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
              placeholder="E.g. Alexander Vance"
              value={newClient.name}
              onChange={(e) => setNewClient({...newClient, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Correo Electrónico</label>
            <input 
              required
              type="email" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
              placeholder="vance@cyberdyne.tech"
              value={newClient.email}
              onChange={(e) => setNewClient({...newClient, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Nombre de la Empresa</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
              placeholder="Cyberdyne Systems"
              value={newClient.company}
              onChange={(e) => setNewClient({...newClient, company: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Teléfono de Contacto</label>
            <input 
              required
              type="tel" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
              placeholder="+34 600 000 000"
              value={newClient.phone}
              onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
              URL Archivos en Drive
            </label>
            <input 
              type="url" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
              placeholder="https://drive.google.com/drive/folders/..."
              value={newClient.driveUrl}
              onChange={(e) => setNewClient({...newClient, driveUrl: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-space font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          SINCRONIZAR NUEVA ENTIDAD
        </button>
      </form>
    </div>
  );
};

export default CreateClientModal;
