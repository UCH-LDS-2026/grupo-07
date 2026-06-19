import { useState, useEffect, useMemo, useRef } from 'react';
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
  onNavigate?: (page: 'dashboard' | 'clients' | 'projects' | 'expenses' | 'profile' | 'billing' | 'contracts') => void;
  user?: any;
}

export default function Dashboard({ currency = 'US$', currencyCode = 'USD', dolarRate = 1, onNavigate, user }: DashboardProps) {
  const { t } = useTranslation();

  const displayName = user?.name || user?.email?.split('@')[0] || 'OPERADOR';

  const [projectCount, setProjectCount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [logs, setLogs] = useState<string[]>([
    `[SYS] INIT: Iniciando módulo ${displayName.toUpperCase()}-Nexus...`,
    "[SYS] STATUS: Sincronización con base de datos Supabase ok.",
    `[SYS] AUTH: Operador ${displayName.toUpperCase()} en línea.`,
    "[SYS] NEXUS_DIVISA: Enlace exitoso. Cotización Dólar Blue conectada en tiempo real."
  ]);
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

  // Referencias para terminal acumulativa y scroll
  const terminalRef = useRef<HTMLDivElement>(null);


  // Auto-scroll effect
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // LISTENER GLOBAL DE EVENTOS CUSTOMIZADOS
  useEffect(() => {
    const handleNewLog = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setLogs(prev => [...prev, customEvent.detail]);
      }
    };
    window.addEventListener('terminal-log', handleNewLog);
    return () => window.removeEventListener('terminal-log', handleNewLog);
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;
      setUserId(currentUserId);
      if (!currentUserId) return;

      try {
        // 1. Cargar proyectos reales del operador
        const { data: dbProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', currentUserId);
        
        const countProjects = dbProjects?.length || 0;
        setProjectCount(countProjects);

        // 2. Suma real de facturas y Mapeo del Gráfico
        const { data: userInvoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*');
          
        if (invoicesError) {
          console.error("Error fetching invoices:", invoicesError.message);
        }
        
        // Filtrar en memoria por proyectos del operador
        const userProjectIds = new Set(dbProjects?.map(p => p.id) || []);
        const filteredInvoices = userInvoices?.filter(inv => userProjectIds.has(inv.project_id)) || [];

        let sumPaid = 0;
        const monthlyData = monthKeys.map(k => ({
          monthKey: `dashboard.months.${k}`,
          ingresos: 0
        }));

        filteredInvoices.forEach(inv => {
          if (inv.status === 'paid') {
            const amount = Number(inv.amount) || 0;
            sumPaid += amount;

            if (inv.created_at) {
              const date = new Date(inv.created_at);
              const monthIndex = date.getMonth();
              monthlyData[monthIndex].ingresos += amount;
            }
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
          .eq('user_id', currentUserId);
        const sumExpenses = expensesData?.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0) || 0;
        setTotalExpenses(sumExpenses);

        // 4. Terminal logs
        // Cargar contratos para recomendación
        const { data: dbContracts } = await supabase
          .from('contracts')
          .select('*')
          .eq('user_id', currentUserId);

        // Cargar tareas
        const { data: dbTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', currentUserId);

        // 5. Tasks & Links
        fetchTasks(currentUserId);
        fetchOpLinks(currentUserId);

        // -- ALGORITMO PREDICTIVO DE RECOMENDACIONES (LOCALIZADO & EXTENDIDO) --
        const recs: any[] = [];
        const profit = sumPaid - sumExpenses;
        const personalSalary = profit > 0 ? profit * 0.7 : 0;
        const isEn = i18n.language === 'en';

        // 1. Gasto vs Ingreso & Déficit Crítico
        if (sumExpenses > 0) {
          if (sumPaid === 0) {
            recs.push({
              id: 'no-income-expenses',
              type: 'urgent',
              title: isEn ? 'Critical Cash Deficit' : 'Déficit crítico de caja',
              description: isEn
                ? `You have operational expenses ($${sumExpenses.toLocaleString('en-US')}) but no recorded income. You are operating at a loss.`
                : `Registras gastos operativos ($${sumExpenses.toLocaleString('es-AR')}) pero no tienes ingresos cobrados en tu terminal. Estás operando en pérdida.`,
              actionLabel: isEn ? 'View Expenses' : 'Ver Finanzas',
              actionPage: 'expenses'
            });
          } else if (sumExpenses / sumPaid > 0.4) {
            recs.push({
              id: 'high-expenses',
              type: 'warning',
              title: isEn ? 'High Burn Rate' : 'Tasa de consumo elevada',
              description: isEn
                ? `Your operational expenses ($${sumExpenses.toLocaleString('en-US')}) represent ${Math.round((sumExpenses / sumPaid) * 100)}% of your income. Consider reducing non-essential costs.`
                : `Tus gastos operativos ($${sumExpenses.toLocaleString('es-AR')}) representan el ${Math.round((sumExpenses / sumPaid) * 100)}% de tus ingresos. Evalúa recortar suscripciones o costos no esenciales.`,
              actionLabel: isEn ? 'View Expenses' : 'Ver Finanzas',
              actionPage: 'expenses'
            });
          }
        }

        // 2. Facturas pendientes (unpaid)
        const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'pending');
        if (pendingInvoices.length > 0) {
          const totalPendingAmount = pendingInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
          recs.push({
            id: 'pending-invoices',
            type: 'urgent',
            title: isEn ? 'Uncollected Revenues' : 'Cobros pendientes de ejecución',
            description: isEn
              ? `You have ${pendingInvoices.length} pending invoices for a total of $${totalPendingAmount.toLocaleString('en-US')}. We recommend sending payment reminders.`
              : `Tienes ${pendingInvoices.length} facturas pendientes por un total de $${totalPendingAmount.toLocaleString('es-AR')}. Recomendamos enviar recordatorios de pago.`,
            actionLabel: isEn ? 'Manage Invoices' : 'Gestionar Facturas',
            actionPage: 'billing'
          });
        }

        // 3. Proyectos activos sin contrato asociado
        if (dbProjects && dbProjects.length > 0) {
          const contractProjectIds = new Set(dbContracts?.map(c => c.project_id) || []);
          const projectsWithoutContract = dbProjects.filter(p => p.status === 'ACTIVE' && !contractProjectIds.has(p.id));
          
          if (projectsWithoutContract.length > 0) {
            recs.push({
              id: 'no-contracts',
              type: 'warning',
              title: isEn ? 'Active Projects without Legal Contract' : 'Proyectos activos sin contrato legal',
              description: isEn
                ? `Detected ${projectsWithoutContract.length} active projects ("${projectsWithoutContract.map(p => p.title).join(', ')}") without an associated contract. Structure a contract to secure payments.`
                : `Se detectaron ${projectsWithoutContract.length} proyectos activos ("${projectsWithoutContract.map(p => p.title).join(', ')}") sin contrato asociado. Estructura un contrato para asegurar las condiciones de cobro.`,
              actionLabel: isEn ? 'Structure Contract' : 'Estructurar Contrato',
              actionPage: 'contracts'
            });
          }
        }

        // 4. Fechas límites de entrega próximas
        if (dbProjects) {
          const activeProjects = dbProjects.filter(p => p.status === 'ACTIVE' && p.progress < 100);
          const now = new Date();
          const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
          
          activeProjects.forEach(p => {
            if (p.deadline) {
              const deadlineDate = new Date(p.deadline);
              if (deadlineDate < now) {
                recs.push({
                  id: `deadline-overdue-${p.id}`,
                  type: 'urgent',
                  title: isEn ? `Project "${p.title}" past deadline` : `Proyecto "${p.title}" fuera de plazo`,
                  description: isEn
                    ? `The delivery deadline expired on ${deadlineDate.toLocaleDateString('en-US')}. Current progress: ${p.progress}%. Prioritize delivery or coordinate an extension.`
                    : `La fecha límite de entrega expiró el ${deadlineDate.toLocaleDateString('es-AR')}. Progreso actual: ${p.progress}%. Prioriza su entrega o coordina una prórroga con el cliente.`,
                  actionLabel: isEn ? 'View Project' : 'Ver Proyecto',
                  actionPage: 'projects'
                });
              } else if (deadlineDate <= tenDaysFromNow) {
                const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                recs.push({
                  id: `deadline-close-${p.id}`,
                  type: 'warning',
                  title: isEn ? `Upcoming delivery: "${p.title}"` : `Entrega próxima: "${p.title}"`,
                  description: isEn
                    ? `Only ${daysRemaining} days left for the delivery deadline (${deadlineDate.toLocaleDateString('en-US')}). Current progress is ${p.progress}%.`
                    : `Faltan solo ${daysRemaining} días para la fecha límite de entrega (${deadlineDate.toLocaleDateString('es-AR')}). El progreso actual es del ${p.progress}%.`,
                  actionLabel: isEn ? 'View Project' : 'Ver Proyecto',
                  actionPage: 'projects'
                });
              }
            }
          });
        }

        // 5. Proyectos finalizados con cobro pendiente
        const finishedProjects = dbProjects?.filter(p => p.status === 'FINISHED') || [];
        finishedProjects.forEach(p => {
          const pendingProjectInvoices = filteredInvoices.filter(inv => inv.project_id === p.id && inv.status === 'pending');
          if (pendingProjectInvoices.length > 0) {
            const sumPending = pendingProjectInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
            recs.push({
              id: `finished-pending-cobro-${p.id}`,
              type: 'urgent',
              title: isEn ? `Outstanding Balance on "${p.title}"` : `Cobro retenido en "${p.title}"`,
              description: isEn
                ? `The project is marked as finished but still has ${pendingProjectInvoices.length} pending invoices totaling $${sumPending.toLocaleString('en-US')}. Request the final settlement.`
                : `El proyecto fue marcado como finalizado pero tiene ${pendingProjectInvoices.length} facturas pendientes por un total de $${sumPending.toLocaleString('es-AR')}. Exige la liquidación final.`,
              actionLabel: isEn ? 'View Invoices' : 'Ver Facturas',
              actionPage: 'billing'
            });
          }
        });

        // 6. Cobertura cambiaria (Cotización Dólar Blue)
        if (dolarRate > 1 && currencyCode === 'ARS') {
          recs.push({
            id: 'currency-devaluation-ars',
            type: 'warning',
            title: isEn ? 'Exchange Rate Advisory' : 'Monitoreo de devaluación',
            description: isEn
              ? `The Dollar Blue is trading at $${dolarRate.toLocaleString('en-US')} ARS. We suggest quoting your active projects in USD to protect your income against inflation.`
              : `El Dólar Blue cotiza a $${dolarRate.toLocaleString('es-AR')}. Te sugerimos cotizar tus tarifas o contratos en USD para proteger tu margen de honorarios contra la inflación.`,
            actionLabel: isEn ? 'View Exchange Rate' : 'Ver Cotización',
            actionPage: 'dashboard'
          });
        }

        // 7. Tareas pendientes
        if (dbTasks) {
          const pendingTasks = dbTasks.filter(t => !t.done);
          if (pendingTasks.length > 0) {
            recs.push({
              id: 'pending-tasks',
              type: 'info',
              title: isEn ? 'Pending Tasks in Agenda' : 'Tareas pendientes en agenda',
              description: isEn
                ? `You have ${pendingTasks.length} pending task(s) in your checklist. Keep your workflow clear by completing them.`
                : `Tienes ${pendingTasks.length} tarea(s) pendiente(s) en tu agenda. Completa los pendientes para mantener limpia tu terminal operativa.`,
              actionLabel: isEn ? 'View Dashboard' : 'Ver Panel',
              actionPage: 'dashboard'
            });
          }
        }

        // Si todo está al día
        if (recs.length === 0) {
          if (personalSalary > 0) {
            recs.push({
              id: 'all-good-salary',
              type: 'success',
              title: isEn ? 'Optimal Operational Status' : 'Operaciones en estado óptimo',
              description: isEn
                ? `All systems are stable and up to date. Net salary available for distribution: $${personalSalary.toLocaleString('en-US')}. Good job!`
                : `Todos los sistemas están estables y al día. Salario neto disponible para distribución: $${personalSalary.toLocaleString('es-AR')}. ¡Buen trabajo!`,
              actionLabel: isEn ? 'New Project' : 'Nuevo Proyecto',
              actionPage: 'projects'
            });
          } else {
            recs.push({
              id: 'no-data-rec',
              type: 'info',
              title: isEn ? 'Ready to Start Operations' : 'Listo para iniciar operaciones',
              description: isEn
                ? 'No transactions or active projects recorded. Set up your first client, start a project, and generate its contract to start monitoring.'
                : 'No se registran transacciones ni proyectos activos. Configura tu primer cliente, inicia un proyecto y genera su contrato para comenzar a monitorear.',
              actionLabel: isEn ? 'Start Project' : 'Iniciar Proyecto',
              actionPage: 'projects'
            });
          }
        }

        setRecommendations(recs);
      } catch (err) {
        console.error("Error al poblar las métricas del dashboard:", err);
      }
    };

    initFetch();
  }, [currency]);



  // LOG DE CONFIRMACIÓN DE IDIOMA EN TERMINAL
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    if (i18n.language !== currentLang && logs.length > 0) {
      setCurrentLang(i18n.language);
      const langName = i18n.language === 'en' ? 'ENGLISH' : 'ESPAÑOL';
      const msg = i18n.language === 'en' 
        ? `[SYS] NEXUS_SYSTEM: Language core set to: ${langName}` 
        : `[SYS] NEXUS_SYSTEM: Idioma configurado en: ${langName}`;

      setLogs(prev => [...prev, msg]);
    } else if (i18n.language !== currentLang) {
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, currentLang, logs.length]);

  const fetchTasks = async (uid: string) => {
    const { data: tasksData, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    
    if (!error && tasksData) {
      setTasks(tasksData);
    }
  };

  const fetchOpLinks = async (uid: string) => {
    const { data, error } = await supabase
      .from('operator_links')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setOpLinks(data);
    }
  };

  const handleAddLink = async () => {
    // 1. Verificación segura del usuario desde la sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId || !newLink.title || !newLink.url) return;
    
    setIsLinkLoading(true);
    
    // Preparamos el payload (enviamos ambos IDs por las FK de Supabase)
    const newLinkPayload = {
      user_id: currentUserId,
      operator_id: currentUserId, 
      title: newLink.title,
      url: newLink.url,
      icon: newLink.icon
    };

    const { error } = await supabase.from('operator_links').insert([newLinkPayload]);
    
    if (error) {
      // 2. Log detallado del error 400
      console.error(`[Supabase Error] Message: ${error.message} | Details: ${error.details || 'N/A'} | Hint: ${error.hint || 'N/A'}`);
      
      // 3. Fallback en memoria (UI Optimiist Update)
      const fakeLink = {
        ...newLinkPayload,
        id: Date.now(), // Fake ID
        created_at: new Date().toISOString()
      };
      setOpLinks((prevLinks: any[]) => [...prevLinks, fakeLink]);
      
      setIsManagingLinks(false);
      setNewLink({ title: '', url: '', icon: 'drive' });
    } else {
      setIsManagingLinks(false);
      setNewLink({ title: '', url: '', icon: 'drive' });
      await fetchOpLinks(currentUserId);
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
            user_id: userId
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

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
    
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error("Error deleting task:", error);
      if (userId) await fetchTasks(userId);
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
      <div className="mb-6 select-none animate-fade-in relative z-10 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase font-sans transition-all duration-300 ease-in-out hover:text-cyan-400 cursor-default">
            {t('dashboard.title').split('//')[0]} <span className="text-xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">//{t('dashboard.title').split('//')[1]}</span>
          </h1>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mt-1 opacity-80 border-l-2 border-cyan-500 pl-2">
            {t('dashboard.subtitle')}
          </p>
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
          <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-3 text-xs pr-2 custom-scrollbar scroll-smooth">
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-xs mb-1 text-green-400">{log}</div>
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
                className="flex items-center justify-between group"
              >
                <div 
                  onClick={() => toggleTask(task)}
                  className="flex items-start gap-3 cursor-pointer select-none flex-1 pr-4"
                >
                  <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-300 ${task.done ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'border-white/20 group-hover:border-purple-400/50'}`}>
                    {task.done && <Check size={12} strokeWidth={4} className="text-white" />}
                  </div>
                  <span className={`text-xs font-space transition-all duration-300 ${task.done ? 'line-through text-white/30 decoration-purple-500/50' : 'text-white/80 group-hover:text-white'}`}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shrink-0"
                  title="Borrar Tarea"
                >
                  <Trash2 size={12} />
                </button>
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

      {/* ---------------- ADVISORY SECTION ---------------- */}
      <div className="glass-card border-l-4 border-l-cyan-500 p-6 bg-cyan-500/5 relative overflow-hidden z-10 text-left transition-all rounded-2xl glow-hover-cyan">
        <div className="flex items-center gap-4 relative z-10 mb-4 pb-4 border-b border-white/5">
          <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 animate-pulse">
            <FiCpu size={20} />
          </div>
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 font-space mb-0.5">
              NEXUS_OPERATIONAL__ADVISORY
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-white/40">
              Módulo de análisis predictivo de flujo de caja y entregables
            </p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-space uppercase border mt-0.5 shrink-0 ${
                  rec.type === 'urgent'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : rec.type === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : rec.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}>
                  {rec.type === 'urgent' ? 'Crítico' : rec.type === 'warning' ? 'Advertencia' : rec.type === 'success' ? 'Óptimo' : 'Sugerencia'}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white font-space uppercase tracking-wider">{rec.title}</h4>
                  <p className="text-xs text-white/60 mt-1 font-sans font-medium">{rec.description}</p>
                </div>
              </div>
              {rec.actionPage && onNavigate && (
                <button
                  onClick={() => onNavigate(rec.actionPage)}
                  className={`py-1.5 px-4 rounded-lg font-space text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                    rec.type === 'urgent'
                      ? 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500 hover:text-white'
                      : rec.type === 'warning'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500 hover:text-black font-semibold'
                      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500 hover:text-black font-semibold'
                  }`}
                >
                  Ir al módulo &rarr;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}