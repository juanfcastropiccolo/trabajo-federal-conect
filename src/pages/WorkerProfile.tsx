
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Star } from 'lucide-react';

const WorkerProfile = () => {
  const { id } = useParams<{ id: string }>();

  // Mock worker data
  const worker = {
    id: id,
    name: 'Juan Pérez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'San Martín, Buenos Aires',
    bio: 'Trabajador responsable con experiencia en logística y depósito. Disponibilidad horaria completa.',
    skills: ['Manejo de montacargas', 'Trabajo en equipo', 'Puntualidad', 'Orden y limpieza'],
    experience: '3 años en logística'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={worker.avatar} alt={worker.name} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{worker.name}</h1>
                <Badge variant="secondary" className="mb-3">Trabajador</Badge>
                
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {worker.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {worker.experience}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Sobre Mí</h2>
                <p className="text-gray-700">{worker.bio}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Habilidades</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerProfile;
