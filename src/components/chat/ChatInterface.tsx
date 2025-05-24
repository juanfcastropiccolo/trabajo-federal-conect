
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversationMessages } from '../../hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Download, X, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation } from '../../services/chatService';

interface ChatInterfaceProps {
  conversation: Conversation;
  onSendMessage: (content: string, messageType?: 'text' | 'file' | 'emoji', fileData?: any) => void;
  onCloseConversation: () => void;
  onUploadFile: (file: File) => Promise<{ url: string; error: string | null }>;
  isSending: boolean;
  isUploading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  onSendMessage,
  onCloseConversation,
  onUploadFile,
  isSending,
  isUploading
}) => {
  const { user } = useAuth();
  const { messages, markAsRead } = useConversationMessages(conversation.id);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isCompany = user?.role === 'company';
  const isActive = conversation.status === 'active';
  const canSendMessages = isActive && (isCompany || (!isCompany && messages.length > 0));

  // Emojis comunes para el chat
  const commonEmojis = ['😊', '😂', '👍', '👎', '❤️', '😢', '😮', '😡', '🤔', '👌', '🙏', '💪'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversation.id && user?.id) {
      markAsRead(conversation.id);
    }
  }, [conversation.id, user?.id, markAsRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !canSendMessages) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji, 'emoji');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await onUploadFile(file);
      if (result.error) {
        alert(result.error);
      } else {
        onSendMessage(file.name, 'file', {
          url: result.url,
          name: file.name,
          type: file.type
        });
      }
    } catch (error) {
      alert('Error al subir el archivo');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getOtherUser = () => {
    if (isCompany) {
      return {
        name: `${conversation.worker_profiles?.first_name} ${conversation.worker_profiles?.last_name}`,
        avatar: conversation.worker_profiles?.profile_picture_url,
        type: 'Trabajador'
      };
    } else {
      return {
        name: conversation.company_profiles?.company_name || 'Empresa',
        avatar: conversation.company_profiles?.avatar_url,
        type: 'Empresa'
      };
    }
  };

  const otherUser = getOtherUser();

  const renderMessage = (message: any) => {
    const isFromUser = message.sender_id === user?.id;
    const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: es });

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
        {!isFromUser && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isFromUser ? 'order-1' : 'order-2'}`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isFromUser
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            {message.message_type === 'file' ? (
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:underline ${isFromUser ? 'text-blue-100' : 'text-blue-600'}`}
                >
                  {message.file_name}
                </a>
                <a
                  href={message.file_url}
                  download={message.file_name}
                  className={`p-1 rounded ${isFromUser ? 'hover:bg-blue-700' : 'hover:bg-gray-100'}`}
                >
                  <Download className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className={`text-sm ${message.message_type === 'emoji' ? 'text-lg' : ''}`}>
                {message.content}
              </p>
            )}
          </div>
          
          <p className={`text-xs mt-1 ${isFromUser ? 'text-right text-gray-500' : 'text-gray-500'}`}>
            {messageTime}
          </p>
        </div>

        {isFromUser && (
          <Avatar className="h-8 w-8 flex-shrink-0 order-2">
            <AvatarImage src={user?.profile?.avatar} />
            <AvatarFallback>{user?.profile?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {otherUser.type}
              </Badge>
              {conversation.status === 'closed' && (
                <Badge variant="secondary" className="text-xs">
                  Conversación cerrada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isCompany && isActive && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onCloseConversation}
          >
            Finalizar conversación
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      {canSendMessages ? (
        <div className="p-4 border-t bg-white">
          {showEmojiPicker && (
            <div className="mb-3 p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Emojis</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="text-lg"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribí tu mensaje..."
                className="pr-20 min-h-[44px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="p-4 border-t bg-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {conversation.status === 'closed' 
              ? 'Esta conversación ha sido finalizada'
              : 'Esperando que la empresa inicie la conversación'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
