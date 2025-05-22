
export type UserRole = 'worker' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    name: string;
    avatar?: string;
    location?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    cuit?: string; // For companies
    sector?: string; // For companies
  };
  emailVerified: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  salaryFrom?: number;
  salaryTo?: number;
  contractType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  location: string;
  requirements: string[];
  benefits: string[];
  status: 'open' | 'closed' | 'archived';
  createdAt: string;
  company?: {
    name: string;
    avatar: string;
    sector: string;
  };
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'viewed' | 'contacted' | 'hired' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
}

export interface Stats {
  totalJobs: number;
  totalWorkers: number;
  totalCompanies: number;
  totalHires: number;
}
