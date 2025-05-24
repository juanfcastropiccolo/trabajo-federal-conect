
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  private static readonly PROFILE_PICTURES_BUCKET = 'profile-pictures';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  static async uploadProfilePicture(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      // Validar archivo
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return { url: null, error: 'Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF.' };
      }

      if (file.size > this.MAX_FILE_SIZE) {
        return { url: null, error: 'El archivo es muy grande. Máximo 5MB permitido.' };
      }

      // Verificar si el bucket existe, si no, crearlo
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.find(bucket => bucket.name === this.PROFILE_PICTURES_BUCKET);
      
      if (!bucketExists) {
        console.log('🔄 STORAGE - Creando bucket de fotos de perfil...');
        const { error: bucketError } = await supabase.storage.createBucket(this.PROFILE_PICTURES_BUCKET, {
          public: true,
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });
        
        if (bucketError) {
          console.error('❌ STORAGE - Error creando bucket:', bucketError);
          return { url: null, error: 'Error configurando almacenamiento. Inténtalo de nuevo.' };
        }
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      console.log('🔄 STORAGE - Subiendo foto de perfil:', { userId, fileName, size: file.size });

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.PROFILE_PICTURES_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Sobrescribir si ya existe
        });

      if (error) {
        console.error('❌ STORAGE - Error subiendo archivo:', error);
        return { url: null, error: 'Error al subir la imagen. Inténtalo de nuevo.' };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(this.PROFILE_PICTURES_BUCKET)
        .getPublicUrl(fileName);

      console.log('✅ STORAGE - Imagen subida exitosamente:', publicUrl);
      return { url: publicUrl, error: null };

    } catch (error) {
      console.error('❌ STORAGE - Error inesperado:', error);
      return { url: null, error: 'Error inesperado al subir la imagen.' };
    }
  }

  static async deleteProfilePicture(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🔄 STORAGE - Eliminando foto de perfil:', userId);

      const { error } = await supabase.storage
        .from(this.PROFILE_PICTURES_BUCKET)
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`, `${userId}/avatar.gif`]);

      if (error) {
        console.error('❌ STORAGE - Error eliminando archivo:', error);
        return { success: false, error: 'Error al eliminar la imagen.' };
      }

      console.log('✅ STORAGE - Imagen eliminada exitosamente');
      return { success: true, error: null };

    } catch (error) {
      console.error('❌ STORAGE - Error inesperado:', error);
      return { success: false, error: 'Error inesperado al eliminar la imagen.' };
    }
  }

  static getProfilePictureUrl(userId: string, fileName: string = 'avatar'): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.PROFILE_PICTURES_BUCKET)
      .getPublicUrl(`${userId}/${fileName}`);
    
    return publicUrl;
  }
}
