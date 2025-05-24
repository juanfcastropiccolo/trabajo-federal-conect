
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/storageService';
import { Camera, Upload, Loader2, User, Building, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  userRole: UserRole;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatar,
  userRole,
  userName,
  onAvatarUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    try {
      setIsUploading(true);

      const result = await StorageService.uploadProfilePicture(user.id, file);

      if (result.error) {
        toast({
          title: "Error al subir imagen",
          description: result.error,
          variant: "destructive"
        });
        setPreviewUrl(null);
        return;
      }

      if (result.url) {
        onAvatarUpdate(result.url);
        setPreviewUrl(null);
        toast({
          title: "Imagen actualizada",
          description: "Tu foto de perfil se ha actualizado exitosamente."
        });
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error inesperado",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive"
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = previewUrl || currentAvatar;

  const getRoleIcon = () => {
    switch (userRole) {
      case 'company':
        return <Building className="w-16 h-16" />;
      case 'admin':
        return <Shield className="w-16 h-16" />;
      default:
        return <User className="w-16 h-16" />;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 cursor-pointer" onClick={triggerFileSelect}>
          <AvatarImage src={displayAvatar} alt={userName} />
          <AvatarFallback className="text-2xl">
            {getRoleIcon()}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay al hacer hover */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={triggerFileSelect}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>
      </div>

      <Button 
        onClick={triggerFileSelect} 
        disabled={isUploading}
        variant="outline"
        className="w-full max-w-xs"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Cambiar Foto
          </>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Formatos soportados: JPG, PNG, WebP, GIF. Máximo 5MB.
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
