import React from 'react';

const SmartStrategy: React.FC = () => {
  return (
    <div className="glass-card p-6 h-full relative overflow-hidden group">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-primary-container/20 transition-all"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-white">auto_awesome</span>
        </div>
        <div>
          <h4 className="text-white font-outfit font-bold">NEXUS IA: Smart Strategy</h4>
          <p className="text-outline text-xs font-space uppercase tracking-widest">Detección de Nichos & Tendencias</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary-container/30 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-primary-container text-[10px] font-bold font-space uppercase tracking-widest">Alerta de Oportunidad</span>
            <span className="text-[10px] text-green-400 font-bold">+24% Demanda</span>
          </div>
          <h5 className="text-white text-sm font-bold mb-1">Nicho: Apps de Salud Mental (B2C)</h5>
          <p className="text-outline text-xs leading-relaxed">
            El sistema ha detectado un incremento en leads buscando soluciones de bienestar. Tu stack React Native / Spring Boot es ideal para este sector.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-secondary-container/30 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-secondary-container text-[10px] font-bold font-space uppercase tracking-widest">Plan de Acción Sugerido</span>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-secondary-container">check_circle</span>
              <span>Actualizar Portfolio con "Quantum Wellness Case Study"</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-secondary-container">check_circle</span>
              <span>Lanzar campaña en LinkedIn dirigida a Startups HealthTech</span>
            </li>
          </ul>
        </div>
      </div>

      <button className="mt-6 w-full py-3 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <span>Implementar Estrategia</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
};

export default SmartStrategy;
