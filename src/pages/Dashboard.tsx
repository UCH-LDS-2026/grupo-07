

interface DashboardProps {
  projects: any[];
  currency: string;
}

export default function Dashboard({ projects, currency }: DashboardProps) {
  const activeProjectsCount = projects.length;
  const totalIncome = projects.reduce((acc, p) => acc + (p.paid || 0), 0);
  
  const dynamicStats = [
    { label: 'INGRESOS', value: `${currency}${totalIncome.toLocaleString()}`, change: totalIncome > 0 ? '+100%' : '0%', subtext: 'basado en abonos', icon: 'trending_up', color: 'text-green-500' },
    { label: 'GASTOS', value: `${currency}0.00`, change: '0%', subtext: 'esperando datos', icon: 'account_balance_wallet', color: 'text-red-400' },
    { label: 'PROYECTOS', value: activeProjectsCount.toString(), change: activeProjectsCount > 0 ? '+100%' : '0%', subtext: 'activos en terminal', icon: 'rocket_launch', color: 'text-primary-container' },
  ];

  const averageProgress = activeProjectsCount > 0 
    ? projects.reduce((acc, p) => acc + (p.progress || 0), 0) / activeProjectsCount 
    : 0;

  const nexusScore = activeProjectsCount === 0 
    ? 0 
    : Math.min(99, Math.round(40 + (activeProjectsCount * 5) + (averageProgress * 0.3)));
  
  const scoreOffset = 364 - (364 * nexusScore / 100);

  const baseForecast = Math.min(100, activeProjectsCount * 12 + (totalIncome > 0 ? 10 : 0));
  const forecastData = activeProjectsCount === 0 
    ? [0, 0, 0, 0, 0, 0, 0] 
    : [
        baseForecast * 0.4, 
        baseForecast * 0.65, 
        baseForecast * 0.45, 
        baseForecast * 0.9, 
        baseForecast * 0.55, 
        baseForecast * 0.75, 
        baseForecast * 0.85
      ];

  const activityLevel = Math.min(100, activeProjectsCount * 15);
  const amp = activityLevel * 0.5;
  const baseLine = 90 - (activityLevel * 0.4);
  
  const pathData = activeProjectsCount === 0
    ? `M 0 95 L 400 95`
    : `M 0 ${baseLine} Q 50 ${baseLine - amp}, 100 ${baseLine} T 200 ${baseLine} T 300 ${baseLine - amp * 0.8} T 400 ${baseLine - amp * 0.5}`;
  
  const fillPathData = activeProjectsCount === 0
    ? `M 0 95 L 400 95 L 400 100 L 0 100 Z`
    : `${pathData} L 400 100 L 0 100 Z`;

  const volatility = activeProjectsCount === 0 ? "NULA [0%]" : `MEDIA [${(activeProjectsCount * 1.2).toFixed(1)}%]`;
  const trend = activeProjectsCount === 0 ? "FLAT" : "BULLISH";



  return (
    <main className="ml-64 min-h-screen p-8 lg:p-12 relative overflow-hidden bg-[#05070a]">
      <div className="scanline-overlay"></div>

      {/* Header HUD */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
        <div>
          <h1 className="text-white font-outfit text-4xl font-extrabold tracking-tighter">
            NEXUS Analíticas / <span className="text-primary-container">IA Smart</span>
          </h1>
          <p className="text-outline font-space text-[10px] uppercase tracking-[0.2em] mt-2">
            MÓDULO DE PREDICCIÓN AVANZADA [NEXUS]
          </p>
        </div>
        

      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        {dynamicStats.map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-outline font-space text-[10px] uppercase tracking-widest">{stat.label}</span>
              <span className={`material-symbols-outlined ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}>{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-white font-outfit mb-1">{stat.value}</div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold font-space ${stat.color}`}>{stat.change}</span>
              <span className="text-outline text-[9px] font-space uppercase">{stat.subtext}</span>
            </div>
          </div>
        ))}
        
        {/* Balance Neto (Special Card) */}
        <div className="glass-card p-6 bg-gradient-to-br from-primary-container/20 to-secondary-container/20 border-primary-container/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
             <span className="material-symbols-outlined text-6xl text-primary-container">auto_awesome</span>
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-white font-space text-[10px] uppercase tracking-widest">BALANCE NETO</span>
            <span className="material-symbols-outlined text-white opacity-50">insights</span>
          </div>
          <div className="text-2xl font-bold text-white font-outfit mb-1">{currency}{totalIncome.toLocaleString()}</div>

          <div className="text-[9px] font-space text-primary-container font-bold uppercase tracking-widest">Optimizado por NEXUS AI</div>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i < 5 ? 'bg-primary-container' : 'bg-white/10'}`}></div>)}
          </div>
        </div>
      </section>

      {/* Middle Row: Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative z-10">
        {/* Bar Chart Section */}
        <div className="glass-card p-8 lg:col-span-1 border-white/5">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-white font-outfit font-bold uppercase tracking-widest text-xs">Pronóstico de Ingresos</h3>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2 px-2">
            {forecastData.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className="w-full bg-gradient-to-t from-primary-container/20 to-primary-container rounded-t-sm group-hover:brightness-125 transition-all duration-500" 
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[8px] font-space text-outline uppercase">{['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Activity Chart */}
        <div className="glass-card p-8 lg:col-span-1 border-white/5">
           <h3 className="text-white font-outfit font-bold uppercase tracking-widest text-xs mb-10">Actividad de Mercado</h3>
           <div className="h-40 relative">
             <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
               <path 
                d={pathData} 
                fill="none" 
                stroke="var(--primary-container)" 
                strokeWidth="3" 
                className="drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all duration-1000"
               />
               <path 
                d={fillPathData} 
                fill="url(#grad)" 
                className="opacity-20 transition-all duration-1000"
               />
               <defs>
                 <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                   <stop offset="0%" style={{ stopColor: 'var(--primary-container)', stopOpacity: 1 }} />
                   <stop offset="100%" style={{ stopColor: 'var(--primary-container)', stopOpacity: 0 }} />
                 </linearGradient>
               </defs>
             </svg>
             <div className="absolute w-3 h-3 rounded-full bg-primary-container shadow-[0_0_10px_rgba(0,240,255,1)] transition-all duration-1000" style={{ top: `${activeProjectsCount === 0 ? 95 : baseLine - amp * 0.8}%`, left: '75%', transform: 'translate(-50%, -50%)' }}></div>
           </div>
           <div className="mt-6 flex justify-between">
             <div>
                <p className="text-[9px] text-outline font-space uppercase">Volatilidad</p>
                <p className="text-white text-xs font-bold font-space uppercase">{volatility}</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] text-outline font-space uppercase">Tendencia</p>
                <p className="text-primary-container text-xs font-bold font-space uppercase">{trend}</p>
             </div>
           </div>
        </div>

        {/* AI Score */}
        <div className="glass-card p-8 lg:col-span-1 border-white/5 flex flex-col items-center justify-center text-center">
          <h3 className="text-white font-outfit font-bold uppercase tracking-widest text-xs mb-8">Puntuación Nexus IA</h3>
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={scoreOffset} className="text-primary-container drop-shadow-[0_0_5px_rgba(0,240,255,0.8)] transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-outfit">{nexusScore}%</span>
              <span className="text-[8px] font-space text-primary-container font-bold">{nexusScore > 0 ? 'OPTIMIZADO' : 'ESPERANDO'}</span>
            </div>
          </div>
          <p className="text-[9px] text-outline font-space uppercase leading-relaxed max-w-[180px]">
            Predicción de éxito basada en 4.2k variables de mercado.
          </p>
        </div>
      </section>

      {/* Live Projects Table */}
      <section className="glass-card overflow-hidden relative z-10 border-white/5">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <h3 className="font-outfit text-xl text-white font-bold tracking-tight uppercase">Monitor de Proyectos Live</h3>
            <span className="px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container text-[8px] font-bold font-space uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              IA Analysis Active
            </span>
          </div>
          <div className="flex items-center gap-4 text-outline">
            <span className="material-symbols-outlined text-lg cursor-pointer hover:text-white transition-colors">filter_list</span>
            <span className="material-symbols-outlined text-lg cursor-pointer hover:text-white transition-colors">more_vert</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-outline font-space text-[9px] uppercase tracking-widest bg-white/[0.02]">
              <tr>
                <th className="px-8 py-5 font-medium">NOMBRE DEL PROYECTO</th>
                <th className="px-8 py-5 font-medium">LÍDER / AI ASSIGN</th>
                <th className="px-8 py-5 font-medium">PROGRESO OBJETIVO</th>
                <th className="px-8 py-5 font-medium">ESTADO</th>
                <th className="px-8 py-5 font-medium">ROI ESTIMADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-outline font-space text-[10px] uppercase tracking-[0.4em]">
                    Sin actividad de proyectos detectada
                  </td>
                </tr>
              ) : (
                projects.map((project, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary-container group-hover:scale-110 transition-transform">{project.icon}</span>
                        </div>
                        <span className="text-white font-bold text-sm font-outfit uppercase tracking-tighter">{project.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-on-surface-variant font-space text-[10px] font-bold uppercase">{project.client}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 w-64">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-container" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-space text-outline w-24">{project.progress}% completado</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-lg border text-[9px] font-bold font-space uppercase ${
                        project.status === 'FINALIZADO' 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-primary-container/10 border-primary-container/30 text-primary-container'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-white font-bold font-space text-sm">{currency}0.00</span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </section>

      {/* Decorative Gradients */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container/5 blur-[180px]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[150px]"></div>
      </div>
    </main>
  );
}
