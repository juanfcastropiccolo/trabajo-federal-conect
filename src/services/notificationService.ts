
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'job_posted' | 'application_received' | 'application_status' | 'message' | 'system';
  related_id?: string;
  related_type?: string;
}

export const notificationService = {
  async createNotification(data: CreateNotificationData) {
    const { error } = await supabase
      .from('notifications')
      .insert(data);

    if (error) throw error;
  },

  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async notifyWorkersOfNewJob(jobData: any) {
    // Obtener todos los trabajadores activos
    const { data: workers, error } = await supabase
      .from('users')
      .select('id, worker_profiles(province, city)')
      .eq('user_type', 'worker')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching workers:', error);
      return;
    }

    if (!workers || workers.length === 0) return;

    // Crear notificaciones para trabajadores relevantes
    const notifications = workers
      .filter(worker => {
        // Filtrar por ubicación si está especificada
        if (jobData.province && worker.worker_profiles?.[0]?.province) {
          return worker.worker_profiles[0].province === jobData.province;
        }
        return true; // Si no hay filtro de ubicación, notificar a todos
      })
      .map(worker => ({
        user_id: worker.id,
        title: 'Nueva Oferta Laboral',
        message: `${jobData.company_profiles?.company_name || 'Una empresa'} publicó: ${jobData.title}`,
        type: 'job_posted' as const,
        related_id: jobData.id,
        related_type: 'job_post'
      }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating notifications:', insertError);
      }
    }
  },

  // Función para agrupar notificaciones similares
  async consolidateJobNotifications(userId: string) {
    const { data: unreadJobNotifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'job_posted')
      .eq('is_read', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Últimas 24 horas

    if (error || !unreadJobNotifications) return;

    if (unreadJobNotifications.length > 3) {
      // Eliminar notificaciones individuales
      const notificationIds = unreadJobNotifications.map(n => n.id);
      await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);

      // Crear una notificación consolidada
      await this.createNotification({
        user_id: userId,
        title: 'Nuevas Ofertas Laborales',
        message: `${unreadJobNotifications.length} empresas publicaron nuevos empleos. ¡Tu próximo empleo te está esperando!`,
        type: 'job_posted',
        related_type: 'multiple_jobs'
      });
    }
  }
};
