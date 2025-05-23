
import { analytics } from '@/utils/analytics';

/**
 * Interface for CUIT validation request
 */
export interface CUITValidationRequest {
  cuit: string;
}

/**
 * Interface for CUIT validation response
 */
export interface CUITValidationResponse {
  isValid: boolean;
  companyData?: {
    razonSocial: string;
    estado: string;
    fechaInscripcion: string;
    domicilioFiscal: string;
    actividadPrincipal: string;
    categoriaIVA: string;
  };
  error?: string;
}

/**
 * AFIP API Service - Validates CUIT and retrieves company data
 */
export const AFIPService = {
  /**
   * Validate a CUIT with AFIP
   * 
   * In production, this would call the actual AFIP SDK API
   * For development, we're using mocked data
   * 
   * @param cuit CUIT to validate
   * @returns Validation result with company data if valid
   */
  validateCUIT: async (cuit: string): Promise<CUITValidationResponse> => {
    const startTime = Date.now();
    // Remove non-numeric characters for validation
    const cleanCUIT = cuit.replace(/\D/g, '');
    
    try {
      // Check cache first
      const cachedResult = AFIPService.getCachedValidation(cleanCUIT);
      if (cachedResult) {
        analytics.trackApiRequest('afip/validate-cuit', true, Date.now() - startTime, 'from-cache');
        return cachedResult;
      }
      
      // In a real implementation, this would be an API call to AFIP SDK
      // const response = await fetch('https://afipsdk.com/api/v1/padron/' + cleanCUIT, {
      //   headers: {
      //     'Authorization': `Bearer ${API_KEY}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      
      // Simulate network delay for better UX testing
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      
      // Use mock data for development
      const mockResult = AFIPService.getMockValidationResult(cleanCUIT);
      
      // Cache the result
      AFIPService.cacheValidationResult(cleanCUIT, mockResult);
      
      analytics.trackApiRequest('afip/validate-cuit', true, Date.now() - startTime);
      return mockResult;
    } catch (error) {
      console.error('AFIP API Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error validating CUIT';
      analytics.trackApiRequest('afip/validate-cuit', false, Date.now() - startTime, errorMessage);
      
      return {
        isValid: false,
        error: 'Error al comunicarse con el servicio de AFIP. Por favor intente nuevamente.'
      };
    }
  },
  
  /**
   * Get cached CUIT validation result
   * @param cuit CUIT to get from cache
   * @returns Cached validation result or null if not found
   */
  getCachedValidation: (cuit: string): CUITValidationResponse | null => {
    try {
      const cacheKey = `afip_cuit_${cuit}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Cache TTL: 24 hours
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        } else {
          // Clear expired cache
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('Error reading CUIT validation cache:', error);
    }
    
    return null;
  },
  
  /**
   * Cache CUIT validation result
   * @param cuit CUIT to cache
   * @param result Validation result to cache
   */
  cacheValidationResult: (cuit: string, result: CUITValidationResponse): void => {
    try {
      const cacheKey = `afip_cuit_${cuit}`;
      const cacheData = {
        data: result,
        timestamp: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching CUIT validation result:', error);
    }
  },
  
  /**
   * Get mocked validation results for testing
   * In production, this would be replaced by the actual API call
   * 
   * @param cuit CUIT to validate
   * @returns Mocked validation result
   */
  getMockValidationResult: (cuit: string): CUITValidationResponse => {
    // Database of mock companies for development
    const mockCompanies: Record<string, CUITValidationResponse> = {
      '30709653642': {
        isValid: true,
        companyData: {
          razonSocial: 'MERCADOLIBRE S.R.L.',
          estado: 'ACTIVO',
          fechaInscripcion: '2001-07-12',
          domicilioFiscal: 'Av. Caseros 3039, CABA',
          actividadPrincipal: 'Servicios de comercialización',
          categoriaIVA: 'Responsable Inscripto'
        }
      },
      '30628786561': {
        isValid: true,
        companyData: {
          razonSocial: 'GOOGLE ARGENTINA S.R.L.',
          estado: 'ACTIVO',
          fechaInscripcion: '1999-11-22',
          domicilioFiscal: 'Av. del Libertador 6250, CABA',
          actividadPrincipal: 'Servicios de publicidad',
          categoriaIVA: 'Responsable Inscripto'
        }
      },
      '30715511358': {
        isValid: true,
        companyData: {
          razonSocial: 'GLOBANT S.A.',
          estado: 'ACTIVO',
          fechaInscripcion: '2013-02-15',
          domicilioFiscal: 'Ing. Butty 240, CABA',
          actividadPrincipal: 'Servicios de consultoría informática',
          categoriaIVA: 'Responsable Inscripto'
        }
      },
      '30536466885': {
        isValid: true,
        companyData: {
          razonSocial: 'YPF SOCIEDAD ANONIMA',
          estado: 'ACTIVO',
          fechaInscripcion: '1993-06-02',
          domicilioFiscal: 'Macacha Güemes 515, CABA',
          actividadPrincipal: 'Extracción de petróleo crudo',
          categoriaIVA: 'Responsable Inscripto'
        }
      },
      '30639453738': {
        isValid: true,
        companyData: {
          razonSocial: 'TENARIS S.A.',
          estado: 'ACTIVO',
          fechaInscripcion: '1995-12-28',
          domicilioFiscal: 'Carlos María Della Paolera 299, CABA',
          actividadPrincipal: 'Fabricación de productos de hierro y acero',
          categoriaIVA: 'Responsable Inscripto'
        }
      },
      '30708307638': {
        isValid: true,
        companyData: {
          razonSocial: 'TECHINT S.A.',
          estado: 'ACTIVO',
          fechaInscripcion: '2004-05-16',
          domicilioFiscal: 'Av. Libertador 8010, CABA',
          actividadPrincipal: 'Construcción y servicios de ingeniería',
          categoriaIVA: 'Responsable Inscripto'
        }
      }
    };
    
    // Check if we have mock data for this CUIT
    if (mockCompanies[cuit]) {
      return mockCompanies[cuit];
    }
    
    // Random successful validation for development testing (10% chance)
    if (Math.random() < 0.1) {
      return {
        isValid: true,
        companyData: {
          razonSocial: `EMPRESA EJEMPLO ${cuit.substring(0, 4)} S.A.`,
          estado: 'ACTIVO',
          fechaInscripcion: '2010-01-01',
          domicilioFiscal: 'Av. Corrientes 123, CABA',
          actividadPrincipal: 'Servicios empresariales',
          categoriaIVA: 'Responsable Inscripto'
        }
      };
    }
    
    // Default response for invalid CUITs
    return {
      isValid: false,
      error: 'CUIT no encontrado en registros de AFIP'
    };
  }
};
