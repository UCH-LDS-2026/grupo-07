import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Copy, Check, Trash2, Plus, Github, Linkedin, Instagram } from 'lucide-react';

interface ProfileProps {
  user: { 
    name: string, 
    role: string, 
    email: string, 
    phone: string, 
    avatar?: string, 
    password?: string,
    github_user?: string,
    linkedin_user?: string,
    instagram_user?: string
  };
  onUpdateUser: (data: any) => void;
  activeProjectsCount: number;
  onLogout: () => void;
}

// Subcomponente de Billetera/Credencial
const AssetCard = ({ asset, onDelete }: { asset: any, onDelete: (id: string) => void }) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(asset.id);
    setIsDeleting(false);
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group flex items-center justify-between">
      <div className="overflow-hidden pr-4 flex-1">
        <p className="text-[10px] text-outline uppercase tracking-widest mb-1 truncate">{asset.name} ({asset.type})</p>
        <p className="text-white font-mono text-sm tracking-wider truncate">
          {asset.value}
        </p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={handleCopy}
          className="shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
          title="Copiar al portapapeles"
        >
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          title="Eliminar credencial"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// Subcomponente Universal de Redes con Copiado
const NetworkCard = ({ icon: Icon, name, urlBase, username, colorClass }: { icon: any, name: string, urlBase: string, username?: string, colorClass: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!username) return;
    navigator.clipboard.writeText(`${urlBase}${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!username) {
    return (
      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between opacity-40 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <div className="text-white/50"><Icon size={20} /></div>
          <div>
            <p className="text-[10px] font-space font-bold uppercase tracking-widest">{name}</p>
            <p className="text-[9px] uppercase tracking-widest text-white/30">No configurado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group flex items-center justify-between ${colorClass}`}>
      <div className="flex items-center gap-3 overflow-hidden pr-4 flex-1">
        <div className="opacity-80 group-hover:opacity-100 transition-opacity"><Icon size={20} /></div>
        <div className="overflow-hidden w-full">
          <p className="text-[10px] font-space font-bold uppercase tracking-widest mb-1 truncate">{name}</p>
          <a href={`${urlBase}${username}`} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white font-mono text-xs tracking-wider truncate block transition-colors">
            {urlBase.replace('https://', '')}{username}
          </a>
        </div>
      </div>
      <button 
        onClick={handleCopy}
        className="shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 active:scale-95 transition-all group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        title="Copiar enlace completo"
      >
        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
      </button>
    </div>
  );
};

export default function Profile({ user, onUpdateUser, activeProjectsCount, onLogout }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileProps['user']>({ ...user });
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [error, setError] = useState('');

  // TABS STATE
  const [activeTab, setActiveTab] = useState<'wallets' | 'networks'>('wallets');

  // Estados de cuentas/wallets
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  
  // Estado para modal de nueva cuenta
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: '', value: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      setLoadingAssets(false);
      return;
    }

    const { data, error } = await supabase
      .from('operator_assets')
      .select('*')
      .eq('operator_id', currentUserId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAssets(data);
    }
    setLoadingAssets(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'OP';
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

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      setError('ERROR: No hay sesión activa para actualizar.');
      return;
    }

    // 1. COMPORTAMIENTO PRINCIPAL: Actualizar tabla 'profiles' pública
    const { error: dataError } = await supabase
      .from('profiles')
      .update({
        name: editData.name,
        role: editData.role,
        phone: editData.phone,
        avatar_url: editData.avatar,
        github_user: editData.github_user,
        linkedin_user: editData.linkedin_user,
        instagram_user: editData.instagram_user
      })
      .eq('id', currentUserId);

    if (dataError) {
      setError(`ERROR: No se pudieron actualizar los datos (${dataError.message})`);
      return;
    }

    // 2. ACTUALIZACIÓN REACTIVA (UI Inmediata)
    onUpdateUser({
      ...user,
      name: editData.name,
      role: editData.role,
      phone: editData.phone,
      avatar: editData.avatar,
      github_user: editData.github_user,
      linkedin_user: editData.linkedin_user,
      instagram_user: editData.instagram_user
    });

    // 3. CONDICIONAL DE SEGURIDAD (PASSWORD)
    if (editData.password && editData.password.trim() !== '') {
      if (currentPasswordInput !== user.password) {
        setError('VERIFICACIÓN FALLIDA: Contraseña actual incorrecta.');
        return;
      }
      
      const { error: passwordError } = await supabase.auth.updateUser({ 
        password: editData.password 
      });

      if (passwordError) {
        setError(`ERROR: No se pudo actualizar la contraseña (${passwordError.message})`);
        return;
      }
    }

    setIsEditing(false);
    setCurrentPasswordInput('');
    setError('');
  };

  const handleAddAsset = async () => {
    if (!newAsset.name || !newAsset.type || !newAsset.value) return;

    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    setLoadingAssets(true);
    const { error } = await supabase.from('operator_assets').insert([{
      operator_id: currentUserId,
      name: newAsset.name,
      type: newAsset.type,
      value: newAsset.value
    }]);

    if (!error) {
      setIsAddingAsset(false);
      setNewAsset({ name: '', type: '', value: '' });
      await fetchAssets();
    } else {
      console.error("Error adding asset:", error);
      setLoadingAssets(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    const { error } = await supabase.from('operator_assets').delete().eq('id', id);
    if (!error) {
      setAssets(assets.filter(a => a.id !== id));
    } else {
      console.error("Error deleting asset:", error);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-12 relative overflow-hidden bg-[#05070a]">
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
          <p className="text-outline font-space text-[10px] uppercase tracking-[0.2em]">ID: {(user.name || '').toUpperCase().replace(/\s+/g, '-')}</p>
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
                  <span className="text-white font-bold tracking-widest text-right">{user.phone || 'No configurado'}</span>
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
        </div>

        {/* Right Col: OPERATOR_CREDENTIALS */}
        <div className="lg:col-span-2 flex flex-col h-full space-y-6">
          
          {/* Security Bar Minimalista */}
          <div className="glass-card p-4 px-6 border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">shield_person</span>
              <span className="text-white font-space text-[10px] font-bold uppercase tracking-widest">Protocolos de Seguridad</span>
            </div>
            <div className="flex gap-6">
              <div className="text-left sm:text-right">
                <p className="text-[8px] text-outline uppercase tracking-widest mb-1">Último Acceso</p>
                <p className="text-white font-mono text-[10px]">19:21:10 UTC</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[8px] text-outline uppercase tracking-widest mb-1">Encriptación</p>
                <p className="text-primary-container font-mono text-[10px]">AES-256 ACTIVE</p>
              </div>
            </div>
          </div>

          {/* MAIN CREDENTIALS CENTER */}
          <div className="glass-card border-white/5 flex flex-col flex-1 relative overflow-hidden">
            
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 bg-white/[0.01]">
              <button
                onClick={() => setActiveTab('wallets')}
                className={`flex-1 py-4 text-[10px] font-space font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'wallets' 
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' 
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
                }`}
              >
                Billeteras & Cobros
              </button>
              <button
                onClick={() => setActiveTab('networks')}
                className={`flex-1 py-4 text-[10px] font-space font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'networks' 
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5' 
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
                }`}
              >
                Redes & Protocolos
              </button>
            </div>

            {/* TAB CONTENT: WALLETS */}
            {activeTab === 'wallets' && (
              <div className="p-8 flex flex-col flex-1 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-white font-outfit text-xl font-bold uppercase tracking-tighter flex items-center gap-3">
                    <span className="material-symbols-outlined text-cyan-400">account_balance_wallet</span> 
                    Directorio de Cobros
                  </h3>
                  
                  {!isAddingAsset && (
                    <button 
                      onClick={() => setIsAddingAsset(true)}
                      className="flex items-center gap-2 py-2 px-4 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-space text-[9px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 hover:scale-105 transition-all"
                    >
                      <Plus size={14} /> Añadir Credencial
                    </button>
                  )}
                </div>
                
                {isAddingAsset && (
                  <div className="mb-8 p-6 bg-white/[0.02] border border-cyan-500/30 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="text-[10px] text-cyan-400 font-space uppercase tracking-widest mb-4">Nueva Credencial de Cobro</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input 
                        type="text" 
                        placeholder="Nombre (Ej. Mercado Pago)"
                        className="w-full bg-[#05070a] border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                        value={newAsset.name}
                        onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Tipo (Ej. ARS, USDT)"
                        className="w-full bg-[#05070a] border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                        value={newAsset.type}
                        onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Valor (CVU, Alias, Wallet)"
                        className="w-full bg-[#05070a] border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                        value={newAsset.value}
                        onChange={e => setNewAsset({ ...newAsset, value: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => setIsAddingAsset(false)}
                        className="py-2 px-4 rounded-lg border border-white/10 text-white/50 text-[10px] uppercase font-space tracking-widest hover:bg-white/5 hover:text-white transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleAddAsset}
                        disabled={!newAsset.name || !newAsset.type || !newAsset.value}
                        className="py-2 px-6 rounded-lg bg-cyan-500 text-[#05070a] font-bold text-[10px] uppercase font-space tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  {loadingAssets ? (
                    <div className="h-full w-full flex items-center justify-center p-12">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="p-12 text-center bg-white/[0.01] border border-white/5 rounded-2xl border-dashed h-full flex flex-col items-center justify-center gap-6">
                      <span className="material-symbols-outlined text-white/20 text-5xl">account_balance</span>
                      <div>
                        <p className="text-white font-bold tracking-widest uppercase text-sm mb-2">No hay cuentas vinculadas</p>
                        <p className="text-outline font-space text-[10px] uppercase tracking-widest max-w-sm mx-auto">Añade credenciales operativas (bancos, wallets, crypto) para tener acceso rápido en tu portapapeles.</p>
                      </div>
                      {!isAddingAsset && (
                        <button 
                          onClick={() => setIsAddingAsset(true)}
                          className="py-3 px-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-space text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-[#05070a] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all mt-4"
                        >
                          [+] AÑADIR CREDENCIAL DE COBRO
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {assets.map(asset => (
                        <AssetCard key={asset.id} asset={asset} onDelete={handleDeleteAsset} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: NETWORKS */}
            {activeTab === 'networks' && (
              <div className="p-8 flex flex-col flex-1 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-white font-outfit text-xl font-bold uppercase tracking-tighter flex items-center gap-3">
                    <span className="material-symbols-outlined text-purple-400">hub</span> 
                    Perfiles Digitales
                  </h3>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-space text-[9px] font-bold uppercase tracking-widest hover:bg-purple-500/20 hover:scale-105 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span> Configurar Redes
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NetworkCard 
                    icon={Github} 
                    name="GitHub Protocol" 
                    urlBase="https://github.com/" 
                    username={user.github_user}
                    colorClass="hover:border-white/40 text-white"
                  />
                  <NetworkCard 
                    icon={Linkedin} 
                    name="LinkedIn Sync" 
                    urlBase="https://linkedin.com/in/" 
                    username={user.linkedin_user}
                    colorClass="hover:border-blue-500/40 text-blue-400"
                  />
                  <NetworkCard 
                    icon={Instagram} 
                    name="Instagram Connect" 
                    urlBase="https://instagram.com/" 
                    username={user.instagram_user}
                    colorClass="hover:border-pink-500/40 text-pink-400"
                  />
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-card relative z-10 animate-in zoom-in-95 duration-300 p-8 border-white/10">
            <h3 className="text-white font-outfit text-2xl font-black mb-8 uppercase tracking-tighter">Modificar Perfil de Operador</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-primary-container/30 p-1 relative cursor-pointer group mb-2"
                >
                  {editData.avatar ? (
                    <img src={editData.avatar} alt="Edit" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-xl font-bold text-outline">
                      {getInitials(editData.name || '')}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos Básicos */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">Información Base</h4>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Especialización / Rol</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                      value={editData.role || ''}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Número de Teléfono</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Correo Electrónico (Login ID)</label>
                    <input 
                      type="email" 
                      readOnly
                      className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 text-white/50 text-sm outline-none cursor-not-allowed"
                      value={editData.email || ''}
                    />
                    <p className="text-[8px] text-outline ml-1">El email no puede modificarse aquí.</p>
                  </div>
                </div>

                {/* Redes y Seguridad */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest border-b border-white/10 pb-2">Redes Neurales (Opcional)</h4>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1 flex items-center gap-2">
                      <span className="text-[12px]"><Github size={12} /></span> Usuario de GitHub
                    </label>
                    <input 
                      type="text" 
                      placeholder="ej: octocat"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-all font-mono"
                      value={editData.github_user || ''}
                      onChange={(e) => setEditData({ ...editData, github_user: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1 flex items-center gap-2">
                      <span className="text-[12px]"><Linkedin size={12} /></span> Usuario de LinkedIn
                    </label>
                    <input 
                      type="text" 
                      placeholder="ej: john-doe"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-all font-mono"
                      value={editData.linkedin_user || ''}
                      onChange={(e) => setEditData({ ...editData, linkedin_user: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1 flex items-center gap-2">
                      <span className="text-[12px]"><Instagram size={12} /></span> Usuario de Instagram
                    </label>
                    <input 
                      type="text" 
                      placeholder="ej: thejohndoe"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-all font-mono"
                      value={editData.instagram_user || ''}
                      onChange={(e) => setEditData({ ...editData, instagram_user: e.target.value })}
                    />
                  </div>

                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest border-b border-white/10 pb-2 mt-6">Credenciales de Acceso</h4>
                  <div className="space-y-2">
                    <label className="text-outline font-space text-[9px] uppercase tracking-widest ml-1">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all"
                      placeholder="Dejar vacío para no cambiar"
                      value={editData.password || ''}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-primary-container font-space text-[9px] font-bold uppercase tracking-widest ml-1">Confirmar Contraseña Actual</label>
                    <input 
                      type="password" 
                      className={`w-full bg-primary-container/5 border ${error ? 'border-red-500' : 'border-primary-container/20'} rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-container transition-all`}
                      placeholder="Solo si cambias contraseña"
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
              </div>

              <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setCurrentPasswordInput('');
                  }}
                  className="flex-1 py-4 rounded-xl border border-white/10 text-white font-space text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 rounded-xl bg-primary-container text-on-primary font-space text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary-container/20"
                >
                  Confirmar Protocolo
                </button>
              </div>

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
