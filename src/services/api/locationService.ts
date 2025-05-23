
import { analytics } from '@/utils/analytics';

/**
 * Interface for Province data
 */
export interface Province {
  id: string;
  nombre: string;
  centroide?: {
    lat: number;
    lon: number;
  };
}

/**
 * Interface for City data
 */
export interface City {
  id: string;
  nombre: string;
  provincia: {
    id: string;
    nombre: string;
  };
  departamento?: {
    id: string;
    nombre: string;
  };
  centroide?: {
    lat: number;
    lon: number;
  };
}

/**
 * Location Service - Provides methods to fetch provinces and cities
 * using Argentina's official georef API
 */
export const LocationService = {
  /**
   * Fetch all provinces from Argentina
   * @returns List of provinces
   */
  getProvinces: async (): Promise<Province[]> => {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cachedProvinces = LocationService.getCachedProvinces();
      if (cachedProvinces) {
        analytics.trackApiRequest('georef/provincias', true, Date.now() - startTime, 'from-cache');
        return cachedProvinces;
      }
      
      const response = await fetch(
        'https://apis.datos.gob.ar/georef/api/provincias?orden=nombre'
      );
      
      if (!response.ok) {
        throw new Error(`API returned status code ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.provincias) {
        // Cache the provinces
        LocationService.cacheProvinces(data.provincias);
        
        analytics.trackApiRequest('georef/provincias', true, Date.now() - startTime);
        return data.provincias;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching provinces';
      analytics.trackApiRequest('georef/provincias', false, Date.now() - startTime, errorMessage);
      
      // Return mock data as fallback
      return LocationService.getMockProvinces();
    }
  },
  
  /**
   * Fetch cities for a specific province
   * @param provinceId Province ID
   * @returns List of cities in the province
   */
  getCitiesByProvince: async (provinceId: string): Promise<City[]> => {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cachedCities = LocationService.getCachedCities(provinceId);
      if (cachedCities) {
        analytics.trackApiRequest('georef/localidades', true, Date.now() - startTime, 'from-cache');
        return cachedCities;
      }
      
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinceId}&orden=nombre&max=1000`
      );
      
      if (!response.ok) {
        throw new Error(`API returned status code ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.localidades) {
        // Cache the cities
        LocationService.cacheCities(provinceId, data.localidades);
        
        analytics.trackApiRequest('georef/localidades', true, Date.now() - startTime);
        return data.localidades;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`Error fetching cities for province ${provinceId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching cities';
      analytics.trackApiRequest('georef/localidades', false, Date.now() - startTime, errorMessage);
      
      // Return mock data as fallback
      return LocationService.getMockCitiesForProvince(provinceId);
    }
  },
  
  /**
   * Search for cities by name across all provinces
   * @param query Search query
   * @returns List of matching cities
   */
  searchCities: async (query: string): Promise<City[]> => {
    const startTime = Date.now();
    
    if (query.length < 3) {
      return [];
    }
    
    try {
      const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(normalizedQuery)}&max=15`
      );
      
      if (!response.ok) {
        throw new Error(`API returned status code ${response.status}`);
      }
      
      const data = await response.json();
      
      analytics.trackApiRequest('georef/localidades/search', true, Date.now() - startTime);
      
      if (data && data.localidades) {
        return data.localidades;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error searching cities';
      analytics.trackApiRequest('georef/localidades/search', false, Date.now() - startTime, errorMessage);
      
      // Return empty array on error
      return [];
    }
  },
  
  /**
   * Get provinces from cache
   * @returns Cached provinces or null if not found
   */
  getCachedProvinces: (): Province[] | null => {
    try {
      const cachedData = sessionStorage.getItem('argentineProvinces');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn('Error reading province cache:', error);
    }
    
    return null;
  },
  
  /**
   * Cache provinces
   * @param provinces Provinces to cache
   */
  cacheProvinces: (provinces: Province[]): void => {
    try {
      sessionStorage.setItem('argentineProvinces', JSON.stringify(provinces));
    } catch (error) {
      console.warn('Error caching provinces:', error);
    }
  },
  
  /**
   * Get cities from cache for a specific province
   * @param provinceId Province ID
   * @returns Cached cities or null if not found
   */
  getCachedCities: (provinceId: string): City[] | null => {
    try {
      const cacheKey = `argentineCities_${provinceId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn('Error reading city cache:', error);
    }
    
    return null;
  },
  
  /**
   * Cache cities for a specific province
   * @param provinceId Province ID
   * @param cities Cities to cache
   */
  cacheCities: (provinceId: string, cities: City[]): void => {
    try {
      const cacheKey = `argentineCities_${provinceId}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(cities));
    } catch (error) {
      console.warn('Error caching cities:', error);
    }
  },
  
  /**
   * Get mock provinces for fallback
   * @returns Mock province data
   */
  getMockProvinces: (): Province[] => {
    return [
      { id: "06", nombre: "Buenos Aires" },
      { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" },
      { id: "14", nombre: "Córdoba" },
      { id: "22", nombre: "Chaco" },
      { id: "26", nombre: "Chubut" },
      { id: "18", nombre: "Corrientes" },
      { id: "30", nombre: "Entre Ríos" },
      { id: "34", nombre: "Formosa" },
      { id: "38", nombre: "Jujuy" },
      { id: "42", nombre: "La Pampa" },
      { id: "46", nombre: "La Rioja" },
      { id: "50", nombre: "Mendoza" },
      { id: "54", nombre: "Misiones" },
      { id: "58", nombre: "Neuquén" },
      { id: "62", nombre: "Río Negro" },
      { id: "66", nombre: "Salta" },
      { id: "70", nombre: "San Juan" },
      { id: "74", nombre: "San Luis" },
      { id: "78", nombre: "Santa Cruz" },
      { id: "82", nombre: "Santa Fe" },
      { id: "86", nombre: "Santiago del Estero" },
      { id: "94", nombre: "Tierra del Fuego" },
      { id: "90", nombre: "Tucumán" }
    ];
  },
  
  /**
   * Get mock cities for a specific province
   * @param provinceId Province ID
   * @returns Mock city data for the specified province
   */
  getMockCitiesForProvince: (provinceId: string): City[] => {
    const mockCitiesByProvince: Record<string, City[]> = {
      "06": [ // Buenos Aires
        { 
          id: "06007", 
          nombre: "La Plata", 
          provincia: { id: "06", nombre: "Buenos Aires" },
          departamento: { id: "06441", nombre: "La Plata" }
        },
        { 
          id: "06357", 
          nombre: "Mar del Plata", 
          provincia: { id: "06", nombre: "Buenos Aires" },
          departamento: { id: "06357", nombre: "General Pueyrredón" }
        },
        { 
          id: "06490", 
          nombre: "Quilmes", 
          provincia: { id: "06", nombre: "Buenos Aires" },
          departamento: { id: "06490", nombre: "Quilmes" }
        },
        { 
          id: "06269", 
          nombre: "La Matanza", 
          provincia: { id: "06", nombre: "Buenos Aires" },
          departamento: { id: "06269", nombre: "La Matanza" }
        },
        { 
          id: "06410", 
          nombre: "Morón", 
          provincia: { id: "06", nombre: "Buenos Aires" },
          departamento: { id: "06410", nombre: "Morón" }
        }
      ],
      "02": [ // CABA
        { 
          id: "02001", 
          nombre: "Ciudad Autónoma de Buenos Aires", 
          provincia: { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" }
        }
      ],
      "14": [ // Córdoba
        { 
          id: "14014", 
          nombre: "Córdoba", 
          provincia: { id: "14", nombre: "Córdoba" },
          departamento: { id: "14014", nombre: "Capital" }
        },
        { 
          id: "14126", 
          nombre: "Río Cuarto", 
          provincia: { id: "14", nombre: "Córdoba" },
          departamento: { id: "14126", nombre: "Río Cuarto" }
        },
        { 
          id: "14147", 
          nombre: "Villa María", 
          provincia: { id: "14", nombre: "Córdoba" },
          departamento: { id: "14147", nombre: "General San Martín" }
        }
      ],
      "50": [ // Mendoza
        { 
          id: "50091", 
          nombre: "Mendoza", 
          provincia: { id: "50", nombre: "Mendoza" },
          departamento: { id: "50091", nombre: "Capital" }
        },
        { 
          id: "50028", 
          nombre: "Godoy Cruz", 
          provincia: { id: "50", nombre: "Mendoza" },
          departamento: { id: "50028", nombre: "Godoy Cruz" }
        },
        { 
          id: "50007", 
          nombre: "San Rafael", 
          provincia: { id: "50", nombre: "Mendoza" },
          departamento: { id: "50007", nombre: "San Rafael" }
        }
      ]
    };
    
    return mockCitiesByProvince[provinceId] || [
      { 
        id: "mock-1", 
        nombre: "Ciudad Principal", 
        provincia: { id: provinceId, nombre: "Provincia" }
      },
      { 
        id: "mock-2", 
        nombre: "Ciudad Secundaria", 
        provincia: { id: provinceId, nombre: "Provincia" }
      }
    ];
  }
};
