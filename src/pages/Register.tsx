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
import { Briefcase, Users, Building, Mail, Lock, Phone, User } from 'lucide-react';
import { LocationSelector } from '@/components/form/LocationSelector'; 
import { CUITInput } from '@/components/form/CUITInput'; 
import { analytics } from '@/utils/analytics';

// Helper function for class names
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'worker');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track registration form load
  useEffect(() => {
    analytics.trackEvent('registration_form_view', { 
      initial_tab: activeTab 
    });
  }, [activeTab]);

  // Worker form state
  const [workerData, setWorkerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    province: '',
    city: '',
    skills: '',
    bio: ''
  });

  // Company form state - SIMPLIFICADO
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    password: '',
    phone: '',
    cuit: '',
    sector: '',
    province: '',
    city: '',
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

    const startTime = Date.now();
    analytics.trackEvent('registration_attempt', { 
      type: 'worker',
      has_location: !!workerData.city && !!workerData.province
    });

    try {
      await register({
        ...workerData,
        role: 'worker',
        skills: workerData.skills.split(',').map(s => s.trim()),
        location: workerData.city && workerData.province ? `${workerData.city}, ${workerData.province}` : ''
      });
      
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Te enviamos un email de verificación.",
      });
      
      analytics.trackEvent('registration_success', { 
        type: 'worker',
        time_ms: Date.now() - startTime
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu cuenta. Intentá nuevamente.",
        variant: "destructive",
      });
      
      analytics.trackEvent('registration_error', { 
        type: 'worker',
        error: error instanceof Error ? error.message : 'Unknown error',
        time_ms: Date.now() - startTime
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const startTime = Date.now();
    analytics.trackEvent('registration_attempt', { 
      type: 'company',
      has_location: !!companyData.city && !!companyData.province,
      has_cuit: !!companyData.cuit
    });

    try {
      await register({
        ...companyData,
        role: 'company',
        name: companyData.companyName,
        location: companyData.city && companyData.province ? `${companyData.city}, ${companyData.province}` : ''
      });
      
      toast({
        title: "¡Registro exitoso!",
        description: "Tu empresa ha sido registrada. Te enviamos un email de verificación.",
      });
      
      analytics.trackEvent('registration_success', { 
        type: 'company',
        time_ms: Date.now() - startTime
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: "Error",
        description: "Hubo un problema al registrar tu empresa. Intentá nuevamente.",
        variant: "destructive",
      });
      
      analytics.trackEvent('registration_error', { 
        type: 'company',
        error: error instanceof Error ? error.message : 'Unknown error',
        time_ms: Date.now() - startTime
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
                          onChange={(e) => {
                            setWorkerData(prevData => ({...prevData, name: e.target.value}));
                            analytics.trackFormField('worker_registration', 'name', 'change');
                          }}
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
                          onChange={(e) => {
                            setWorkerData(prevData => ({...prevData, phone: e.target.value}));
                            analytics.trackFormField('worker_registration', 'phone', 'change');
                          }}
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
                        onChange={(e) => {
                          setWorkerData(prevData => ({...prevData, email: e.target.value}));
                          analytics.trackFormField('worker_registration', 'email', 'change');
                        }}
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
                        onChange={(e) => {
                          setWorkerData(prevData => ({...prevData, password: e.target.value}));
                          analytics.trackFormField('worker_registration', 'password', 'change');
                        }}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {/* Location Selector Simplificado */}
                  <LocationSelector
                    provinceValue={workerData.province}
                    cityValue={workerData.city}
                    onProvinceChange={(province) => {
                      setWorkerData(prevData => ({...prevData, province}));
                      analytics.trackFormField('worker_registration', 'province', 'select', province);
                    }}
                    onCityChange={(city) => {
                      setWorkerData(prevData => ({...prevData, city}));
                      analytics.trackFormField('worker_registration', 'city', 'change', city);
                    }}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="worker-skills">Habilidades u Oficios</Label>
                    <Input
                      id="worker-skills"
                      placeholder="Limpieza, Atención al cliente, Manejo de herramientas..."
                      value={workerData.skills}
                      onChange={(e) => {
                        setWorkerData(prevData => ({...prevData, skills: e.target.value}));
                        analytics.trackFormField('worker_registration', 'skills', 'change');
                      }}
                    />
                    <p className="text-xs text-gray-500">Separalas con comas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worker-bio">Contanos sobre vos (opcional)</Label>
                    <Textarea
                      id="worker-bio"
                      placeholder="Experiencia previa, disponibilidad horaria, etc."
                      value={workerData.bio}
                      onChange={(e) => {
                        setWorkerData(prevData => ({...prevData, bio: e.target.value}));
                        analytics.trackFormField('worker_registration', 'bio', 'change');
                      }}
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
                  {/* CUIT Input Simplificado */}
                  <CUITInput
                    value={companyData.cuit}
                    onChange={(value) => {
                      setCompanyData(prevData => ({ ...prevData, cuit: value }));
                      analytics.trackFormField('company_registration', 'cuit', 'change', value);
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nombre de la Empresa</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-name"
                          placeholder="Mi Empresa SA"
                          value={companyData.companyName}
                          onChange={(e) => {
                            setCompanyData(prevData => ({...prevData, companyName: e.target.value}));
                            analytics.trackFormField('company_registration', 'companyName', 'change');
                          }}
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
                          onChange={(e) => {
                            setCompanyData(prevData => ({...prevData, phone: e.target.value}));
                            analytics.trackFormField('company_registration', 'phone', 'change');
                          }}
                          className="pl-10"
                          required
                        />
                      </div>
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
                          onChange={(e) => {
                            setCompanyData(prevData => ({...prevData, email: e.target.value}));
                            analytics.trackFormField('company_registration', 'email', 'change');
                          }}
                          className="pl-10"
                          required
                        />
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
                          onChange={(e) => {
                            setCompanyData(prevData => ({...prevData, password: e.target.value}));
                            analytics.trackFormField('company_registration', 'password', 'change');
                          }}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Selector Simplificado */}
                  <LocationSelector
                    provinceValue={companyData.province}
                    cityValue={companyData.city}
                    onProvinceChange={(province) => {
                      setCompanyData(prevData => ({...prevData, province}));
                      analytics.trackFormField('company_registration', 'province', 'select', province);
                    }}
                    onCityChange={(city) => {
                      setCompanyData(prevData => ({...prevData, city}));
                      analytics.trackFormField('company_registration', 'city', 'change', city);
                    }}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="company-sector">Sector</Label>
                    <Select value={companyData.sector} onValueChange={(value) => {
                      setCompanyData(prevData => ({...prevData, sector: value}));
                      analytics.trackFormField('company_registration', 'sector', 'select', value);
                    }}>
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
                    <Label htmlFor="company-description">Descripción de la Empresa</Label>
                    <Textarea
                      id="company-description"
                      placeholder="Contanos sobre tu empresa, qué hacen, cuántos empleados tienen..."
                      value={companyData.description}
                      onChange={(e) => {
                        setCompanyData(prevData => ({...prevData, description: e.target.value}));
                        analytics.trackFormField('company_registration', 'description', 'change');
                      }}
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