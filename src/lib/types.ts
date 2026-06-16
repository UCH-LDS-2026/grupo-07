
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

  // Soporte para componentes antiguos (Dashboard) que buscan project.client
  client?: string;

  // Relación técnica con la base de datos
  client_id: number;

  // Datos descriptivos
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
  tax_rate?: number;

  gitRepo?: string;
  driveUrl?: string;

  clients?: Client;
  user_id?: string;
  created_at?: string;
}