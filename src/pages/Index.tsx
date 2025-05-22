
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '../components/Navbar';
import { mockStats, testimonials } from '../data/mockData';
import { Briefcase, Users, Building, Award, ArrowRight, MapPin, Clock, DollarSign } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar variant="landing" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Tu próximo empleo te está
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500"> esperando</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conectamos a empresas con trabajadores comprometidos. Encontrá oportunidades laborales reales en tu zona, sin experiencia previa requerida.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register?type=worker">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Busco Trabajo
                </Button>
              </Link>
              <Link to="/register?type=company">
                <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 text-lg">
                  <Building className="mr-2 h-5 w-5" />
                  Ofrezco Trabajo
                </Button>
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-blue-600 mb-2">{mockStats.totalJobs.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Empleos Publicados</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-green-600 mb-2">{mockStats.totalWorkers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Trabajadores Registrados</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-purple-600 mb-2">{mockStats.totalCompanies.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Empresas Activas</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-orange-600 mb-2">{mockStats.totalHires.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Contrataciones Exitosas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Empleos Destacados</h2>
            <p className="text-lg text-gray-600">Oportunidades laborales disponibles ahora</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Operario de Depósito",
                company: "Logística SA",
                location: "San Martín, Buenos Aires",
                salary: "$80.000 - $120.000",
                type: "Tiempo Completo",
                category: "Logística"
              },
              {
                title: "Personal de Limpieza",
                company: "CleanPro",
                location: "Microcentro, CABA",
                salary: "$70.000 - $90.000",
                type: "Medio Tiempo",
                category: "Servicios"
              },
              {
                title: "Mozo/Moza",
                company: "Restaurante Don Luigi",
                location: "Palermo, CABA",
                salary: "$85.000 - $110.000",
                type: "Tiempo Completo",
                category: "Gastronomía"
              }
            ].map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-blue-600 font-medium">{job.company}</p>
                    </div>
                    <Badge variant="secondary">{job.category}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {job.type}
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    Ver Detalles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/trabajos">
              <Button size="lg" variant="outline">
                Ver Todos los Empleos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Historias de Éxito</h2>
            <p className="text-lg text-gray-600">Conocé a quienes ya encontraron su empleo ideal</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.job} en {testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para dar el próximo paso?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únite a miles de personas que ya encontraron su oportunidad laboral
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?type=worker">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
                <Users className="mr-2 h-5 w-5" />
                Registrarme como Trabajador
              </Button>
            </Link>
            <Link to="/register?type=company">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4">
                <Building className="mr-2 h-5 w-5" />
                Registrar mi Empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Red Federal de Trabajo</span>
              </div>
              <p className="text-gray-400">
                Conectando talento con oportunidades en toda Argentina.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Trabajadores</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Buscar Empleos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crear Perfil</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Consejos de CV</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Empresas</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Publicar Empleo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Buscar Candidatos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planes y Precios</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos de Uso</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Red Federal de Trabajo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
