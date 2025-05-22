
import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, User, Building } from 'lucide-react';

const Messages = () => {
  const { messages, sendMessage, jobs } = useData();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  // Get user's messages
  const userMessages = messages.filter(
    msg => msg.senderId === user.id || msg.receiverId === user.id
  );

  // Group messages by conversation
  const conversations = userMessages.reduce((acc, message) => {
    const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        messages: [],
        unreadCount: 0,
        lastMessage: null as any
      };
    }
    
    acc[otherUserId].messages.push(message);
    
    if (!message.read && message.receiverId === user.id) {
      acc[otherUserId].unreadCount++;
    }
    
    // Set last message
    if (!acc[otherUserId].lastMessage || 
        new Date(message.timestamp) > new Date(acc[otherUserId].lastMessage.timestamp)) {
      acc[otherUserId].lastMessage = message;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Sort conversations by last message time
  const sortedConversations = Object.values(conversations).sort((a: any, b: any) => 
    new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );

  const selectedMessages = selectedConversation 
    ? conversations[selectedConversation]?.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ) || []
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessage({
      senderId: user.id,
      receiverId: selectedConversation,
      content: newMessage.trim(),
      read: false
    });

    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getUserInfo = (userId: string) => {
    // Mock user data - in a real app this would come from a users API/context
    const mockUsers: Record<string, any> = {
      'comp1': { name: 'Logística SA', avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop', type: 'company' },
      'comp2': { name: 'CleanPro', avatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&h=150&fit=crop', type: 'company' },
      'user1': { name: 'Juan Pérez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', type: 'worker' }
    };
    
    return mockUsers[userId] || { name: 'Usuario', avatar: '', type: 'worker' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajes</h1>
          <p className="text-gray-600">Gestioná tus conversaciones con empresas y candidatos</p>
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
                {sortedConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tenés mensajes
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Cuando te postules a empleos o publiques ofertas, aparecerán conversaciones aquí.
                    </p>
                  </div>
                ) : (
                  sortedConversations.map((conversation: any) => {
                    const userInfo = getUserInfo(conversation.userId);
                    const isSelected = selectedConversation === conversation.userId;
                    
                    return (
                      <div
                        key={conversation.userId}
                        onClick={() => setSelectedConversation(conversation.userId)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={userInfo.avatar} />
                              <AvatarFallback>
                                {userInfo.type === 'company' ? (
                                  <Building className="w-5 h-5" />
                                ) : (
                                  <User className="w-5 h-5" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">{conversation.unreadCount}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 truncate">
                                  {userInfo.name}
                                </p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {userInfo.type === 'company' ? 'Empresa' : 'Trabajador'}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.senderId === user.id ? 'Tú: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getUserInfo(selectedConversation).avatar} />
                        <AvatarFallback>
                          {getUserInfo(selectedConversation).type === 'company' ? (
                            <Building className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getUserInfo(selectedConversation).name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getUserInfo(selectedConversation).type === 'company' ? 'Empresa' : 'Trabajador'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-4">
                      {selectedMessages.map((message) => {
                        const isFromUser = message.senderId === user.id;
                        const senderInfo = getUserInfo(message.senderId);
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isFromUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isFromUser && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={senderInfo.avatar} />
                                <AvatarFallback>
                                  {senderInfo.type === 'company' ? (
                                    <Building className="w-4 h-4" />
                                  ) : (
                                    <User className="w-4 h-4" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isFromUser
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-900 border'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isFromUser ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                            
                            {isFromUser && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profile.avatar} />
                                <AvatarFallback>{user.profile.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribí tu mensaje..."
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
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
