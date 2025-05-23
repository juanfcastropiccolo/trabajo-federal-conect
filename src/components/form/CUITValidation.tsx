
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AFIPService } from "@/services/api/afipService";
import { analytics } from "@/utils/analytics";

interface CUITValidationResponse {
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

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'error';

interface CUITValidationProps {
  value: string;
  onChange: (value: string) => void;
  onValidationResult?: (result: CUITValidationResponse | null) => void;
  className?: string;
}

export function CUITValidation({ value, onChange, onValidationResult, className }: CUITValidationProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [validationResult, setValidationResult] = useState<CUITValidationResponse | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Format CUIT to XX-XXXXXXXX-X pattern
  const formatCUIT = (cuit: string): string => {
    // Remove non-numeric characters
    const numericValue = cuit.replace(/\D/g, '');
    
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 10) {
      return `${numericValue.slice(0, 2)}-${numericValue.slice(2)}`;
    } else {
      return `${numericValue.slice(0, 2)}-${numericValue.slice(2, 10)}-${numericValue.slice(10, 11)}`;
    }
  };

  // Check if CUIT format is valid (11 digits, valid check digit)
  const isCUITFormatValid = (cuit: string): boolean => {
    const cleanCUIT = cuit.replace(/\D/g, '');
    if (cleanCUIT.length !== 11) return false;

    // Validate check digit
    const digits = cleanCUIT.split('').map(Number);
    const checksum = digits[0] * 5 + 
                     digits[1] * 4 + 
                     digits[2] * 3 + 
                     digits[3] * 2 + 
                     digits[4] * 7 + 
                     digits[5] * 6 + 
                     digits[6] * 5 + 
                     digits[7] * 4 + 
                     digits[8] * 3 + 
                     digits[9] * 2;
    
    const mod11 = checksum % 11;
    const expectedCheckDigit = mod11 === 0 ? 0 : 11 - mod11;
    
    return expectedCheckDigit === digits[10];
  };

  const validateCUIT = async (cuit: string) => {
    setValidationState('validating');
    
    try {
      // Get validation result from AFIP service
      const startTime = performance.now();
      const result = await AFIPService.validateCUIT(cuit);
      const duration = performance.now() - startTime;
      
      analytics.trackApiRequest('afip/validate-cuit', result.isValid, Math.round(duration));
      
      setValidationResult(result);
      setValidationState(result.isValid ? 'valid' : 'invalid');
      
      if (onValidationResult) {
        onValidationResult(result);
      }
    } catch (error) {
      console.error('Error validating CUIT:', error);
      setValidationState('error');
      setValidationResult({
        isValid: false,
        error: 'Error al conectar con el servicio de validación'
      });
      
      analytics.trackApiRequest('afip/validate-cuit', false, 0, error instanceof Error ? error.message : 'Unknown error');
      
      if (onValidationResult) {
        onValidationResult(null);
      }
    }
  };

  // Handle change and format input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCUIT(e.target.value);
    onChange(formatted); // Ensure this is called to update the parent component
    
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Reset validation if emptying the field
    if (!e.target.value) {
      setValidationState('idle');
      setValidationResult(null);
      if (onValidationResult) {
        onValidationResult(null);
      }
      return;
    }
    
    // Check if CUIT has complete format
    const cleanCUIT = formatted.replace(/\D/g, '');
    if (cleanCUIT.length === 11) {
      if (isCUITFormatValid(cleanCUIT)) {
        // Set debounce for validation
        const newTimeoutId = setTimeout(() => {
          validateCUIT(formatted);
        }, 500);
        setTimeoutId(newTimeoutId);
      } else {
        setValidationState('invalid');
        setValidationResult({
          isValid: false,
          error: 'Formato de CUIT inválido (dígito verificador incorrecto)'
        });
        if (onValidationResult) {
          onValidationResult(null);
        }
      }
    } else {
      // Reset validation if incomplete
      setValidationState('idle');
      setValidationResult(null);
      if (onValidationResult) {
        onValidationResult(null);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="cuit" className="flex items-center justify-between">
        CUIT
        <div className="flex items-center">
          {validationState === 'validating' && (
            <Loader2 size={16} className="animate-spin text-blue-500 mr-1" />
          )}
          {validationState === 'valid' && (
            <CheckCircle2 size={16} className="text-green-500 mr-1" />
          )}
          {validationState === 'invalid' && (
            <XCircle size={16} className="text-red-500 mr-1" />
          )}
          {validationState === 'error' && (
            <AlertCircle size={16} className="text-amber-500 mr-1" />
          )}
          
          <span className="text-xs ml-1">
            {validationState === 'validating' && "Verificando..."}
            {validationState === 'valid' && "Verificado ✓"}
            {validationState === 'invalid' && "No verificado"}
            {validationState === 'error' && "Error de conexión"}
          </span>
        </div>
      </Label>
      
      <div className="relative">
        <Input
          id="cuit"
          placeholder="XX-XXXXXXXX-X"
          value={value}
          onChange={handleChange}
          className={cn(
            validationState === 'valid' && "border-green-500 pr-10",
            validationState === 'invalid' && "border-red-500 pr-10",
            validationState === 'error' && "border-amber-500 pr-10"
          )}
          maxLength={13}
        />
        
        {validationState === 'valid' && (
          <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
        )}
        {validationState === 'invalid' && (
          <XCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
        )}
        {validationState === 'error' && (
          <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-amber-500" />
        )}
      </div>
      
      {validationState === 'valid' && validationResult?.companyData && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
          <div className="font-medium text-green-800">{validationResult.companyData.razonSocial}</div>
          <div className="text-xs text-green-700 mt-1">
            <div>{validationResult.companyData.estado} • Desde: {validationResult.companyData.fechaInscripcion}</div>
            <div className="mt-1">{validationResult.companyData.domicilioFiscal}</div>
            <div className="mt-1">
              {validationResult.companyData.actividadPrincipal} • {validationResult.companyData.categoriaIVA}
            </div>
          </div>
        </div>
      )}
      
      {validationState === 'invalid' && validationResult?.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {validationResult.error}
        </div>
      )}
      
      {validationState === 'error' && validationResult?.error && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
          {validationResult.error}
        </div>
      )}
    </div>
  );
}
