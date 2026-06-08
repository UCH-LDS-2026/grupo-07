import { useState, useEffect } from 'react';
import { useDolar } from './hooks/useDolar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Invoices from './pages/Invoices';
import CommandPalette from './components/CommandPalette';
import CreateProjectModal from './components/CreateProjectModal';
import { supabase } from './lib/supabase';

// Componente importado con nombre unívoco para evitar colisiones
import ContractsPage from './pages/Contracts';

import { Project, Client } from './lib/types';

type Page = 'dashboard' | 'clients' | 'projects' | 'expenses' | 'profile' | 'billing' | 'contracts';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  project_id?: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePage, setActivePageState] = useState<Page>(() => {
    const saved = localStorage.getItem('nexus_active_page');
    return (saved as Page) || 'dashboard';
  });

  const setActivePage = (value: Page | ((prev: Page) => Page)) => {
    const newPage = typeof value === 'function' ? value(activePage) : value;
    setActivePageState(newPage);
    localStorage.setItem('nexus_active_page', newPage);
  };
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({ ...profile, avatar: profile.avatar_url });
      setIsAuthenticated(true);
      fetchAppData(userId, true);
    } else {
      setLoading(false);
    }
  };

  const fetchAppData = async (userId: string, isInitial = false) => {
    if (!userId) return;
    if (isInitial) setLoading(true);

    try {
      // 1. CARGA INDEPENDIENTE DE CONTRATOS (Blindada contra fallos ajenos)
      try {
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .eq('operator_id', userId)
          .order('created_at', { ascending: false });

        if (!contractsError && contractsData) {
          setContracts(contractsData);
        } else if (contractsError) {
          console.error("❌ [App.tsx] Error al traer contratos de Supabase:", contractsError.message);
        }
      } catch (cErr) {
        console.error("❌ [App.tsx] Fallo crítico aislado en contratos:", cErr);
      }

      // 2. RESTO DE LA APP (Proyectos y Gastos en paralelo)
      const [projectsRes, expensesRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('operator_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('operator_id', userId)
          .order('date', { ascending: false }),
      ]);

      if (!projectsRes.error && projectsRes.data) {
        const mappedProjects: Project[] = projectsRes.data.map(p => ({
          id: p.id,
          title: p.title,
          client: p.client,
          purpose: p.purpose,
          tech: p.tech || '',
          tags: p.tech ? p.tech.split(',').map((t: string) => t.trim()) : [],
          status: p.status || 'ACTIVE',
          progress: p.progress || 0,
          budget: p.budget || 0,
          paid: p.paid || 0,
          deadline: p.deadline || '',
          icon: 'rocket_launch',
          client_id: p.client_id,
          tax_rate: p.tax_rate || 0
        }));
        setProjects(mappedProjects);
      }

      if (!expensesRes.error && expensesRes.data) {
        setExpenses(expensesRes.data);
      }

      try {
        const clientsRes = await supabase
          .from('clients')
          .select('*')
          .eq('operator_id', userId)
          .order('name', { ascending: true });

        if (!clientsRes.error && clientsRes.data) {
          const mappedClients: Client[] = clientsRes.data.map(c => ({
            ...c,
            projectsCount: projectsRes.data?.filter(p => p.client === c.name || p.client_id === c.id).length || 0
          }));
          setClients(mappedClients);
        } else {
          deriveClientsFromProjects(projectsRes.data || []);
        }
      } catch {
        deriveClientsFromProjects(projectsRes.data || []);
      }

    } catch (err) {
      console.error('Error crítico general en sincronización:', err);
    } finally {
      setLoading(false);
    }
  };

  const deriveClientsFromProjects = (projectsData: any[]) => {
    const derivedClients: Client[] = [];
    projectsData.forEach(p => {
      const existing = derivedClients.find(c => c.name === p.client);
      if (existing) {
        (existing as any).projectsCount = ((existing as any).projectsCount || 0) + 1;
      } else {
        derivedClients.push({
          id: Date.now() + Math.random(),
          name: p.client || 'Sin cliente',
          email: '',
          company: p.client,
          status: 'Active',
        } as any);
      }
    });
    setClients(derivedClients);
  };

  // Cotización dólar blue en tiempo real
  const { rate: dolarRate, cotizacion: dolarInfo, loading: dolarLoading, error: dolarError } = useDolar();

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currency) return;
    setCurrency(newCurrency);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <p className="text-white animate-pulse uppercase tracking-widest text-[10px]">Sincronizando terminal operativa...</p>
      </div>
    );

    const commonProps = { 
      currency: currency === 'USD' ? 'US$' : 'ARS$',
      currencyCode: currency,
      dolarRate,
      dolarError,
      dolarLoading,
    };

    switch (activePage) {
      case 'dashboard':
        return <Dashboard projects={projects} expenses={expenses} {...commonProps} />;
      case 'expenses':
        return <Expenses expenses={expenses} projects={projects} {...commonProps} operatorId={currentUser?.id} onRefresh={() => fetchAppData(currentUser.id)} />;
      case 'projects':
        return (
          <Projects
            projects={projects}
            onUpdateStatus={async (id, status) => {
              await supabase.from('projects').update({ status }).eq('id', id);
              fetchAppData(currentUser.id);
            }}
            onUpdateProgress={async (id, progress) => {
              await supabase.from('projects').update({ progress }).eq('id', id);
              fetchAppData(currentUser.id);
            }}
            onDelete={async (id) => {
              await supabase.from('projects').delete().eq('id', id);
              fetchAppData(currentUser.id);
            }}
            fetchProjects={() => fetchAppData(currentUser.id)}
            {...commonProps}
          />
        );
      case 'clients':
        return (
          <Clients
            clients={clients}
            projects={projects}
            onDelete={async (clientName) => {
              await supabase.from('clients').delete().eq('name', clientName);
              fetchAppData(currentUser.id);
            }}
            userId={currentUser?.id || ''}
            onRefresh={() => fetchAppData(currentUser?.id)}
            {...commonProps}
          />
        );
      case 'billing': 
        return <Invoices />;
      
      case 'contracts':
        return (
          <ContractsPage 
            contracts={contracts} 
            projects={projects} // <-- SUMAMOS ESTA LÍNEA CLAVE
            onRefresh={() => fetchAppData(currentUser?.id)} 
            userId={currentUser?.id || ''} 
          />
        );
      case 'profile':
        return <Profile user={currentUser} onUpdateUser={setCurrentUser} activeProjectsCount={projects.length} onLogout={handleLogout} />;
      default:
        return <Dashboard projects={projects} expenses={expenses} {...commonProps} />;
    }
  };

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      fetchUserProfile(session.user.id);
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="bg-[#05070a] min-h-screen text-white font-space flex">
      <CommandPalette onNavigate={setActivePage} />

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onStartProject={() => setIsCreateModalOpen(true)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        user={currentUser}
        dolarRate={dolarRate}
        dolarLoading={dolarLoading}
        dolarInfo={dolarInfo}
      />

      <main className="flex-1 w-full transition-all duration-300 md:ml-64 pl-4 md:pl-12 max-w-[1500px]">
        {renderPage()}
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => fetchAppData(currentUser?.id)}
        userId={currentUser?.id || ''}
      />
    </div>
  );
}

export default App;