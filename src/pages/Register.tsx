
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Users, Building, Mail, Lock, Phone, MapPin, User } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'worker');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [workerData, setWorkerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    skills: '',
    bio: ''
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    password: '',
    phone: '',
    cuit: '',
    sector: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && (type === 'worker' || type === 'company')) {
      setActiveTab(type);
    }
  }, [searchParams]);

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({
        ...workerData,
        role: 'worker',
        skills: workerData.skills.split(',').map(s => s.trim())
      });
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Te enviamos un email de verificación.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu cuenta. Intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({
        ...companyData,
        role: 'company',
        name: companyData.companyName
      });
      toast({
        title: "¡Registro exitoso!",
        description: "Tu empresa ha sido registrada. Te enviamos un email de verificación.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al registrar tu empresa. Intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Red Federal</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
            <CardDescription>
              Elegí el tipo de cuenta que necesitás para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="worker" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Trabajador
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Empresa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="worker" className="space-y-4 mt-6">
                <form onSubmit={handleWorkerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="worker-name">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="worker-name"
                          placeholder="Juan Pérez"
                          value={workerData.name}
                          onChange={(e) => setWorkerData({...workerData, name: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="worker-phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="worker-phone"
                          placeholder="+54 11 1234-5678"
                          value={workerData.phone}
                          onChange={(e) => setWorkerData({...workerData, phone: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worker-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="worker-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={workerData.email}
                        onChange={(e) => setWorkerData({...workerData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worker-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="worker-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={workerData.password}
                        onChange={(e) => setWorkerData({...workerData, password: e.target.value})}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worker-location">Ubicación</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="worker-location"
                        placeholder="Ciudad, Provincia"
                        value={workerData.location}
                        onChange={(e) => setWorkerData({...workerData, location: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worker-skills">Habilidades u Oficios</Label>
                    <Input
                      id="worker-skills"
                      placeholder="Limpieza, Atención al cliente, Manejo de herramientas..."
                      value={workerData.skills}
                      onChange={(e) => setWorkerData({...workerData, skills: e.target.value})}
                    />
                    <p className="text-xs text-gray-500">Separalas con comas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worker-bio">Contanos sobre vos (opcional)</Label>
                    <Textarea
                      id="worker-bio"
                      placeholder="Experiencia previa, disponibilidad horaria, etc."
                      value={workerData.bio}
                      onChange={(e) => setWorkerData({...workerData, bio: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta como Trabajador"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="company" className="space-y-4 mt-6">
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nombre de la Empresa</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-name"
                          placeholder="Mi Empresa SA"
                          value={companyData.companyName}
                          onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-cuit">CUIT</Label>
                      <Input
                        id="company-cuit"
                        placeholder="20-12345678-9"
                        value={companyData.cuit}
                        onChange={(e) => setCompanyData({...companyData, cuit: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email Corporativo</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-email"
                          type="email"
                          placeholder="contacto@miempresa.com"
                          value={companyData.email}
                          onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-phone"
                          placeholder="+54 11 1234-5678"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={companyData.password}
                        onChange={(e) => setCompanyData({...companyData, password: e.target.value})}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-sector">Sector</Label>
                      <Select value={companyData.sector} onValueChange={(value) => setCompanyData({...companyData, sector: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná un sector" />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-location">Ubicación</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-location"
                          placeholder="Ciudad, Provincia"
                          value={companyData.location}
                          onChange={(e) => setCompanyData({...companyData, location: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-description">Descripción de la Empresa</Label>
                    <Textarea
                      id="company-description"
                      placeholder="Contanos sobre tu empresa, qué hacen, cuántos empleados tienen..."
                      value={companyData.description}
                      onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Registrar Empresa"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿Ya tenés cuenta? </span>
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Iniciá sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
