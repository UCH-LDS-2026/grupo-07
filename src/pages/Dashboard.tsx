import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiActivity, FiCpu, FiArrowUpRight, FiLayers
} from 'react-icons/fi';
import { Terminal as TerminalIcon, CheckSquare, Check, ExternalLink, Settings, Trash2, Github, FolderOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import LanguageSelector from '../components/LanguageSelector';

interface DashboardProps {
  currency?: string;
  currencyCode?: string;
  dolarRate?: number;
  dolarLoading?: boolean;
  dolarError?: string | null;
  projects?: any[];
  expenses?: any[];
}

export default function Dashboard({ currency = 'US$', currencyCode = 'USD', dolarRate = 1, dolarLoading = false, dolarError = null }: DashboardProps) {
  const { t } = useTranslation();

  const [projectCount, setProjectCount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [realLogs, setRealLogs] = useState<any[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  
  // Tasks CRUD
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Operational Links
  const [opLinks, setOpLinks] = useState<any[]>([]);
  const [isManagingLinks, setIsManagingLinks] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'drive' });
  const [isLinkLoading, setIsLinkLoading] = useState(false);

  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  useEffect(() => {
    const initFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;
      setUserId(currentUserId);

      if (!currentUserId) return;

      try {
        // 1. Conteo real de proyectos
        const { count: countProjects } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('operator_id', currentUserId);
        setProjectCount(countProjects || 0);

        // 2. Suma real de facturas pagadas (Ingresos) y Mapeo del Gráfico
        const { data: userInvoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('amount, created_at')
          .eq('status', 'paid');
          
        if (invoicesError) {
          console.error("Error fetching invoices:", invoicesError.message);
        }
        
        let sumPaid = 0;
        const monthlyData = monthKeys.map(k => ({
          monthKey: `dashboard.months.${k}`,
          ingresos: 0
        }));

        userInvoices?.forEach(inv => {
          const amount = Number(inv.amount) || 0;
          sumPaid += amount;

          if (inv.created_at) {
            const date = new Date(inv.created_at);
            const monthIndex = date.getMonth();
            monthlyData[monthIndex].ingresos += amount;
          }
        });

        const currentMonth = new Date().getMonth();
        const dynamicLineData = monthlyData.slice(0, currentMonth + 1);

        setTotalPaid(sumPaid);
        setLineData(dynamicLineData);

        // 3. Suma real de gastos
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('amount')
          .eq('operator_id', currentUserId);
        const sumExpenses = expensesData?.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0) || 0;
        setTotalExpenses(sumExpenses);

        // 4. Terminal logs
        const { data: recentInvoices } = await supabase
          .from('invoices')
          .select('invoice_number, amount, status')
          .order('created_at', { ascending: false })
          .limit(3);

        const logsBase = [
          ...(recentInvoices || []).map(inv => ({
            timeKey: 'dashboard.terminal.invoice',
            type: inv.status === 'paid' ? 'SUCCESS' : 'PENDING',
            invoiceNumber: inv.invoice_number,
            amount: inv.amount,
            color: inv.status === 'paid' ? 'text-green-400' : 'text-amber-400'
          }))
        ];
        setRealLogs(logsBase);

        // 5. Tasks & Links
        fetchTasks(currentUserId);
        fetchOpLinks(currentUserId);

      } catch (err) {
        console.error("Error al poblar las métricas del dashboard:", err);
      }
    };

    initFetch();
  }, [currency]);

  useEffect(() => {
    if (realLogs.length === 0 && projectCount === 0) return; // Esperar data real
    if (dolarLoading) return; // Esperar a que la cotización termine de cargar

    const baseSequence = [
      { time: 'SYS', type: 'INIT', msg: 'Iniciando módulo Emma-Nexus...', color: 'text-white/50', delay: 300 },
      { time: 'SYS', type: 'STATUS', msg: 'Sincronización con base de datos Supabase ok.', color: 'text-green-400', delay: 1000 },
      { time: 'SYS', type: 'AUTH', msg: 'Operador EMMANUEL BUSTOS en línea.', color: 'text-cyan-400', delay: 1800 },
    ];

    if (dolarError) {
      baseSequence.push({
        time: 'SYS', type: 'NEXUS_WARNING', msg: 'Error de red en servidor de divisas. Utilizando cotización de contingencia interna ($1400).', color: 'text-amber-400', delay: 2300
      });
    } else {
      baseSequence.push({
        time: 'SYS', type: 'NEXUS_DIVISA', msg: `Enlace exitoso. Cotización Dólar Blue sincronizada en tiempo real: $${dolarRate}`, color: 'text-green-400', delay: 2300
      });
    }

    const sequence = [
      ...baseSequence,
      ...realLogs.map((l, i) => ({ ...l, delay: 2800 + i * 400 }))
    ];

    setTerminalLogs([]);

    const timeouts = sequence.map(item => 
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, item]);
      }, item.delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [realLogs, projectCount, dolarLoading, dolarError, dolarRate]);

  // LOG DE CONFIRMACIÓN DE IDIOMA EN TERMINAL
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    if (i18n.language !== currentLang && terminalLogs.length > 0) {
      setCurrentLang(i18n.language);
      const langName = i18n.language === 'en' ? 'ENGLISH' : 'ESPAÑOL';
      const msg = i18n.language === 'en' 
        ? `Language core set to: ${langName}` 
        : `Idioma configurado en: ${langName}`;

      setTerminalLogs(prev => [
        ...prev,
        { time: 'SYS', type: 'NEXUS_SYSTEM', msg, color: 'text-blue-400' }
      ]);
    } else if (i18n.language !== currentLang) {
      // Si la terminal no estaba lista, igual actualizamos el estado para no desfasarnos
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, currentLang, terminalLogs.length]);

  const fetchTasks = async (uid: string) => {
    const { data: tasksData, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('operator_id', uid)
      .order('created_at', { ascending: true });
    
    if (!error && tasksData) {
      setTasks(tasksData);
    }
  };

  const fetchOpLinks = async (uid: string) => {
    const { data, error } = await supabase
      .from('operator_links')
      .select('*')
      .eq('operator_id', uid)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setOpLinks(data);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url || !userId) return;
    setIsLinkLoading(true);
    const { error } = await supabase.from('operator_links').insert([{
      operator_id: userId,
      title: newLink.title,
      url: newLink.url,
      icon: newLink.icon
    }]);
    if (!error) {
      setIsManagingLinks(false);
      setNewLink({ title: '', url: '', icon: 'drive' });
      await fetchOpLinks(userId);
    } else {
      console.error("Error adding link:", error);
    }
    setIsLinkLoading(false);
  };

  const getLinkIcon = (iconType: string) => {
    switch (iconType) {
      case 'github': return <Github size={14} className="shrink-0" />;
      case 'drive': return <FolderOpen size={14} className="shrink-0" />;
      default: return <ExternalLink size={14} className="shrink-0" />;
    }
  };

  const getLinkColor = (iconType: string) => {
    switch (iconType) {
      case 'github': return { text: 'text-cyan-400', hover: 'hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20', border: 'border-cyan-500/20' };
      case 'drive': return { text: 'text-green-400', hover: 'hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20', border: 'border-green-500/20' };
      default: return { text: 'text-white/60', hover: 'hover:text-white hover:bg-white/10 hover:border-white/20', border: 'border-white/20' };
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('operator_links').delete().eq('id', id);
    if (!error) {
      await fetchOpLinks(userId);
    } else {
      console.error("Error deleting link:", error);
    }
  };

  const handleAddTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskText.trim() !== '' && userId) {
      setIsTaskLoading(true);
      try {
        const { error } = await supabase.from('tasks').insert([
          {
            text: newTaskText.trim(),
            done: false,
            operator_id: userId
          }
        ]);
        
        if (!error) {
          setNewTaskText("");
          await fetchTasks(userId);
        } else {
          console.error("Error inserting task:", error);
        }
      } finally {
        setIsTaskLoading(false);
      }
    }
  };

  const toggleTask = async (task: any) => {
    if (!userId) return;
    
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    
    const { error } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', task.id);

    if (error) {
      console.error("Error updating task:", error);
      await fetchTasks(userId);
    }
  };

  // -- CONVERSIÓN DINÁMICA EN TIEMPO REAL --
  /** Convierte un valor USD a la divisa activa */
  const cv = (usdValue: number) => {
    if (currencyCode === 'ARS') return Math.round(usdValue * dolarRate);
    return usdValue;
  };

  const netProfit = totalPaid - totalExpenses;
  const personalSalary = netProfit > 0 ? netProfit * 0.7 : 0;
  const agencyReserve = netProfit > 0 ? netProfit * 0.3 : 0;

  /** Datos del gráfico convertidos a la divisa activa */
  const convertedLineData = useMemo(() => 
    lineData.map(d => ({
      ...d,
      name: t(d.monthKey),
      ingresos: currencyCode === 'ARS' ? Math.round(d.ingresos * dolarRate) : d.ingresos
    })),
    [lineData, currencyCode, dolarRate, t]
  );

  const pieData = [
    { name: t('dashboard.chart.salary'), value: 70, color: '#00f0ff' },
    { name: t('dashboard.chart.agencyLabel'), value: 30, color: '#cf5cff' },
  ];

  return (
    <div className="p-8 min-h-screen bg-[#05070a] text-white relative font-space transition-colors duration-500">
      <div className="scanline-overlay pointer-events-none"></div>

      {/* ---------------- CABECERA ---------------- */}
      <div className="mb-8 relative z-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white neon-text font-outfit text-left transition-colors">{t('dashboard.title')}</h1>
          <p className="text-[10px] tracking-[0.4em] text-white/40 uppercase text-left transition-colors">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
        </div>
      </div>

      {/* ---------------- KPI CARDS CONECTADAS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10 text-left">
        {[
          { label: t('dashboard.kpi.projects'), val: projectCount, isCurrency: false, icon: <FiLayers />, colorClass: 'text-cyan-400', glowClass: 'glow-hover-cyan' },
          { label: t('dashboard.kpi.income'), val: cv(totalPaid), isCurrency: true, icon: <FiArrowUpRight />, colorClass: 'text-green-400', glowClass: 'glow-hover-green' },
          { label: t('dashboard.kpi.expenses'), val: cv(totalExpenses), isCurrency: true, icon: <FiActivity />, colorClass: 'text-amber-400', glowClass: 'glow-hover-amber' },
          { label: t('dashboard.kpi.agency'), val: cv(agencyReserve), isCurrency: true, icon: <FiCpu />, colorClass: 'text-purple-400', glowClass: 'glow-hover-purple' }
        ].map((s, i) => (
          <div key={i} className={`p-4 flex items-center gap-4 glass-card rounded-2xl transition-all cursor-default ${s.glowClass}`}>
            <div className={`${s.colorClass} opacity-50`}>{s.icon}</div>
            <div>
              <p className="text-[9px] uppercase opacity-40 tracking-widest">{s.label}</p>
              <p className="text-lg font-bold font-outfit">
                {s.isCurrency ? `${currency} ${s.val.toLocaleString('es-AR', { maximumFractionDigits: 0 })}` : s.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- GRID CYBERPUNK OPERATIVO ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 relative z-10 text-left">
        
        {/* Gráfico de Flujo de Ingresos */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 min-h-[300px] flex flex-col transition-all glow-hover-cyan">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-2">
            <FiActivity className="animate-pulse" /> {t('dashboard.chart.incomeFlow')}
          </h2>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedLineData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1515', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '10px' }}
                  itemStyle={{ color: '#00f0ff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#00f0ff" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Circular Dividido */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[300px] transition-all glow-hover-purple">
           <div>
              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1 transition-colors">{t('dashboard.chart.personalBenefit')}</p>
              <h3 className="text-3xl font-black font-outfit text-white mb-4 transition-colors">
                {currency} {cv(personalSalary).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </h3>
           </div>

           <div className="flex-1 relative min-h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius="70%"
                    outerRadius="90%"
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-[10px] font-bold text-cyan-400 tracking-widest">70/30</p>
              </div>
           </div>

           <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                 <span className="flex items-center gap-2 font-bold"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> {t('dashboard.chart.salary')}</span>
                 <span className="opacity-60">{currency} {cv(personalSalary).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                 <span className="flex items-center gap-2 font-bold"><div className="w-2 h-2 rounded-full bg-purple-500"></div> {t('dashboard.chart.agencyLabel')}</span>
                 <span className="opacity-60">{currency} {cv(agencyReserve).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              </div>
           </div>
        </div>

        {/* Consola de Logs */}
        <div className="lg:col-span-8 bg-[#030507] border border-white/10 rounded-2xl p-6 min-h-[250px] font-mono flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden group transition-all glow-hover-green">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-green-400 mb-5 flex items-center gap-2 font-space">
            <TerminalIcon size={14} /> {t('dashboard.terminal.title')}
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-2 custom-scrollbar">
            {terminalLogs.map((log, i) => (
              <div key={i} className="flex gap-3 hover:bg-white/[0.02] p-1 rounded transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-white/30 shrink-0">[{log.time || t(log.timeKey)}]</span>
                <span className={`${log.color} font-bold shrink-0`}>{log.type}:</span>
                <span className="text-white/70">
                  {log.msg || `${t('dashboard.terminal.record')} ${log.invoiceNumber || 'N/A'} ${t('dashboard.terminal.by')} ${currency} ${Number(log.amount).toLocaleString('es-AR')}`}
                </span>
              </div>
            ))}
            <div className="flex gap-3 mt-4 items-center">
              <span className="text-green-500/80 font-bold">NEXUS_SYS &gt;</span>
              <span className="w-2 h-4 bg-green-500 animate-[pulse_1s_ease-in-out_infinite]"></span>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 min-h-[250px] flex flex-col transition-all glow-hover-purple">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-purple-400 mb-4 flex items-center gap-2 font-space">
            <CheckSquare size={14} /> {t('dashboard.tasks.title')}
          </h2>
          
          <div className="mb-4 relative">
            <input 
              type="text" 
              placeholder={t('dashboard.tasks.placeholder')}
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={handleAddTask}
              disabled={isTaskLoading}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            {isTaskLoading && (
              <div className="absolute right-3 top-2.5">
                <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {tasks.length > 0 ? tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task)}
                className="flex items-start gap-3 cursor-pointer group select-none"
              >
                <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-300 ${task.done ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'border-white/20 group-hover:border-purple-400/50'}`}>
                  {task.done && <Check size={12} strokeWidth={4} className="text-white" />}
                </div>
                <span className={`text-xs font-space transition-all duration-300 ${task.done ? 'line-through text-white/30 decoration-purple-500/50' : 'text-white/80 group-hover:text-white'}`}>
                  {task.text}
                </span>
              </div>
            )) : (
              <div className="text-[10px] text-white/30 text-center py-4">{t('dashboard.tasks.empty')}</div>
            )}
          </div>
        </div>

        {/* Enlaces Operativos */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-6 border-l-2 border-l-primary-container/50 relative mt-2 transition-all glow-hover-cyan">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary-container flex items-center gap-2">
              <ExternalLink size={14} /> {t('dashboard.links.title')}
            </h3>
            <button 
              onClick={() => setIsManagingLinks(!isManagingLinks)}
              className={`p-1.5 rounded-lg transition-all ${
                isManagingLinks ? 'bg-primary-container/20 text-primary-container' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <Settings size={14} />
            </button>
          </div>

          {isManagingLinks && (
            <div className="mb-5 p-4 bg-white/[0.02] border border-primary-container/20 rounded-xl animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[9px] text-primary-container font-space uppercase tracking-widest mb-3">{t('dashboard.links.addTitle')}</h4>
              
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setNewLink({ ...newLink, icon: 'github' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-space font-bold uppercase tracking-widest transition-all border ${
                    newLink.icon === 'github' 
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(0,200,255,0.1)]' 
                      : 'bg-white/[0.02] text-white/40 border-white/10 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <Github size={14} /> GitHub Repo
                </button>
                <button 
                  onClick={() => setNewLink({ ...newLink, icon: 'drive' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-space font-bold uppercase tracking-widest transition-all border ${
                    newLink.icon === 'drive' 
                      ? 'bg-green-500/15 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(0,255,100,0.1)]' 
                      : 'bg-white/[0.02] text-white/40 border-white/10 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <FolderOpen size={14} /> Google Drive
                </button>
              </div>

              <div className="space-y-3 mb-3">
                <input 
                  type="text" 
                  placeholder={newLink.icon === 'github' ? t('dashboard.links.titlePlaceholderGithub') : t('dashboard.links.titlePlaceholderDrive')}
                  className="w-full bg-[#05070a] border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-primary-container/50 border"
                  value={newLink.title}
                  onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                />
                <input 
                  type="text" 
                  placeholder={newLink.icon === 'github' ? t('dashboard.links.urlPlaceholderGithub') : t('dashboard.links.urlPlaceholderDrive')}
                  className="w-full bg-[#05070a] border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-primary-container/50 font-mono border"
                  value={newLink.url}
                  onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => { setIsManagingLinks(false); setNewLink({ title: '', url: '', icon: 'drive' }); }}
                  className="py-1.5 px-4 rounded-md border border-white/10 text-white/50 text-[9px] uppercase font-space tracking-widest hover:bg-white/5 hover:text-white transition-all"
                >
                  {t('dashboard.links.cancel')}
                </button>
                <button 
                  onClick={handleAddLink}
                  disabled={!newLink.title || !newLink.url || isLinkLoading}
                  className="py-1.5 px-4 rounded-md bg-primary-container/20 text-primary-container font-bold text-[9px] uppercase font-space tracking-widest hover:bg-primary-container hover:text-on-primary transition-all disabled:opacity-50"
                >
                  {isLinkLoading ? t('dashboard.links.saving') : t('dashboard.links.save')}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {opLinks.length > 0 ? opLinks.map(link => {
              const colors = getLinkColor(link.icon);
              return (
                <div key={link.id} className="flex items-center gap-1">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={`flex-1 flex items-center gap-2.5 text-xs text-white/60 ${colors.hover} transition-all p-3 bg-white/[0.02] rounded-lg border border-transparent truncate group`}
                  >
                    <span className={`${colors.text} transition-colors`}>{getLinkIcon(link.icon)}</span>
                    <span className="truncate group-hover:tracking-wider transition-all">{link.title}</span>
                  </a>
                  {isManagingLinks && (
                    <button 
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2.5 shrink-0 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-full text-[10px] text-white/30 text-center py-6 border border-dashed border-white/10 rounded-xl">
                {t('dashboard.links.empty')}
                <br />
                <button onClick={() => setIsManagingLinks(true)} className="mt-2 text-primary-container hover:underline font-bold">
                  {t('dashboard.links.addFirst')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- ADVISORY BANNER ---------------- */}
      <div className="glass-card border-l-4 border-l-cyan-500 p-6 bg-cyan-500/5 relative overflow-hidden z-10 text-left transition-all rounded-2xl glow-hover-cyan">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
            <FiCpu size={20} />
          </div>
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 font-space mb-1">{t('dashboard.advisory.title')}</h2>
            <p className="text-sm font-outfit text-white/80 transition-colors">
              {t('dashboard.advisory.salaryAvailable')} <span className="text-cyan-400 font-bold">{currency} {cv(personalSalary).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>. 
              {personalSalary > 1000 ? ` ${t('dashboard.advisory.healthyMargin')}` : ` ${t('dashboard.advisory.lowCash')}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}