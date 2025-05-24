
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, CreateJobData } from '../services/jobService';
import { useToast } from './use-toast';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: jobService.getPublicJobs,
  });
};

export const useCompanyJobs = (companyId: string) => {
  return useQuery({
    queryKey: ['company-jobs', companyId],
    queryFn: () => jobService.getCompanyJobs(companyId),
    enabled: !!companyId,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobData: CreateJobData) => jobService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      toast({
        title: "¡Empleo publicado!",
        description: "Tu oferta laboral ha sido publicada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el empleo. Intentá nuevamente.",
        variant: "destructive",
      });
    },
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ jobId, applicationData }: { 
      jobId: string; 
      applicationData?: { cover_letter?: string; expected_salary?: number } 
    }) => jobService.applyToJob(jobId, applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      toast({
        title: "¡Postulación enviada!",
        description: "Tu postulación ha sido enviada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error applying to job:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la postulación. Intentá nuevamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUserApplications = (userId: string) => {
  return useQuery({
    queryKey: ['user-applications', userId],
    queryFn: () => jobService.getUserApplications(userId),
    enabled: !!userId,
  });
};
