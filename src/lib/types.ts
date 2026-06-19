
export interface Client {
  id: number;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  status?: string;
  img?: string;
}


export interface Project {
  id: number;
  title: string;


  client?: string;

  client_id: number;

  status: 'ACTIVE' | 'PAUSED' | 'FINISHED' | string;
  icon: string;
  description?: string;
  purpose?: string;
  tech?: string;


  progress: number;
  tags: string[];
  deadline: string;

  budget: number;
  paid: number;
  currency?: string;
  tax_rate?: number;

  gitRepo?: string;
  driveUrl?: string;

  clients?: Client;
  user_id?: string;
  created_at?: string;
}