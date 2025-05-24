import { supabase } from '@/integrations/supabase/client';
import { Job } from '../types';

export interface CreateJobData {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  work_type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  location_type: 'on_site' | 'remote' | 'hybrid';
  province?: string;
  city?: string;
  address?: string;
  positions_available?: number;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
}

export const jobService = {
  // Exponer supabase para uso en hooks
  supabase,

  async createJob(jobData: CreateJobData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    console.log('Creating job with data:', jobData);

    // Primero, buscar el perfil de empresa del usuario
    const { data: companyProfile, error: companyError } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !companyProfile) {
      console.error('Company profile not found:', companyError);
      throw new Error('No se encontró el perfil de empresa. Asegúrate de completar tu perfil de empresa primero.');
    }

    // Convertir strings a arrays para los campos que lo requieren
    const processedData = {
      company_id: companyProfile.id, // Usar el ID del perfil de empresa, no del usuario
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements ? [jobData.requirements] : null,
      responsibilities: jobData.responsibilities ? [jobData.responsibilities] : null,
      salary_min: jobData.salary_min,
      salary_max: jobData.salary_max,
      work_type: jobData.work_type,
      location_type: jobData.location_type,
      province: jobData.province,
      city: jobData.city,
      address: jobData.address,
      positions_available: jobData.positions_available || 1,
      application_deadline: jobData.application_deadline,
      start_date: jobData.start_date,
      end_date: jobData.end_date,
      urgency: jobData.urgency || 'medium',
      status: 'published' as const
    };

    console.log('Processed data for Supabase:', processedData);

    const { data, error } = await supabase
      .from('job_posts')
      .insert(processedData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Job created successfully:', data);
    return data;
  },

  async getPublicJobs() {
    const { data, error } = await supabase
      .from('job_posts')
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCompanyJobs(companyId: string) {
    const { data, error } = await supabase
      .from('job_posts')
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateJobStatus(jobId: string, status: 'closed' | 'paused' | 'published') {
    const { data, error } = await supabase
      .from('job_posts')
      .update({ status })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async applyToJob(jobId: string, applicationData?: { cover_letter?: string; expected_salary?: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_post_id: jobId,
        worker_id: user.id,
        cover_letter: applicationData?.cover_letter,
        expected_salary: applicationData?.expected_salary,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserApplications(userId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_posts (
          title,
          company_id,
          company_profiles (
            company_name
          )
        )
      `)
      .eq('worker_id', userId);

    if (error) throw error;
    return data;
  }
};
