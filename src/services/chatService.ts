
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from './storageService';

export interface Conversation {
  id: string;
  company_id: string;
  worker_id: string;
  job_post_id?: string;
  status: 'active' | 'closed';
  closed_by?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  company_profiles?: {
    company_name: string;
    avatar_url?: string;
  };
  worker_profiles?: {
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
  unread_count?: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: 'text' | 'file' | 'emoji';
  file_url?: string;
  file_name?: string;
  file_type?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  edited_at?: string;
  is_deleted: boolean;
}

export const chatService = {
  // Obtener conversaciones del usuario
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        company_profiles:company_id (
          company_name,
          avatar_url
        ),
        worker_profiles:worker_id (
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .or(`company_id.eq.${userId},worker_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Obtener conteo de mensajes no leídos y último mensaje para cada conversación
    const conversationsWithUnread = await Promise.all(
      (data || []).map(async (conv) => {
        const [unreadResult, lastMessageResult] = await Promise.all([
          supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userId),
          
          supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ]);

        return {
          ...conv,
          status: conv.status as 'active' | 'closed',
          unread_count: unreadResult.count || 0,
          last_message: lastMessageResult.data ? {
            ...lastMessageResult.data,
            message_type: lastMessageResult.data.message_type as 'text' | 'file' | 'emoji'
          } : null
        } as Conversation;
      })
    );

    return conversationsWithUnread;
  },

  // Crear nueva conversación (solo empresas)
  async createConversation(companyId: string, workerId: string, jobPostId?: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        company_id: companyId,
        worker_id: workerId,
        job_post_id: jobPostId
      })
      .select(`
        *,
        company_profiles:company_id (
          company_name,
          avatar_url
        ),
        worker_profiles:worker_id (
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as 'active' | 'closed'
    } as Conversation;
  },

  // Obtener conversación existente
  async getExistingConversation(companyId: string, workerId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        company_profiles:company_id (
          company_name,
          avatar_url
        ),
        worker_profiles:worker_id (
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .eq('company_id', companyId)
      .eq('worker_id', workerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? {
      ...data,
      status: data.status as 'active' | 'closed'
    } as Conversation : null;
  },

  // Cerrar conversación (solo empresas)
  async closeConversation(conversationId: string, companyId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({
        status: 'closed',
        closed_by: companyId,
        closed_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('company_id', companyId);

    if (error) throw error;
  },

  // Obtener mensajes de una conversación
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(msg => ({
      ...msg,
      message_type: msg.message_type as 'text' | 'file' | 'emoji'
    })) as ChatMessage[];
  },

  // Enviar mensaje
  async sendMessage(conversationId: string, senderId: string, content: string, messageType: 'text' | 'file' | 'emoji' = 'text', fileData?: { url: string; name: string; type: string }): Promise<ChatMessage> {
    const messageData: any = {
      conversation_id: conversationId,
      sender_id: senderId,
      message_type: messageType
    };

    if (messageType === 'text' || messageType === 'emoji') {
      messageData.content = content;
    } else if (messageType === 'file' && fileData) {
      messageData.content = fileData.name;
      messageData.file_url = fileData.url;
      messageData.file_name = fileData.name;
      messageData.file_type = fileData.type;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      message_type: data.message_type as 'text' | 'file' | 'emoji'
    } as ChatMessage;
  },

  // Marcar mensajes como leídos
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Subir archivo del chat (usando StorageService)
  async uploadChatFile(conversationId: string, file: File): Promise<{ url: string; error: string | null }> {
    const result = await StorageService.uploadChatFile(conversationId, file);
    return {
      url: result.url || '',
      error: result.error
    };
  }
};
