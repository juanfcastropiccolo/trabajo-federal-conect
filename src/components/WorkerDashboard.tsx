
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Job, Application } from '../types';
import { useData } from '../contexts/DataContext';
import { MapPin, DollarSign, Clock, Briefcase, User as UserIcon, Star, MessageSquare, Eye } from 'lucide-react';

interface WorkerDashboardProps {
  user: User;
  jobs: Job[];
  applications: Application[];
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user, jobs, applications }) => {
  const { applyToJob } = useData();
  
  // Calculate profile completion
  const profileFields = [
    user.profile.name,
    user.profile.location,
    user.profile.phone,
    user.profile.bio,
    user.profile.skills?.length,
    user.profile.avatar
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  // Get user's applications
  const userApplications = applications.filter(app => app.userId === user.id);
  
  // Get recommended jobs (mock logic)
  const recommendedJobs = jobs.slice(0, 3);

  const handleApply = (jobId: string) => {
    applyToJob(jobId, user.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'viewed': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'viewed': return 'Vista';
      case 'contacted': return 'Contactado';
      case 'hired': return 'Contratado';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Hola, {user.profile.name}!
        </h1>
        <p className="text-gray-600">Bienvenido a tu panel de control. Acá podés gestionar tu perfil y postulaciones.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Mi Perfil
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
                  {user.profile.location && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.profile.location}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Perfil completado</span>
                  <span className="text-sm text-gray-600">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>

              {user.profile.skills && user.profile.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Habilidades</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.profile.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.profile.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.profile.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Link to="/perfil">
                <Button className="w-full" variant="outline">
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Postulaciones enviadas</span>
                <span className="font-semibold">{userApplications.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Perfil visto</span>
                <span className="font-semibold">12 veces</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Entrevistas</span>
                <span className="font-semibold">
                  {userApplications.filter(a => a.status === 'contacted').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Jobs & Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/trabajos">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">Buscar Empleos</h3>
                  <p className="text-sm text-gray-600">Explorá nuevas oportunidades</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/mensajes">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">Mensajes</h3>
                  <p className="text-sm text-gray-600">Conversaciones activas</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/perfil">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold">Mejorar Perfil</h3>
                  <p className="text-sm text-gray-600">Aumentá tus chances</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recommended Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Empleos Recomendados</CardTitle>
              <CardDescription>
                Basado en tu perfil y habilidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-blue-600 font-medium">{job.company?.name}</p>
                    </div>
                    <Badge variant="secondary">{job.category}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    {job.salaryFrom && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ${job.salaryFrom.toLocaleString()} - ${job.salaryTo?.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {job.contractType === 'full-time' ? 'Tiempo Completo' : 
                       job.contractType === 'part-time' ? 'Medio Tiempo' : 
                       job.contractType}
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
                      size="sm" 
                      onClick={() => handleApply(job.id)}
                      disabled={userApplications.some(app => app.jobId === job.id)}
                    >
                      {userApplications.some(app => app.jobId === job.id) ? 'Ya Postulado' : 'Postularme'}
                    </Button>
                  </div>
                </div>
              ))}
              
              <Link to="/trabajos">
                <Button variant="outline" className="w-full">
                  Ver Todos los Empleos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* My Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Postulaciones</CardTitle>
              <CardDescription>
                Estado de tus postulaciones recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aún no te postulaste a ningún empleo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comenzá a explorar oportunidades laborales
                  </p>
                  <Link to="/trabajos">
                    <Button>Buscar Empleos</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userApplications.slice(0, 5).map((application) => {
                    const job = jobs.find(j => j.id === application.jobId);
                    if (!job) return null;
                    
                    return (
                      <div key={application.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company?.name}</p>
                          <p className="text-xs text-gray-500">
                            Aplicado el {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                    );
                  })}
                  
                  {userApplications.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm">
                        Ver todas ({userApplications.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
