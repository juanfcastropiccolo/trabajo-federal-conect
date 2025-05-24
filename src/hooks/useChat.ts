
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, type Conversation, type ChatMessage } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener conversaciones del usuario
  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => user ? chatService.getUserConversations(user.id) : [],
    enabled: !!user?.id,
  });

  // Mutación para crear conversación
  const createConversationMutation = useMutation({
    mutationFn: ({ workerId, jobPostId }: { workerId: string; jobPostId?: string }) => 
      chatService.createConversation(user!.id, workerId, jobPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mutación para cerrar conversación
  const closeConversationMutation = useMutation({
    mutationFn: (conversationId: string) => 
      chatService.closeConversation(conversationId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: "Conversación finalizada",
        description: "La conversación ha sido cerrada exitosamente."
      });
    },
  });

  // Mutación para enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content, messageType, fileData }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'file' | 'emoji';
      fileData?: { url: string; name: string; type: string };
    }) => chatService.sendMessage(conversationId, user!.id, content, messageType, fileData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mutación para subir archivo
  const uploadFileMutation = useMutation({
    mutationFn: ({ conversationId, file }: { conversationId: string; file: File }) =>
      chatService.uploadChatFile(conversationId, file),
  });

  // Escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('chat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    conversations: conversationsQuery.data || [],
    isLoadingConversations: conversationsQuery.isLoading,
    createConversation: createConversationMutation.mutate,
    closeConversation: closeConversationMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    uploadFile: uploadFileMutation.mutate,
    isCreatingConversation: createConversationMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    isUploadingFile: uploadFileMutation.isPending,
    refetchConversations: conversationsQuery.refetch,
  };
};

export const useConversationMessages = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationId ? chatService.getConversationMessages(conversationId) : [],
    enabled: !!conversationId,
  });

  // Marcar mensajes como leídos
  const markAsReadMutation = useMutation({
    mutationFn: (convId: string) => chatService.markMessagesAsRead(convId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    markAsRead: markAsReadMutation.mutate,
    refetchMessages: messagesQuery.refetch,
  };
};
