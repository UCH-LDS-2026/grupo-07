import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        onLogin(profile || { name: formData.email.split('@')[0], email: formData.email });
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
          setError('Registro exitoso. Revisa tu email para confirmar la cuenta (si el correo de confirmación está activado).');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error en el protocolo de acceso.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-container/5 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="scanline-overlay"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary-container/30 mb-6 neon-glow-cyan">
            <span className="material-symbols-outlined text-primary-container text-4xl">terminal</span>
          </div>
          <h1 className="text-white font-outfit text-4xl font-black tracking-tighter mb-2 uppercase">
            NEXUS<span className="text-primary-container">SGE</span>
          </h1>
          <p className="text-outline font-space text-[10px] uppercase tracking-[0.4em]">Operational OS v1.0.4</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-container/50"></div>
          
          <div className="flex gap-4 mb-8 p-1 bg-white/[0.03] rounded-xl border border-white/10">
            <button 
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-lg font-space text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'signin' ? 'bg-primary-container text-on-primary' : 'text-outline hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg font-space text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-primary-container text-on-primary' : 'text-outline hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
              <span className="material-symbols-outlined text-error text-lg">warning</span>
              <p className="text-error font-space text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-5">
            {mode === 'signup' && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Nombre Completo</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center text-outline group-focus-within:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-lg">badge</span>
                    </span>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
                      placeholder="OPERATOR_NAME"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
                  <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Número de Teléfono</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center text-outline group-focus-within:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-lg">call</span>
                    </span>
                    <input 
                      required
                      type="tel" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
                      placeholder="+34 000 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}


            <div className="space-y-2">
              <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-3 flex items-center text-outline group-focus-within:text-primary-container transition-colors">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </span>
                <input 
                  required
                  type="email" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
                  placeholder="EMAIL_ADDRESS"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-outline font-space text-[10px] uppercase tracking-widest ml-1">Protocolo de Acceso</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-3 flex items-center text-outline group-focus-within:text-primary-container transition-colors">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </span>
                <input 
                  required
                  type="password" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-primary-container focus:ring-0 transition-all outline-none font-space"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-space font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 relative overflow-hidden mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                  PROCESANDO...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">{mode === 'signin' ? 'login' : 'how_to_reg'}</span>
                  {mode === 'signin' ? 'INICIAR SECUENCIA' : 'REGISTRAR OPERADOR'}
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] text-outline font-space uppercase">
            <span>Encriptación AES-256</span>
            <span className="opacity-40">NEXUS_SECURITY_ACTIVE</span>
          </div>
        </form>

        <p className="text-center mt-8 text-outline/30 font-space text-[9px] uppercase tracking-widest">
          Authorized personnel only. All access attempts are logged.
        </p>
      </div>
    </div>
  );
};


export default Login;
