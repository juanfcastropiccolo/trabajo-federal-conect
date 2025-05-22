
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Briefcase, Calendar } from 'lucide-react';

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();

  // Mock company data
  const company = {
    id: id,
    name: 'Logística SA',
    avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
    sector: 'Logística',
    location: 'Buenos Aires, Argentina',
    description: 'Empresa líder en soluciones logísticas con más de 20 años de experiencia en el mercado.',
    employees: '100-500',
    founded: '2003',
    website: 'https://logistica-sa.com'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={company.avatar} alt={company.name} />
                <AvatarFallback>
                  <Building className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                <Badge variant="secondary" className="mb-3">{company.sector}</Badge>
                
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {company.employees} empleados
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fundada en {company.founded}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Sobre la Empresa</h2>
                <p className="text-gray-700">{company.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Empleos Activos</h2>
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4" />
                  <p>Esta empresa no tiene empleos activos en este momento.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProfile;
