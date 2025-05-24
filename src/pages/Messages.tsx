
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import Navbar from '../components/Navbar';
import ChatInterface from '../components/chat/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation } from '../services/chatService';

const Messages = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    isLoadingConversations,
    sendMessage,
    closeConversation,
    uploadFile,
    isSendingMessage,
    isUploadingFile
  } = useChat();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  const isCompany = user.role === 'company';

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv => {
    const otherUserName = isCompany 
      ? `${conv.worker_profiles?.first_name} ${conv.worker_profiles?.last_name}`
      : conv.company_profiles?.company_name || '';
    
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = (content: string, messageType?: 'text' | 'file' | 'emoji', fileData?: any) => {
    if (!selectedConversation) return;
    
    sendMessage({
      conversationId: selectedConversation.id,
      content,
      messageType,
      fileData
    });
  };

  const handleCloseConversation = () => {
    if (!selectedConversation) return;
    closeConversation(selectedConversation.id);
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedConversation) return { url: '', error: 'No hay conversación seleccionada' };
    
    return new Promise<{ url: string; error: string | null }>((resolve) => {
      uploadFile({ conversationId: selectedConversation.id, file }, {
        onSuccess: (result) => resolve(result),
        onError: () => resolve({ url: '', error: 'Error al subir archivo' })
      });
    });
  };

  const renderConversationItem = (conversation: Conversation) => {
    const otherUser = isCompany ? {
      name: `${conversation.worker_profiles?.first_name} ${conversation.worker_profiles?.last_name}`,
      avatar: conversation.worker_profiles?.profile_picture_url,
      type: 'Trabajador'
    } : {
      name: conversation.company_profiles?.company_name || 'Empresa',
      avatar: conversation.company_profiles?.avatar_url,
      type: 'Empresa'
    };

    const isSelected = selectedConversation?.id === conversation.id;
    const lastMessageTime = conversation.last_message_at 
      ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: es })
      : '';

    return (
      <div
        key={conversation.id}
        onClick={() => setSelectedConversation(conversation)}
        className={`p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>
                {otherUser.type === 'Empresa' ? (
                  <Building className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </AvatarFallback>
            </Avatar>
            {conversation.unread_count && conversation.unread_count > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-medium text-gray-900 truncate">
                  {otherUser.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {otherUser.type}
                  </Badge>
                  {conversation.status === 'closed' && (
                    <Badge variant="secondary" className="text-xs">
                      Cerrada
                    </Badge>
                  )}
                </div>
              </div>
              {lastMessageTime && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {lastMessageTime}
                </span>
              )}
            </div>
            
            {conversation.last_message && (
              <p className="text-sm text-gray-600 truncate">
                {conversation.last_message.sender_id === user.id ? 'Tú: ' : ''}
                {conversation.last_message.message_type === 'file' 
                  ? `📎 ${conversation.last_message.file_name}`
                  : conversation.last_message.content
                }
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajes</h1>
          <p className="text-gray-600">
            {isCompany 
              ? 'Gestioná tus conversaciones con candidatos'
              : 'Conversaciones con empresas interesadas'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {isLoadingConversations ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Cargando conversaciones...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tenés conversaciones
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isCompany 
                        ? 'Iniciá conversaciones con candidatos desde sus perfiles'
                        : 'Las empresas pueden contactarte cuando estén interesadas en tu perfil'
                      }
                    </p>
                  </div>
                ) : (
                  filteredConversations.map(renderConversationItem)
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-full">
              {selectedConversation ? (
                <ChatInterface
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                  onCloseConversation={handleCloseConversation}
                  onUploadFile={handleUploadFile}
                  isSending={isSendingMessage}
                  isUploading={isUploadingFile}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Seleccioná una conversación
                    </h3>
                    <p className="text-gray-600">
                      Elegí una conversación de la lista para empezar a chatear
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
