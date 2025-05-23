// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yfsfdeowfwlyknjfpdud.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc2ZkZW93ZndseWtuamZwZHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NjgxNzIsImV4cCI6MjA2MzU0NDE3Mn0.K5RsVgn09Kew-cWcfR6uSvBhkcjY2FdpZ1ff_l6zJLc";

// Validar que las variables de entorno estén configuradas
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Asegurate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY configuradas.'
  );
}

// Crear cliente de Supabase con configuración optimizada
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Debug en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Supabase configurado:', {
    url: SUPABASE_URL,
    hasKey: !!SUPABASE_PUBLISHABLE_KEY,
  });
}