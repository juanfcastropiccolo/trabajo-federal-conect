
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Building, MapPin, Phone, Mail, Edit, Save, X, Plus } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    name: user?.profile.name || '',
    email: user?.email || '',
    phone: user?.profile.phone || '',
    location: user?.profile.location || '',
    bio: user?.profile.bio || '',
    skills: user?.profile.skills || [],
    cuit: user?.profile.cuit || '',
    sector: user?.profile.sector || ''
  });

  if (!user) return null;

  const handleSave = () => {
    // In a real app, this would update the user in the backend
    toast({
      title: "Perfil actualizado",
      description: "Tus cambios han sido guardados exitosamente.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.profile.name || '',
      email: user.email || '',
      phone: user.profile.phone || '',
      location: user.profile.location || '',
      bio: user.profile.bio || '',
      skills: user.profile.skills || [],
      cuit: user.profile.cuit || '',
      sector: user.profile.sector || ''
    });
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestioná tu información personal y profesional</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={user.profile.avatar} alt={user.profile.name} />
                <AvatarFallback className="text-2xl">
                  {user.role === 'company' ? (
                    <Building className="w-16 h-16" />
                  ) : (
                    <User className="w-16 h-16" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {user.profile.name}
              </h2>
              
              <Badge className={user.role === 'company' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                {user.role === 'company' ? 'Empresa' : 'Trabajador'}
              </Badge>
              
              {user.profile.location && (
                <p className="text-gray-600 flex items-center justify-center gap-1 mt-2">
                  <MapPin className="w-4 h-4" />
                  {user.profile.location}
                </p>
              )}

              <Button variant="outline" className="w-full mt-4">
                <Edit className="w-4 h-4 mr-2" />
                Cambiar Foto
              </Button>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Información Personal</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {user.role === 'company' ? 'Nombre de la Empresa' : 'Nombre Completo'}
                    </Label>
                    <div className="relative">
                      {user.role === 'company' ? (
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      ) : (
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      )}
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {user.role === 'company' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cuit">CUIT</Label>
                      <Input
                        id="cuit"
                        value={formData.cuit}
                        onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                        disabled={!isEditing}
                        placeholder="20-12345678-9"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Select 
                        value={formData.sector} 
                        onValueChange={(value) => setFormData({...formData, sector: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar sector" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="retail">Retail/Comercio</SelectItem>
                          <SelectItem value="gastronomia">Gastronomía</SelectItem>
                          <SelectItem value="logistica">Logística</SelectItem>
                          <SelectItem value="servicios">Servicios</SelectItem>
                          <SelectItem value="construccion">Construcción</SelectItem>
                          <SelectItem value="limpieza">Limpieza</SelectItem>
                          <SelectItem value="seguridad">Seguridad</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {user.role === 'company' ? 'Descripción de la Empresa' : 'Sobre Mí'}
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    placeholder={
                      user.role === 'company' 
                        ? "Contanos sobre tu empresa, qué hacen, cuántos empleados tienen..."
                        : "Contanos sobre tu experiencia, disponibilidad horaria, etc."
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills Section for Workers */}
            {user.role === 'worker' && (
              <Card>
                <CardHeader>
                  <CardTitle>Habilidades y Oficios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="relative group">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Agregar habilidad..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button onClick={addSkill} disabled={!newSkill.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {formData.skills.length === 0 && !isEditing && (
                    <p className="text-gray-500 text-sm">
                      No has agregado habilidades aún. Hace clic en "Editar" para agregar.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Estado del Email</h4>
                    <p className="text-sm text-gray-600">
                      {user.emailVerified ? 'Email verificado' : 'Email sin verificar'}
                    </p>
                  </div>
                  {!user.emailVerified && (
                    <Button variant="outline" size="sm">
                      Verificar Email
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Cambiar Contraseña</h4>
                    <p className="text-sm text-gray-600">
                      Actualizá tu contraseña por seguridad
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Cambiar
                  </Button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-red-600">Eliminar Cuenta</h4>
                    <p className="text-sm text-gray-600">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
