
import { NotificationService } from '@/services/api/notificationService';
import { analytics } from '@/utils/analytics';

interface User {
  id: string;
  email: string;
  profile?: {
    full_name?: string;
    name?: string;
  };
}

interface Job {
  id: string;
  title: string;
  companyId: string;
  companyEmail?: string;
  company?: {
    email?: string;
    name?: string;
  };
}

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

// In-memory storage for applications (replace with real database integration)
let applications: Application[] = [];

/**
 * Apply to a job and send notifications
 */
export const applyToJob = async (job: Job, user: User): Promise<void> => {
  const startTime = Date.now();
  
  try {
    // Check if user already applied
    const existingApplication = applications.find(
      app => app.jobId === job.id && app.applicantId === user.id
    );
    
    if (existingApplication) {
      throw new Error('Ya te has postulado a esta oferta');
    }
    
    // Create new application
    const newApplication: Application = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      jobId: job.id,
      applicantId: user.id,
      appliedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to applications
    applications.push(newApplication);
    
    console.log("Application created:", newApplication);
    
    // Send notification via n8n webhook
    const applicantName = user.profile?.full_name || user.profile?.name || user.email;
    const companyEmail = job.companyEmail || job.company?.email;
    
    await NotificationService.sendJobApplicationNotification({
      applicantId: user.id,
      applicantEmail: user.email,
      applicantName,
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyEmail,
    });
    
    // Track successful application
    analytics.trackEvent('job_application_success', {
      job_id: job.id,
      company_id: job.companyId,
      time_ms: Date.now() - startTime,
      has_company_email: !!companyEmail
    });
    
    console.log("Job application completed successfully");
    
  } catch (error) {
    console.error("Error applying to job:", error);
    
    analytics.trackEvent('job_application_error', {
      job_id: job.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      time_ms: Date.now() - startTime
    });
    
    throw error;
  }
};

/**
 * Get applications for a user
 */
export const getUserApplications = (userId: string): Application[] => {
  return applications.filter(app => app.applicantId === userId);
};

/**
 * Get applications for a job
 */
export const getJobApplications = (jobId: string): Application[] => {
  return applications.filter(app => app.jobId === jobId);
};

/**
 * Check if user has applied to a job
 */
export const hasUserApplied = (jobId: string, userId: string): boolean => {
  return applications.some(app => app.jobId === jobId && app.applicantId === userId);
};

/**
 * Get application status
 */
export const getApplicationStatus = (jobId: string, userId: string): string | null => {
  const application = applications.find(app => app.jobId === jobId && app.applicantId === userId);
  return application?.status || null;
};
