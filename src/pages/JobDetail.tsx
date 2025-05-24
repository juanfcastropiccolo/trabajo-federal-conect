
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { useApplyToJob, useUserApplications } from '../hooks/useJobs';
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
  Share,
  Loader2
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const applyMutation = useApplyToJob();
  const { data: userApplications = [] } = useUserApplications(user?.id || '');

  // Fetch job details from Supabase
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await jobService.supabase
        .from('job_posts')
        .select(`
          *,
          company_profiles (
            company_name,
            logo_url,
            industry,
            description,
            user_id
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando empleo...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
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

  const isApplied = userApplications.some(app => app.job_post_id === job.id);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'worker') {
      toast({
        title: "Error",
        description: "Solo los trabajadores pueden postularse a empleos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await applyMutation.mutateAsync({ jobId: job.id });
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Mirá esta oportunidad laboral: ${job.title} en ${job.company_profiles?.company_name}`,
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
                          <AvatarImage src={job.company_profiles?.logo_url} />
                          <AvatarFallback>{job.company_profiles?.company_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-blue-600 font-medium text-lg">{job.company_profiles?.company_name}</span>
                      </div>
                      <Badge variant="secondary">
                        {job.location_type === 'on_site' ? 'Presencial' :
                         job.location_type === 'remote' ? 'Remoto' : 
                         job.location_type === 'hybrid' ? 'Híbrido' : job.location_type}
                      </Badge>
                      <Badge 
                        className={job.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {job.status === 'published' ? 'Activo' : 'Cerrado'}
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
                      <p className="font-medium">
                        {job.city && job.province ? `${job.city}, ${job.province}` : 
                         job.province || job.city || 'No especificada'}
                      </p>
                    </div>
                  </div>
                  
                  {job.salary_min && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Salario</p>
                        <p className="font-medium">
                          ${job.salary_min.toLocaleString()}
                          {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Modalidad</p>
                      <p className="font-medium">
                        {job.work_type === 'full_time' ? 'Tiempo Completo' : 
                         job.work_type === 'part_time' ? 'Medio Tiempo' : 
                         job.work_type === 'contract' ? 'Por Contrato' : 
                         job.work_type === 'temporary' ? 'Temporal' : job.work_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Publicado</p>
                      <p className="font-medium">
                        {new Date(job.created_at).toLocaleDateString()}
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

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsabilidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{resp}</span>
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
                {user?.user_type === 'worker' ? (
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
                    ) : job.status === 'published' ? (
                      <div>
                        <h3 className="font-semibold text-xl text-center mb-4">
                          ¿Te interesa este empleo?
                        </h3>
                        <Button 
                          onClick={handleApply} 
                          disabled={applyMutation.isPending}
                          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                        >
                          {applyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
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
                ) : user?.user_type === 'company' ? (
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
                    <AvatarImage src={job.company_profiles?.logo_url} />
                    <AvatarFallback>{job.company_profiles?.company_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{job.company_profiles?.company_name}</h3>
                    <p className="text-sm text-gray-600">{job.company_profiles?.industry}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posiciones disponibles</span>
                    <span className="font-medium">{job.positions_available || 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Urgencia</span>
                    <Badge variant={job.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                      {job.urgency === 'low' ? 'Baja' :
                       job.urgency === 'medium' ? 'Media' :
                       job.urgency === 'high' ? 'Alta' :
                       job.urgency === 'urgent' ? 'Urgente' : job.urgency}
                    </Badge>
                  </div>
                </div>

                {job.company_profiles?.user_id && (
                  <Link to={`/empresa/${job.company_profiles.user_id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Perfil de la Empresa
                    </Button>
                  </Link>
                )}
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
                  <span className="font-medium">{job.applications_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vistas del empleo</span>
                  <span className="font-medium">{job.views_count || 0}</span>
                </div>
                {job.application_deadline && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha límite</span>
                    <span className="font-medium">
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
