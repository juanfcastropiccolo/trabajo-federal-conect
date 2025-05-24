
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Clock, Filter, Briefcase, Loader2 } from 'lucide-react';
import { useJobs, useApplyToJob, useUserApplications } from '../hooks/useJobs';

const Jobs = () => {
  const { data: jobs = [], isLoading } = useJobs();
  const applyMutation = useApplyToJob();
  const { user } = useAuth();
  const { data: userApplications = [] } = useUserApplications(user?.id || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_profiles?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || 
                           (job.province && job.province.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchesWorkType = workTypeFilter === 'all' || job.work_type === workTypeFilter;
    const matchesLocationType = locationTypeFilter === 'all' || job.location_type === locationTypeFilter;

    return matchesSearch && matchesLocation && matchesWorkType && matchesLocationType;
  });

  const handleApply = async (jobId: string) => {
    if (user && user.role === 'worker') {
      try {
        await applyMutation.mutateAsync({ jobId });
      } catch (error) {
        console.error('Error applying to job:', error);
      }
    }
  };

  const isApplied = (jobId: string) => {
    return userApplications.some(app => app.job_post_id === jobId);
  };

  const provinces = [...new Set(jobs.map(job => job.province).filter(Boolean))];
  const workTypes = [...new Set(jobs.map(job => job.work_type))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorar Empleos</h1>
          <p className="text-gray-600">Encontrá la oportunidad laboral perfecta para vos</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, empresa o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Provincia" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todas las provincias</SelectItem>
                  {provinces.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de trabajo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="full-time">Tiempo Completo</SelectItem>
                  <SelectItem value="part-time">Medio Tiempo</SelectItem>
                  <SelectItem value="contract">Por Contrato</SelectItem>
                  <SelectItem value="temporary">Temporal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Modalidad" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todas las modalidades</SelectItem>
                  <SelectItem value="onsite">Presencial</SelectItem>
                  <SelectItem value="remote">Remoto</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            {isLoading ? 'Cargando...' : `${filteredJobs.length} empleos encontrados`}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <Select defaultValue="newest">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="salary">Mejor salario</SelectItem>
                <SelectItem value="location">Ubicación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron empleos
                </h3>
                <p className="text-gray-600 mb-4">
                  Intentá ajustar tus filtros o buscar con otros términos
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('all');
                    setWorkTypeFilter('all');
                    setLocationTypeFilter('all');
                  }}
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600 font-medium">
                              {job.company_profiles?.company_name}
                            </span>
                            <Badge variant="secondary">
                              {job.location_type === 'onsite' ? 'Presencial' :
                               job.location_type === 'remote' ? 'Remoto' : 
                               job.location_type === 'hybrid' ? 'Híbrido' : job.location_type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/trabajo/${job.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Detalles
                            </Button>
                          </Link>
                          
                          {user?.role === 'worker' && (
                            <Button 
                              size="sm"
                              onClick={() => handleApply(job.id)}
                              disabled={isApplied(job.id) || applyMutation.isPending}
                              className={isApplied(job.id) ? 'bg-gray-400' : ''}
                            >
                              {applyMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isApplied(job.id) ? 'Ya Postulado' : 'Postularme'}
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {job.city && job.province && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.city}, {job.province}
                          </div>
                        )}
                        {job.salary_min && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${job.salary_min.toLocaleString()}
                            {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.work_type === 'full-time' ? 'Tiempo Completo' : 
                           job.work_type === 'part-time' ? 'Medio Tiempo' : 
                           job.work_type === 'contract' ? 'Por Contrato' : 
                           job.work_type === 'temporary' ? 'Temporal' : job.work_type}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Publicado el {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        {isApplied(job.id) && (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ Postulado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More (placeholder) */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Cargar más empleos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
