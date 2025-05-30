
import React, { createContext, useContext, useState } from 'react';
import { Job, Application, Message } from '../types';
import { mockApplications, mockMessages } from '../data/mockData';

interface DataContextType {
  jobs: Job[];
  applications: Application[];
  messages: Message[];
  createJob: (jobData: Omit<Job, 'id' | 'createdAt'>) => void;
  applyToJob: (jobId: string, userId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateJobStatus: (jobId: string, status: 'open' | 'closed' | 'archived') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mantener los datos mock para compatibilidad con Dashboard.tsx
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const createJob = (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    console.log('createJob called - this is now handled by Supabase');
  };

  const applyToJob = (jobId: string, userId: string) => {
    console.log('applyToJob called - this is now handled by Supabase');
  };

  const sendMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const updateJobStatus = (jobId: string, status: 'open' | 'closed' | 'archived') => {
    console.log('updateJobStatus called - this is now handled by Supabase');
  };

  return (
    <DataContext.Provider value={{ 
      jobs, 
      applications, 
      messages, 
      createJob, 
      applyToJob, 
      sendMessage, 
      updateJobStatus 
    }}>
      {children}
    </DataContext.Provider>
  );
};
