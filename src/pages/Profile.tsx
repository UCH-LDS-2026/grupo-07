import React, { useState, useRef } from 'react';

interface ProfileProps {
  user: { name: string, role: string, email: string, phone: string, avatar?: string, password?: string };
  onUpdateUser: (data: any) => void;
  activeProjectsCount: number;
  onLogout: () => void;
}


export default function Profile({ user, onUpdateUser, activeProjectsCount, onLogout }: ProfileProps) {



  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileProps['user']>({ ...user });
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (currentPasswordInput !== user.password) {
      setError('VERIFICACIÓN FALLIDA: Contraseña actual incorrecta.');
      return;
    }

    onUpdateUser(editData);
    setIsEditing(false);
    setCurrentPasswordInput('');
    setError('');
  };


  return (
    <main className="ml-64 min-h-screen p-8 lg:p-12 relative overflow-hidden bg-[#05070a]">
      <div className="scanline-overlay"></div>

      {/* Header HUD */}
      <header className="mb-12 relative z-10 border-b border-white/5 pb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-[1px] bg-primary-container/50"></div>
            <span className="text-primary-container font-space text-[10px] font-bold uppercase tracking-widest">Operator Identity</span>
          </div>
          <h1 className="text-white font-outfit text-4xl font-extrabold tracking-tighter">PERFIL DE OPERADOR</h1>
        </div>
        <div className="text-right">
          <p className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">ID: {user.name.toUpperCase().replace(/\s+/g, '-')}</p>
          <p className="text-primary-container font-space text-[9px] font-bold uppercase tracking-widest">Status: Fully Operational</p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Col: Bio & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 border-primary-container/20 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-container to-secondary-container"></div>
             <div 
               onClick={() => setIsEditing(true)}
               className="w-40 h-40 rounded-full border-2 border-primary-container/30 p-1.5 mb-6 relative group cursor-pointer"
             >
               <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               {user.avatar ? (
                 <img 
                   src={user.avatar} 
                   alt="Profile" 
                   className="w-full h-full rounded-full object-cover relative z-10"
                 />
               ) : (
                 <div className="w-full h-full rounded-full bg-white/[0.03] flex items-center justify-center text-primary-container text-4xl font-black font-outfit relative z-10">
                   {getInitials(user.name)}
                 </div>
               )}
               <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary-container rounded-full flex items-center justify-center border-2 border-[#05070a] z-20 shadow-lg group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined text-[16px] text-on-primary">edit</span>
               </div>
             </div>
             <h2 className="text-2xl font-bold text-white font-outfit tracking-tight">{user.name}</h2>
             <p className="text-primary-container font-space text-[10px] font-bold uppercase tracking-widest mb-6">{user.role}</p>
             
             <button 
               onClick={() => setIsEditing(true)}
               className="w-full py-3 rounded-xl bg-primary-container/10 border border-primary-container/20 text-primary-container font-space text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container/20 transition-all active:scale-[0.98] mb-6"
             >
               Editar Perfil
             </button>

             <div className="w-full space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-space uppercase">
                  <span className="text-outline">Email</span>
                  <span className="text-white font-bold tracking-widest text-right truncate ml-4">{user.email}</span>
                </div>
                <div className="flex justify-between text-[10px] font-space uppercase">
                  <span className="text-outline">Teléfono</span>
                  <span className="text-white font-bold tracking-widest text-right">{user.phone}</span>
                </div>
                <div className="flex justify-between text-[10px] font-space uppercase">
                  <span className="text-outline">Proyectos Activos</span>
                  <span className="text-green-400 font-bold tracking-widest text-right">{activeProjectsCount} ACTIVE</span>
                </div>

                <button 
                  onClick={onLogout}
                  className="w-full mt-6 py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 font-space text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Cerrar Sesión
                </button>
             </div>
          </div>


          <div className="glass-card p-6 border-white/5 space-y-4">
            <h3 className="text-white font-space text-[10px] font-bold uppercase tracking-widest mb-4">Neural Network Links</h3>
            <button className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 px-4 hover:bg-white/5 transition-colors">
               <span className="material-symbols-outlined text-outline text-lg">link</span>
               <span className="text-white font-space text-[10px] font-bold uppercase tracking-widest">GitHub Protocol</span>
            </button>
            <button className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 px-4 hover:bg-white/5 transition-colors">
               <span className="material-symbols-outlined text-outline text-lg">hub</span>
               <span className="text-white font-space text-[10px] font-bold uppercase tracking-widest">LinkedIn Sync</span>
            </button>
          </div>
        </div>

        {/* Right Col: Placeholder or Security Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-12 border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[400px] bg-white/[0.01]">
              <div className="w-20 h-20 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary-container text-4xl">shield_person</span>
              </div>
              <h3 className="text-white font-outfit text-2xl font-bold uppercase tracking-tighter mb-4">Seguridad de la Cuenta</h3>
              <p className="text-outline font-space text-xs uppercase tracking-widest max-w-md leading-relaxed">
                Los parámetros de acceso y credenciales de nivel de operador están protegidos bajo protocolos de encriptación NEXUS. Utiliza el panel de edición para actualizar tus credenciales de red.
              </p>
              <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-[8px] text-outline uppercase tracking-widest mb-1">Último Acceso</p>
                  <p className="text-white font-mono text-[10px] uppercase">Detected: 19:21:10</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-[8px] text-outline uppercase tracking-widest mb-1">Encriptación</p>
                  <p className="text-primary-container font-mono text-[10px] uppercase">AES-256 ACTIVE</p>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
          <div className="w-full max-w-lg glass-card relative z-10 animate-in zoom-in-95 duration-300 p-8 border-white/10">
            <h3 className="text-white font-outfit text-2xl font-black mb-8 uppercase tracking-tighter">Modificar Perfil de Operador</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-primary-container/30 p-1 relative cursor-pointer group mb-2"
                >
                  {editData.avatar ? (
                    <img src={editData.avatar} alt="Edit" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-xl font-bold text-outline">
                      {getInitials(editData.name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">upload</span>
                  </div>
                </div>
                <p className="text-[10px] font-space text-outline uppercase tracking-widest">Cargar Nueva Imagen</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Especialización / Rol</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Número de Teléfono</label>
                  <input 
                    type="tel" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Correo Electrónico (Login ID)</label>
                  <input 
                    type="email" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                    placeholder="••••••••"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  />
                </div>

              </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <label className="text-primary-container font-space text-[9px] font-bold uppercase tracking-widest ml-1">Confirmar Contraseña Actual</label>
                  <input 
                    required
                    type="password" 
                    className={`w-full bg-primary-container/5 border ${error ? 'border-red-500' : 'border-primary-container/20'} rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all`}
                    placeholder="VERIFICAR_ACCESO"
                    value={currentPasswordInput}
                    onChange={(e) => {
                      setCurrentPasswordInput(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  {error && (
                    <p className="text-red-500 font-space text-[8px] font-bold uppercase tracking-widest mt-1 ml-1 animate-pulse">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setCurrentPasswordInput('');
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white font-space text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary font-space text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary-container/20"
                >
                  Confirmar Protocolo
                </button>
              </div>

          </div>
        </div>
      )}


      {/* Decorative Gradients */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container/5 blur-[180px]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[150px]"></div>
      </div>
    </main>
  );
}

