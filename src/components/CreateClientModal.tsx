import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onClientCreated: () => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  onClientCreated 
}) => {
  const [loading, setLoading] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    driveUrl: ''
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de seguridad: si no hay userId, no podemos guardar
    if (!userId) {
      console.error("Error de autenticación: No se detectó ID de operador.");
      return;
    }

    setLoading(true);

    try {
      // Inserción en la tabla 'clients' con las nuevas columnas
      const { error } = await supabase
        .from('clients')
        .insert([{
          name: newClient.name,
          email: newClient.email,
          company: newClient.company,
          phone: newClient.phone,
          drive_url: newClient.driveUrl, // Mapeado a la columna drive_url de Supabase
          operator_id: userId,          // Mapeado a la columna operator_id
          status: 'Active'              // Mapeado a la columna status
        }]);

      if (error) throw error;

      // Si todo sale bien:
      onClientCreated(); // Avisa a App.tsx/Clients.tsx que refresque la lista
      setNewClient({ name: '', email: '', company: '', phone: '', driveUrl: '' }); // Limpia el form
      onClose(); // Cierra el modal
      
    } catch (err: any) {
      console.error("Falla en el despliegue de datos:", err.message);
      console.error(`ERROR NEXUS_DB: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      <form 
        onSubmit={handleCreateClient}
        className="w-full max-w-2xl glass-card p-10 relative z-10 animate-in zoom-in-95 duration-300 border-primary-container/20 shadow-[0_0_50px_rgba(0,240,255,0.1)]"
      >
        {/* Header del Modal */}
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

        {/* Grid de Inputs */}
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

        {/* Botón de Acción */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-space font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm animate-spin-slow">
            {loading ? 'sync' : 'save'}
          </span>
          {loading ? 'ESTABLECIENDO CONEXIÓN...' : 'SINCRONIZAR NUEVA ENTIDAD'}
        </button>
      </form>
    </div>
  );
};

export default CreateClientModal;