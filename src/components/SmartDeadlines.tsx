import React, { useState } from 'react';

const SmartDeadlines: React.FC = () => {
  const [deepWork, setDeepWork] = useState(false);

  return (
    <div className={`glass-card p-6 h-full transition-all duration-500 ${deepWork ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${deepWork ? 'bg-red-500/20' : 'bg-surface-container'}`}>
            <span className={`material-symbols-outlined ${deepWork ? 'text-red-400' : 'text-outline'}`}>
              {deepWork ? 'emergency_home' : 'schedule'}
            </span>
          </div>
          <div>
            <h4 className="text-white font-outfit font-bold">Smart Deadlines</h4>
            <p className="text-outline text-[10px] font-space uppercase tracking-widest">Plan de Eficiencia & Deep Work</p>
          </div>
        </div>
        
        <button 
          onClick={() => setDeepWork(!deepWork)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold font-space uppercase transition-all ${
            deepWork 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-white/5 text-outline hover:bg-white/10'
          }`}
        >
          {deepWork ? 'MODO CRÍTICO ACTIVO' : 'ACTIVAR DEEP WORK'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="relative pl-6 border-l border-white/10">
          <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="flex justify-between items-start mb-1">
            <h5 className="text-white text-xs font-bold">Fintech Dashboard v2.0</h5>
            <span className="text-red-400 text-[10px] font-bold">HOY 18:00</span>
          </div>
          <p className="text-outline text-[10px] mb-3">QA Final & Despliegue Producción</p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 animate-pulse" style={{ width: '92%' }}></div>
          </div>
        </div>

        <div className="relative pl-6 border-l border-white/10">
          <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="flex justify-between items-start mb-1">
            <h5 className="text-white text-xs font-bold">Backend Refactoring</h5>
            <span className="text-yellow-400 text-[10px] font-bold">MAÑANA</span>
          </div>
          <p className="text-outline text-[10px] mb-3">Optimización de Consultas SQL</p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400" style={{ width: '45%' }}></div>
          </div>
        </div>

        {deepWork && (
          <div className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20 animate-in fade-in slide-in-from-bottom-2">
            <h6 className="text-red-400 text-[10px] font-bold font-space uppercase mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bolt</span>
              NEXUS RE-ORGANIZACIÓN
            </h6>
            <p className="text-white/80 text-xs leading-relaxed">
              Prioridad absoluta a Fintech Dashboard. Notificaciones silenciadas. Bloque de 4 horas detectado para finalización.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDeadlines;
