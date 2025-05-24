
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';
import { NotificationService } from './api/notificationService';
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
      .select('id, company_name')
      .eq('user_id', user.id)
      .single();

    if (companyError || !companyProfile) {
      console.error('Company profile not found:', companyError);
      throw new Error('No se encontró el perfil de empresa. Asegúrate de completar tu perfil de empresa primero.');
    }

    // Convertir strings a arrays para los campos que lo requieren
    const processedData = {
      company_id: companyProfile.id,
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
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Job created successfully:', data);

    // Crear notificaciones para trabajadores después de crear el empleo
    try {
      await notificationService.notifyWorkersOfNewJob({
        ...data,
        company_profiles: companyProfile
      });
      console.log('Notifications sent successfully');
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // No lanzar error para no afectar la creación del empleo
    }
    
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

  async getJobById(jobId: string) {
    const { data, error } = await supabase
      .from('job_posts')
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry,
          description,
          website
        )
      `)
      .eq('id', jobId)
      .single();

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

    console.log('Applying to job:', { jobId, userId: user.id, applicationData });

    // Obtener el worker_profile_id del usuario actual
    const { data: workerProfile, error: workerError } = await supabase
      .from('worker_profiles')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (workerError || !workerProfile) {
      console.error('Worker profile not found:', workerError);
      throw new Error('No se encontró el perfil de trabajador. Debes completar tu perfil antes de postularte.');
    }

    console.log('Worker profile found:', workerProfile);

    // Verificar si ya se postuló a este empleo usando el worker_profile.id
    const { data: existingApplication, error: checkError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_post_id', jobId)
      .eq('worker_id', workerProfile.id)
      .single();

    if (existingApplication) {
      throw new Error('Ya te postulaste a este empleo.');
    }

    // Obtener información del trabajo y la empresa para el webhook
    const { data: jobData, error: jobError } = await supabase
      .from('job_posts')
      .select(`
        *,
        company_profiles (
          company_name,
          user_id,
          contact_phone
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      console.error('Job not found:', jobError);
      throw new Error('No se encontró el empleo.');
    }

    // Obtener email de la empresa
    const { data: companyUser, error: companyUserError } = await supabase
      .from('users')
      .select('email')
      .eq('id', jobData.company_profiles.user_id)
      .single();

    // Crear la aplicación usando el worker_profile.id
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_post_id: jobId,
        worker_id: workerProfile.id,
        cover_letter: applicationData?.cover_letter,
        expected_salary: applicationData?.expected_salary,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
    
    console.log('Application submitted successfully:', data);

    // Enviar notificación a n8n sobre la nueva postulación
    try {
      await NotificationService.sendJobApplicationNotification({
        applicantId: workerProfile.id,
        applicantEmail: user.email || '',
        applicantName: `${workerProfile.first_name} ${workerProfile.last_name}`,
        jobId: jobId,
        jobTitle: jobData.title,
        companyId: jobData.company_id,
        companyEmail: companyUser?.email || '',
      });
      console.log('n8n webhook notification sent successfully');
    } catch (webhookError) {
      console.error('Error sending webhook notification:', webhookError);
      // No lanzar error para no afectar la postulación
    }
    
    return data;
  },

  async getUserApplications(userId: string) {
    // Primero obtener el worker_profile.id
    const { data: workerProfile, error: workerError } = await supabase
      .from('worker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (workerError || !workerProfile) {
      console.log('No worker profile found for user:', userId);
      return [];
    }

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
      .eq('worker_id', workerProfile.id); // Usar worker_profile.id

    if (error) throw error;
    return data;
  }
};
