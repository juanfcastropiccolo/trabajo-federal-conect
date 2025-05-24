
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Building,
  Users,
  CheckCircle,
  Star,
  ArrowLeft,
  MessageSquare,
  Share
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, applications, applyToJob } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const job = jobs.find(j => j.id === id);
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Empleo no encontrado</h1>
            <p className="text-gray-600 mb-6">El empleo que buscás no existe o ya no está disponible.</p>
            <Link to="/trabajos">
              <Button>Volver a Empleos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userApplications = applications.filter(app => app.userId === user?.id);
  const isApplied = userApplications.some(app => app.jobId === job.id);
  const jobApplications = applications.filter(app => app.jobId === job.id);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'worker') {
      toast({
        title: "Error",
        description: "Solo los trabajadores pueden postularse a empleos.",
        variant: "destructive",
      });
      return;
    }

    // Registrar postulación localmente
    applyToJob(job.id, user.id);
    // Enviar webhook a n8n para disparar envío de emails
    fetch('https://energia.app.n8n.cloud/webhook-test/872b4da2-51b4-44dc-8568-75e9e9b4125e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.company?.name,
        applicantId: user.id,
        applicantName: user.profile.name,
        applicantEmail: user.email
      })
    }).catch(error => console.error('Webhook n8n error:', error));
    // Notificar al usuario
    toast({
      title: "¡Postulación enviada!",
      description: "Tu postulación ha sido enviada exitosamente. La empresa recibirá una notificación.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Mirá esta oportunidad laboral: ${job.title} en ${job.company?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del empleo ha sido copiado al portapapeles.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/trabajos" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Volver a empleos
          </Link>
          <span>/</span>
          <span>{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={job.company?.avatar} />
                          <AvatarFallback>{job.company?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-blue-600 font-medium text-lg">{job.company?.name}</span>
                      </div>
                      <Badge variant="secondary">{job.category}</Badge>
                      <Badge 
                        className={job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {job.status === 'open' ? 'Activo' : 'Cerrado'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share className="w-4 h-4 mr-1" />
                      Compartir
                    </Button>
                  </div>
                </div>

                {/* Job Meta Info */}
                <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                  </div>
                  
                  {job.salaryFrom && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Salario</p>
                        <p className="font-medium">
                          ${job.salaryFrom.toLocaleString()}
                          {job.salaryTo && ` - $${job.salaryTo.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Modalidad</p>
                      <p className="font-medium">
                        {job.contractType === 'full-time' ? 'Tiempo Completo' : 
                         job.contractType === 'part-time' ? 'Medio Tiempo' : 
                         job.contractType === 'contract' ? 'Por Contrato' : 
                         job.contractType === 'temporary' ? 'Temporal' : job.contractType}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Publicado</p>
                      <p className="font-medium">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <Card>
              <CardContent className="p-6">
                {user?.role === 'worker' ? (
                  <div className="space-y-4">
                    {isApplied ? (
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-800 mb-2">
                          ¡Ya te postulaste!
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Tu postulación ha sido enviada. La empresa se pondrá en contacto contigo pronto.
                        </p>
                        <Link to="/mensajes">
                          <Button variant="outline" className="w-full">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Ver Mensajes
                          </Button>
                        </Link>
                      </div>
                    ) : job.status === 'open' ? (
                      <div>
                        <h3 className="font-semibold text-xl text-center mb-4">
                          ¿Te interesa este empleo?
                        </h3>
                        <Button 
                          onClick={handleApply} 
                          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                        >
                          Postularme Ahora
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Tu postulación será enviada directamente a la empresa
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-2">Esta oferta está cerrada</p>
                        <Link to="/trabajos">
                          <Button variant="outline" className="w-full">
                            Ver Otros Empleos
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : user?.role === 'company' ? (
                  <div className="text-center">
                    <Building className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                    <p className="text-gray-600">Sos una empresa</p>
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full mt-2">
                        Ir a Mi Panel
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Tenés que iniciar sesión para postularte
                    </p>
                    <Link to="/login">
                      <Button className="w-full">Iniciar Sesión</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Sobre la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.company?.avatar} />
                    <AvatarFallback>{job.company?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{job.company?.name}</h3>
                    <p className="text-sm text-gray-600">{job.company?.sector}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Empleos activos</span>
                    <span className="font-medium">
                      {jobs.filter(j => j.companyId === job.companyId && j.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Postulaciones</span>
                    <span className="font-medium">{jobApplications.length}</span>
                  </div>
                </div>

                <Link to={`/empresa/${job.companyId}`}>
                  <Button variant="outline" className="w-full">
                    Ver Perfil de la Empresa
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Postulaciones</span>
                  <span className="font-medium">{jobApplications.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vistas del empleo</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiempo promedio de respuesta</span>
                  <span className="font-medium">2 días</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
