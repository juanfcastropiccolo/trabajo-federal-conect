
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Clock, Filter, Briefcase } from 'lucide-react';

const Jobs = () => {
  const { jobs, applyToJob, applications } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');

  const userApplications = applications.filter(app => app.userId === user?.id);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCategory = !categoryFilter || job.category === categoryFilter;
    const matchesContractType = !contractTypeFilter || job.contractType === contractTypeFilter;

    return matchesSearch && matchesLocation && matchesCategory && matchesContractType && job.status === 'open';
  });

  const handleApply = (jobId: string) => {
    if (user) {
      applyToJob(jobId, user.id);
    }
  };

  const isApplied = (jobId: string) => {
    return userApplications.some(app => app.jobId === jobId);
  };

  const categories = [...new Set(jobs.map(job => job.category))];
  const locations = [...new Set(jobs.map(job => job.location.split(',')[1]?.trim() || job.location))];

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
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="">Todas las ubicaciones</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de trabajo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="full-time">Tiempo Completo</SelectItem>
                  <SelectItem value="part-time">Medio Tiempo</SelectItem>
                  <SelectItem value="contract">Por Contrato</SelectItem>
                  <SelectItem value="temporary">Temporal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            {filteredJobs.length} empleos encontrados
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
          {filteredJobs.length === 0 ? (
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
                    setLocationFilter('');
                    setCategoryFilter('');
                    setContractTypeFilter('');
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
                            <span className="text-blue-600 font-medium">{job.company?.name}</span>
                            <Badge variant="secondary">{job.category}</Badge>
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
                              disabled={isApplied(job.id)}
                              className={isApplied(job.id) ? 'bg-gray-400' : ''}
                            >
                              {isApplied(job.id) ? 'Ya Postulado' : 'Postularme'}
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        {job.salaryFrom && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${job.salaryFrom.toLocaleString()}
                            {job.salaryTo && ` - $${job.salaryTo.toLocaleString()}`}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.contractType === 'full-time' ? 'Tiempo Completo' : 
                           job.contractType === 'part-time' ? 'Medio Tiempo' : 
                           job.contractType === 'contract' ? 'Por Contrato' : 
                           job.contractType === 'temporary' ? 'Temporal' : job.contractType}
                        </div>
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Requisitos:</h4>
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.slice(0, 3).map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                            {job.requirements.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.requirements.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Publicado el {new Date(job.createdAt).toLocaleDateString()}
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
