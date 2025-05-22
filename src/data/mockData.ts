
import { Job, Application, Message, Stats } from '../types';

export const mockJobs: Job[] = [
  {
    id: '1',
    companyId: 'comp1',
    title: 'Operario de Depósito',
    description: 'Buscamos operario para tareas de depósito, carga y descarga de mercadería. No se requiere experiencia previa.',
    category: 'logistica',
    salaryFrom: 80000,
    salaryTo: 120000,
    contractType: 'full-time',
    location: 'San Martín, Buenos Aires',
    requirements: ['Disponibilidad horaria completa', 'Ganas de aprender', 'Trabajo en equipo'],
    benefits: ['Obra social', 'Vacaciones pagas', 'Capacitación'],
    status: 'open',
    createdAt: '2024-01-15T10:00:00Z',
    company: {
      name: 'Logística SA',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
      sector: 'Logística'
    }
  },
  {
    id: '2',
    companyId: 'comp2',
    title: 'Personal de Limpieza',
    description: 'Incorporamos personal para limpieza de oficinas en horario matutino. Ambiente de trabajo agradable.',
    category: 'limpieza',
    salaryFrom: 70000,
    salaryTo: 90000,
    contractType: 'part-time',
    location: 'Microcentro, CABA',
    requirements: ['Puntualidad', 'Responsabilidad', 'Disponibilidad matutina'],
    benefits: ['Uniforme provisto', 'Transporte', 'Bono por presentismo'],
    status: 'open',
    createdAt: '2024-01-14T08:30:00Z',
    company: {
      name: 'CleanPro',
      avatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&h=150&fit=crop',
      sector: 'Servicios'
    }
  },
  {
    id: '3',
    companyId: 'comp3',
    title: 'Mozo/Moza de Restaurante',
    description: 'Restaurant céntrico busca mozo/moza con o sin experiencia. Excelente ambiente laboral y propinas.',
    category: 'gastronomia',
    salaryFrom: 85000,
    salaryTo: 110000,
    contractType: 'full-time',
    location: 'Palermo, CABA',
    requirements: ['Buena presencia', 'Trato amable', 'Disponibilidad fines de semana'],
    benefits: ['Propinas', 'Comida incluida', 'Capacitación en servicio'],
    status: 'open',
    createdAt: '2024-01-13T15:20:00Z',
    company: {
      name: 'Restaurante Don Luigi',
      avatar: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=150&h=150&fit=crop',
      sector: 'Gastronomía'
    }
  },
  {
    id: '4',
    companyId: 'comp4',
    title: 'Vendedor/a en Local',
    description: 'Importante cadena de retail busca vendedores para sucursal en shopping. Posibilidades de crecimiento.',
    category: 'ventas',
    salaryFrom: 95000,
    salaryTo: 140000,
    contractType: 'full-time',
    location: 'Córdoba Capital',
    requirements: ['Experiencia en atención al cliente', 'Dinamismo', 'Orientación a resultados'],
    benefits: ['Comisiones por venta', 'Descuentos en productos', 'Plan de carrera'],
    status: 'open',
    createdAt: '2024-01-12T12:00:00Z',
    company: {
      name: 'Fashion Store',
      avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop',
      sector: 'Retail'
    }
  },
  {
    id: '5',
    companyId: 'comp5',
    title: 'Guardia de Seguridad',
    description: 'Empresa de seguridad incorpora guardias para diferentes turnos. Capacitación incluida.',
    category: 'seguridad',
    salaryFrom: 90000,
    salaryTo: 125000,
    contractType: 'full-time',
    location: 'Rosario, Santa Fe',
    requirements: ['Mayor de 21 años', 'Secundario completo', 'Disponibilidad para rotar turnos'],
    benefits: ['Uniforme provisto', 'Seguro de vida', 'Capacitación continua'],
    status: 'open',
    createdAt: '2024-01-11T09:45:00Z',
    company: {
      name: 'SecurGuard',
      avatar: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=150&h=150&fit=crop',
      sector: 'Seguridad'
    }
  }
];

export const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    userId: 'user1',
    status: 'pending',
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    jobId: '2',
    userId: 'user1',
    status: 'viewed',
    createdAt: '2024-01-14T11:15:00Z'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'comp1',
    receiverId: 'user1',
    content: 'Hola Juan, hemos recibido tu postulación para el puesto de Operario de Depósito. Nos interesa conocerte mejor.',
    timestamp: '2024-01-15T16:00:00Z',
    read: false,
    jobId: '1'
  },
  {
    id: '2',
    senderId: 'user1',
    receiverId: 'comp1',
    content: 'Muchas gracias por contactarme. Estoy muy interesado en la posición y disponible para una entrevista.',
    timestamp: '2024-01-15T16:30:00Z',
    read: true,
    jobId: '1'
  }
];

export const mockStats: Stats = {
  totalJobs: 1247,
  totalWorkers: 8934,
  totalCompanies: 456,
  totalHires: 2891
};

export const testimonials = [
  {
    id: 1,
    name: "María González",
    job: "Operaria de Limpieza",
    company: "CleanPro",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    quote: "Gracias a Red Federal conseguí un trabajo estable cerca de mi casa. El proceso fue muy simple y rápido."
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    job: "Guardia de Seguridad",
    company: "SecurGuard",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "Después de meses buscando, encontré mi empleo ideal en solo una semana. La plataforma es muy fácil de usar."
  },
  {
    id: 3,
    name: "Ana Martínez",
    job: "Vendedora",
    company: "Fashion Store",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "Me encanta mi nuevo trabajo. La empresa me contactó al día siguiente de postularme. ¡Increíble!"
  }
];
