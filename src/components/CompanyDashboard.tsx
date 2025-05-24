import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '../types';
import { useCreateJob, useCompanyJobs } from '../hooks/useJobs';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  MessageSquare, 
  Building, 
  TrendingUp,
  MapPin,
  DollarSign,
  Clock,
  Edit,
  Archive,
  Loader2
} from 'lucide-react';

interface CompanyDashboardProps {
  user: User;
  jobs: any[];
  applications: any[];
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ user }) => {
  const createJobMutation = useCreateJob();
  const { data: companyJobs = [], isLoading: jobsLoading } = useCompanyJobs(user.id);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_min: '',
    salary_max: '',
    work_type: 'full_time' as 'full_time' | 'part_time' | 'contract' | 'temporary',
    location_type: 'on_site' as 'on_site' | 'remote' | 'hybrid',
    province: '',
    city: '',
    address: '',
    positions_available: '1',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createJobMutation.mutateAsync({
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.requirements || undefined,
        responsibilities: newJob.responsibilities || undefined,
        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : undefined,
        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : undefined,
        work_type: newJob.work_type,
        location_type: newJob.location_type,
        province: newJob.province || undefined,
        city: newJob.city || undefined,
        address: newJob.address || undefined,
        positions_available: parseInt(newJob.positions_available),
        urgency: newJob.urgency
      });

      setIsCreateJobOpen(false);
      setNewJob({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        salary_min: '',
        salary_max: '',
        work_type: 'full_time',
        location_type: 'on_site',
        province: '',
        city: '',
        address: '',
        positions_available: '1',
        urgency: 'medium'
      });
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de {user.profile.name}
            </h1>
            <p className="text-gray-600">Gestioná tus ofertas laborales y candidatos</p>
          </div>
          
          <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Publicar Empleo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Oferta Laboral</DialogTitle>
                <DialogDescription>
                  Completá la información del puesto para atraer a los mejores candidatos
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Título del Puesto</Label>
                    <Input
                      id="job-title"
                      placeholder="Ej: Operario de Depósito"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work-type">Tipo de Trabajo</Label>
                    <Select 
                      value={newJob.work_type} 
                      onValueChange={(value: 'full_time' | 'part_time' | 'contract' | 'temporary') => 
                        setNewJob({...newJob, work_type: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="full_time">Tiempo Completo</SelectItem>
                        <SelectItem value="part_time">Medio Tiempo</SelectItem>
                        <SelectItem value="contract">Por Contrato</SelectItem>
                        <SelectItem value="temporary">Temporal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-description">Descripción del Puesto</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Describí las tareas principales, el ambiente de trabajo..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-requirements">Requisitos</Label>
                  <Textarea
                    id="job-requirements"
                    placeholder="Describí los requisitos necesarios para el puesto..."
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary-min">Salario Mínimo</Label>
                    <Input
                      id="salary-min"
                      type="number"
                      placeholder="80000"
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob({...newJob, salary_min: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Salario Máximo</Label>
                    <Input
                      id="salary-max"
                      type="number"
                      placeholder="120000"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob({...newJob, salary_max: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      placeholder="Buenos Aires"
                      value={newJob.province}
                      onChange={(e) => setNewJob({...newJob, province: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      placeholder="Ciudad Autónoma de Buenos Aires"
                      value={newJob.city}
                      onChange={(e) => setNewJob({...newJob, city: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-type">Modalidad</Label>
                  <Select 
                    value={newJob.location_type} 
                    onValueChange={(value: 'on_site' | 'remote' | 'hybrid') => 
                      setNewJob({...newJob, location_type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="on_site">Presencial</SelectItem>
                      <SelectItem value="remote">Remoto</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      'Publicar Oferta'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateJobOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{companyJobs.length}</p>
                <p className="text-gray-600 text-sm">Empleos Publicados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-gray-600 text-sm">Postulaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-gray-600 text-sm">En Proceso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-gray-600 text-sm">Contratados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Company Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Perfil de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profile.avatar} alt={user.profile.name} />
                <AvatarFallback className="text-lg">{user.profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{user.profile.name}</h3>
                {user.profile.sector && (
                  <Badge variant="secondary">{user.profile.sector}</Badge>
                )}
                {user.profile.location && (
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {user.profile.location}
                  </p>
                )}
              </div>
            </div>

            {user.profile.bio && (
              <p className="text-gray-700 text-sm">{user.profile.bio}</p>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CUIT:</span>
                <span className="text-sm font-medium">{user.profile.cuit || 'No especificado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Teléfono:</span>
                <span className="text-sm font-medium">{user.profile.phone}</span>
              </div>
            </div>

            <Link to="/perfil">
              <Button className="w-full" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Ofertas Laborales</CardTitle>
              <CardDescription>
                Gestioná tus publicaciones y candidatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : companyJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aún no publicaste ningún empleo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Creá tu primera oferta laboral para empezar a recibir candidatos
                  </p>
                  <Button onClick={() => setIsCreateJobOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Primer Empleo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {job.city && job.province && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.city}, {job.province}
                              </span>
                            )}
                            {job.salary_min && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${job.salary_min.toLocaleString()}
                                {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {job.work_type === 'full_time' ? 'Tiempo Completo' : 
                               job.work_type === 'part_time' ? 'Medio Tiempo' : 
                               job.work_type}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant={job.status === 'published' ? 'default' : 'secondary'}
                          className={job.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {job.status === 'published' ? 'Activo' : 'Pausado'}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/trabajo/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
