
import { analytics } from '@/utils/analytics';

interface NotificationPayload {
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyEmail?: string;
  timestamp?: string;
}

/**
 * Service for sending notifications via n8n webhook
 */
export const NotificationService = {
  /**
   * Send job application notification via n8n webhook
   * @param payload Application data to send
   */
  sendJobApplicationNotification: async (payload: NotificationPayload): Promise<void> => {
    const webhookUrl = "https://energia.app.n8n.cloud/webhook/872b4da2-51b4-44dc-8568-75e9e9b4125e";
    const startTime = Date.now();
    
    try {
      console.log("Sending job application notification to n8n:", payload);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "job_application",
          ...payload,
          timestamp: payload.timestamp || new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      console.log("n8n webhook response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }
      
      console.log("Job application notification sent successfully to n8n");
      
      analytics.trackApiRequest('n8n/job-application', true, Date.now() - startTime);
      analytics.trackEvent('job_application_notification_sent', {
        job_id: payload.jobId,
        applicant_id: payload.applicantId,
      });
      
    } catch (error) {
      console.error("Error sending job application notification to n8n:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      analytics.trackApiRequest('n8n/job-application', false, Date.now() - startTime, errorMessage);
      
      // Re-lanzar el error para debugging pero sin bloquear la aplicación
      throw error;
    }
  },
  
  /**
   * Send general notification via webhook
   * @param type Notification type
   * @param data Notification data
   */
  sendGenericNotification: async (type: string, data: any): Promise<void> => {
    const webhookUrl = "https://energia.app.n8n.cloud/webhook/872b4da2-51b4-44dc-8568-75e9e9b4125e";
    const startTime = Date.now();
    
    try {
      console.log(`Sending ${type} notification to n8n:`, data);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_type: type,
          data,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      console.log(`n8n webhook response status for ${type}:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      console.log(`${type} notification sent successfully to n8n`);
      analytics.trackApiRequest(`n8n/${type}`, true, Date.now() - startTime);
      
    } catch (error) {
      console.error(`Error sending ${type} notification to n8n:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      analytics.trackApiRequest(`n8n/${type}`, false, Date.now() - startTime, errorMessage);
      
      throw error;
    }
  }
};
