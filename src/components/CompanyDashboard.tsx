
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
import { User, Job, Application } from '../types';
import { useData } from '../contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
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
  Archive
} from 'lucide-react';

interface CompanyDashboardProps {
  user: User;
  jobs: Job[];
  applications: Application[];
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ user, jobs, applications }) => {
  const { createJob, updateJobStatus } = useData();
  const { toast } = useToast();
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    category: '',
    salaryFrom: '',
    salaryTo: '',
    contractType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'temporary',
    location: '',
    requirements: '',
    benefits: ''
  });

  // Get company's jobs
  const companyJobs = jobs.filter(job => job.companyId === user.id);
  
  // Get applications for company jobs
  const companyApplications = applications.filter(app => 
    companyJobs.some(job => job.id === app.jobId)
  );

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      ...newJob,
      companyId: user.id,
      salaryFrom: newJob.salaryFrom ? parseInt(newJob.salaryFrom) : undefined,
      salaryTo: newJob.salaryTo ? parseInt(newJob.salaryTo) : undefined,
      requirements: newJob.requirements.split(',').map(r => r.trim()),
      benefits: newJob.benefits.split(',').map(b => b.trim()),
      status: 'open' as const,
      company: {
        name: user.profile.name,
        avatar: user.profile.avatar || '',
        sector: user.profile.sector || 'General'
      }
    };

    createJob(jobData);
    
    toast({
      title: "¡Empleo publicado!",
      description: "Tu oferta laboral ha sido publicada exitosamente.",
    });

    setIsCreateJobOpen(false);
    setNewJob({
      title: '',
      description: '',
      category: '',
      salaryFrom: '',
      salaryTo: '',
      contractType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'temporary',
      location: '',
      requirements: '',
      benefits: ''
    });
  };

  const getJobStats = (jobId: string) => {
    const jobApplications = applications.filter(app => app.jobId === jobId);
    return {
      total: jobApplications.length,
      pending: jobApplications.filter(app => app.status === 'pending').length,
      viewed: jobApplications.filter(app => app.status === 'viewed').length,
      contacted: jobApplications.filter(app => app.status === 'contacted').length
    };
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
                    <Label htmlFor="job-category">Categoría</Label>
                    <Select value={newJob.category} onValueChange={(value) => setNewJob({...newJob, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="logistica">Logística</SelectItem>
                        <SelectItem value="limpieza">Limpieza</SelectItem>
                        <SelectItem value="gastronomia">Gastronomía</SelectItem>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="seguridad">Seguridad</SelectItem>
                        <SelectItem value="construccion">Construcción</SelectItem>
                        <SelectItem value="administracion">Administración</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary-from">Salario Desde</Label>
                    <Input
                      id="salary-from"
                      type="number"
                      placeholder="80000"
                      value={newJob.salaryFrom}
                      onChange={(e) => setNewJob({...newJob, salaryFrom: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary-to">Salario Hasta</Label>
                    <Input
                      id="salary-to"
                      type="number"
                      placeholder="120000"
                      value={newJob.salaryTo}
                      onChange={(e) => setNewJob({...newJob, salaryTo: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contract-type">Tipo de Contrato</Label>
                    <Select 
                      value={newJob.contractType} 
                      onValueChange={(value: 'full-time' | 'part-time' | 'contract' | 'temporary') => 
                        setNewJob({...newJob, contractType: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="full-time">Tiempo Completo</SelectItem>
                        <SelectItem value="part-time">Medio Tiempo</SelectItem>
                        <SelectItem value="contract">Por Contrato</SelectItem>
                        <SelectItem value="temporary">Temporal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-location">Ubicación</Label>
                  <Input
                    id="job-location"
                    placeholder="Ciudad, Provincia"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-requirements">Requisitos</Label>
                  <Textarea
                    id="job-requirements"
                    placeholder="Separalos con comas: Puntualidad, Trabajo en equipo, Disponibilidad horaria..."
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-benefits">Beneficios</Label>
                  <Textarea
                    id="job-benefits"
                    placeholder="Separalos con comas: Obra social, Vacaciones pagas, Capacitación..."
                    value={newJob.benefits}
                    onChange={(e) => setNewJob({...newJob, benefits: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Publicar Oferta
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
                <p className="text-2xl font-bold">{companyApplications.length}</p>
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
                <p className="text-2xl font-bold">
                  {companyApplications.filter(a => a.status === 'contacted').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {companyApplications.filter(a => a.status === 'hired').length}
                </p>
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
              {companyJobs.length === 0 ? (
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
                  {companyJobs.map((job) => {
                    const stats = getJobStats(job.id);
                    
                    return (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                              {job.salaryFrom && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${job.salaryFrom.toLocaleString()}
                                  {job.salaryTo && ` - $${job.salaryTo.toLocaleString()}`}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {job.contractType === 'full-time' ? 'Tiempo Completo' : 
                                 job.contractType === 'part-time' ? 'Medio Tiempo' : 
                                 job.contractType}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={job.status === 'open' ? 'default' : 'secondary'}
                              className={job.status === 'open' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {job.status === 'open' ? 'Activo' : 'Cerrado'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-xs text-gray-600">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-xs text-gray-600">Nuevas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.viewed}</div>
                            <div className="text-xs text-gray-600">Vistas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.contacted}</div>
                            <div className="text-xs text-gray-600">En Proceso</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link to={`/trabajo/${job.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Detalles
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateJobStatus(job.id, job.status === 'open' ? 'closed' : 'open')}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            {job.status === 'open' ? 'Pausar' : 'Activar'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Candidatos ({stats.total})
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
