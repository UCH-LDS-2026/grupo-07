import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Login from './pages/Login';
import CommandPalette from './components/CommandPalette';
import CreateProjectModal from './components/CreateProjectModal';
import { supabase } from './lib/supabase';

type Page = 'dashboard' | 'clients' | 'projects' | 'expenses' | 'profile';

interface Project {
  id: number;
  title: string;
  client: string;
  purpose: string;
  tech: string;
  deadline: string;
  status: string;
  progress: number;
  tags: string[];
  icon: string;
  gitRepo?: string;
  driveUrl?: string;
  budget: number;
  paid: number;
}


interface Client {
  name: string;
  email: string;
  company: string;
  projects: number;
  billing: number;
  paid: number;
  status: string;
  img: string;
  phone?: string;
  driveUrl?: string;
  projectSpecification?: string;
}



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  // Shared State
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({
        ...profile,
        avatar: profile.avatar_url // Map DB to UI field
      });
      setIsAuthenticated(true);
      fetchAppData(userId);
    }
    setLoading(false);
  };

  const fetchAppData = async (userId: string) => {
    // Fetch Projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('operator_id', userId);

    if (projectsData) {
      const mappedProjects = projectsData.map(p => ({
        ...p,
        tags: p.tech ? p.tech.split(',').map((t: string) => t.trim()) : [],
        icon: 'rocket_launch'
      }));
      setProjects(mappedProjects);

      // Derive clients from projects (or fetch from a clients table if we had one)
      // For now, let's derive them to match the current logic
      const derivedClients: Client[] = [];
      projectsData.forEach(p => {
        const existing = derivedClients.find(c => c.name === p.client);
        if (existing) {
          existing.projects += 1;
          existing.billing += p.budget;
          existing.paid += p.paid;
        } else {
          derivedClients.push({
            name: p.client,
            email: 'contacto@' + p.client.toLowerCase().replace(/\s+/g, '') + '.com',
            company: p.client,
            projects: 1,
            billing: p.budget,
            paid: p.paid,
            status: 'Active',
            img: `https://i.pravatar.cc/150?u=${p.client}`
          });
        }
      });
      setClients(derivedClients);
    }
  };


  const getCurrencySymbol = (cur: string) => {
    return cur === 'USD' ? '$' : 'ARS$ ';
  };

  const handleCurrencyChange = (newCurrency: string) => {

    if (newCurrency === currency) return;

    const rate = 1400;
    // If we go from USD to ARS, we multiply
    // If we go from ARS to USD, we divide
    const multiplier = newCurrency === 'ARS' ? rate : 1 / rate;

    setProjects(prev => prev.map(p => ({
      ...p,
      budget: Math.round(p.budget * multiplier),
      paid: Math.round(p.paid * multiplier)
    })));

    setClients(prev => prev.map(c => ({
      ...c,
      billing: Math.round(c.billing * multiplier),
      paid: Math.round(c.paid * multiplier)
    })));

    setCurrency(newCurrency);
  };


  const handleDeleteProject = async (projectId: number) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (!error) {
      const projectToDelete = projects.find(p => p.id === projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (projectToDelete) {
        setClients(prev => prev.filter(c => c.name !== projectToDelete.client));
      }
    }
  };

  const handleDeleteClient = async (clientName: string) => {
    // In our simplified derived client model, we delete projects for that client
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('client', clientName);

    if (!error) {
      setClients(prev => prev.filter(c => c.name !== clientName));
      setProjects(prev => prev.filter(p => p.client !== clientName));
    }
  };

  const handleUpdateProjectProgress = async (projectId: number, newProgress: number) => {
    const { error } = await supabase
      .from('projects')
      .update({ progress: newProgress })
      .eq('id', projectId);

    if (!error) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, progress: newProgress } : p));
    }
  };

  const handleUpdateProjectStatus = async (projectId: number, newStatus: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (!error) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    }
  };

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    if (userData.id) fetchAppData(userData.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleUpdateUser = async (updatedData: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedData.name,
        role: updatedData.role,
        phone: updatedData.phone,
        avatar_url: updatedData.avatar
      })
      .eq('id', currentUser.id);

    if (!error) {
      setCurrentUser((prev: any) => ({ ...prev, ...updatedData }));
    }
  };




  const handleCreateProject = async (projectData: any) => {
    const budget = parseFloat(projectData.budget) || 0;
    const paid = parseFloat(projectData.paid) || 0;

    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([{
          operator_id: currentUser?.id || 'demo-user',
          title: projectData.title,
          client: projectData.client,
          purpose: projectData.purpose,
          tech: projectData.tech,
          deadline: projectData.deadline,
          status: 'ACTIVE',
          progress: 0,
          git_repo: projectData.gitRepo,
          drive_url: projectData.driveUrl,
          budget,
          paid
        }])
        .select()
        .single();

      if (error) throw error;

      if (newProject) {
        const mappedProject: Project = {
          ...newProject,
          tags: newProject.tech ? newProject.tech.split(',').map((t: string) => t.trim()) : [],
          icon: 'rocket_launch'
        };
        setProjects(prev => [...prev, mappedProject]);
        if (currentUser?.id) fetchAppData(currentUser.id);
      }
    } catch (err: any) {
      console.error("Database Error:", err);
      // Fallback to local state if database fails (e.g. dummy credentials)
      const mockProject: Project = {
        id: Date.now(),
        title: projectData.title,
        client: projectData.client,
        purpose: projectData.purpose,
        tech: projectData.tech,
        deadline: projectData.deadline,
        status: 'ACTIVE',
        progress: 0,
        gitRepo: projectData.gitRepo,
        driveUrl: projectData.driveUrl,
        budget,
        paid,
        tags: projectData.tech ? projectData.tech.split(',').map((t: string) => t.trim()) : [],
        icon: 'rocket_launch'
      };
      
      setProjects(prev => [...prev, mockProject]);
      
      setClients(prev => {
        const existing = prev.find(c => c.name === projectData.client);
        if (existing) {
          return prev.map(c => c.name === projectData.client ? {
            ...c, projects: c.projects + 1, billing: c.billing + budget, paid: c.paid + paid
          } : c);
        } else {
          return [...prev, {
            name: projectData.client,
            email: 'contacto@' + projectData.client.toLowerCase().replace(/\s+/g, '') + '.com',
            company: projectData.client,
            projects: 1,
            billing: budget,
            paid: paid,
            status: 'Active',
            img: `https://i.pravatar.cc/150?u=${projectData.client}`
          }];
        }
      });
      
      alert(`Aviso: Guardado en modo local (Offline). \nNo se pudo conectar a la base de datos: ${err.message}`);
    }
  };




  const renderPage = () => {
    if (loading) {
      return (
        <div className="ml-64 min-h-screen flex items-center justify-center bg-[#05070a]">
          <div className="flex flex-col items-center gap-4">
            <span className="w-12 h-12 border-4 border-primary-container/30 border-t-primary-container rounded-full animate-spin"></span>
            <p className="text-outline font-space text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando NEXUS_OS...</p>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard projects={projects} currency={getCurrencySymbol(currency)} />;
      case 'clients':
        return <Clients clients={clients} currency={getCurrencySymbol(currency)} projects={projects} onDelete={handleDeleteClient} />;
      case 'projects':
        return <Projects projects={projects} onOpenCreateModal={() => setIsCreateModalOpen(true)} currency={getCurrencySymbol(currency)} onUpdateStatus={handleUpdateProjectStatus} onUpdateProgress={handleUpdateProjectProgress} onDelete={handleDeleteProject} />;

      case 'expenses':
        return <Expenses currency={getCurrencySymbol(currency)} operatorId={currentUser?.id} />;
      case 'profile':
        return <Profile user={currentUser} onUpdateUser={handleUpdateUser} activeProjectsCount={projects.length} onLogout={handleLogout} />;

      default:
        return <Dashboard projects={projects} currency={getCurrencySymbol(currency)} />;
    }
  };




  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="font-body-base text-on-background overflow-x-hidden">
      <CommandPalette onNavigate={setActivePage} />
      
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        onStartProject={() => setIsCreateModalOpen(true)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        user={currentUser}
      />



      {renderPage()}

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateProject}
      />

    </div>
  );
}

export default App;
