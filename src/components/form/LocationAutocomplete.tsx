
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { analytics } from "@/utils/analytics";

interface Province {
  id: string;
  nombre: string;
}

interface City {
  id: string;
  nombre: string;
  provincia: {
    id: string;
    nombre: string;
  };
}

interface LocationAutocompleteProps {
  provinceValue: string;
  cityValue: string;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCitySelect?: (city: City | null) => void;
  className?: string;
}

export function LocationAutocomplete({
  provinceValue,
  cityValue,
  onProvinceChange,
  onCityChange,
  onCitySelect,
  className
}: LocationAutocompleteProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedCityObject, setSelectedCityObject] = useState<City | null>(null);
  const [citySearchText, setCitySearchText] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const citiesDropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);
  
  // Fetch cities when province changes
  useEffect(() => {
    if (provinceValue) {
      fetchCities(provinceValue);
      
      // Find the province name
      const province = provinces.find(p => p.id === provinceValue);
      if (province) {
        setSelectedProvinceName(province.nombre);
      }
    } else {
      setCities([]);
      setFilteredCities([]);
    }
  }, [provinceValue, provinces]);

  // Update citySearchText when cityValue changes from parent
  useEffect(() => {
    setCitySearchText(cityValue);
  }, [cityValue]);
  
  // Filter cities based on search text
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (citySearchText.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        const filtered = cities.filter(city => 
          city.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .includes(citySearchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
        );
        setFilteredCities(filtered.slice(0, 10));
        setShowCitiesDropdown(true);
      }, 300);
    } else {
      setFilteredCities([]);
      setShowCitiesDropdown(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [citySearchText, cities]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citiesDropdownRef.current && !citiesDropdownRef.current.contains(event.target as Node)) {
        setShowCitiesDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    setError(null);
    
    try {
      // Check if we have cached provinces in sessionStorage
      const cachedProvinces = sessionStorage.getItem('argentineProvinces');
      if (cachedProvinces) {
        setProvinces(JSON.parse(cachedProvinces));
        setIsLoadingProvinces(false);
        return;
      }
      
      const response = await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=nombre');
      const data = await response.json();
      
      if (data && data.provincias) {
        setProvinces(data.provincias);
        // Cache the provinces in sessionStorage
        sessionStorage.setItem('argentineProvinces', JSON.stringify(data.provincias));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
      setError('No se pudieron cargar las provincias. Por favor, intenta nuevamente.');
      
      // Use backup data
      setProvinces(mockProvinces);
    } finally {
      setIsLoadingProvinces(false);
    }
  };
  
  const fetchCities = async (provinceId: string) => {
    if (!provinceId) return;
    
    setIsLoadingCities(true);
    setError(null);
    
    try {
      // Check if we have cached cities for this province in sessionStorage
      const cacheKey = `argentineCities_${provinceId}`;
      const cachedCities = sessionStorage.getItem(cacheKey);
      
      if (cachedCities) {
        setCities(JSON.parse(cachedCities));
        setIsLoadingCities(false);
        return;
      }
      
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinceId}&orden=nombre&max=1000`
      );
      const data = await response.json();
      
      if (data && data.localidades) {
        setCities(data.localidades);
        // Cache the cities in sessionStorage
        sessionStorage.setItem(cacheKey, JSON.stringify(data.localidades));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('No se pudieron cargar las localidades. Por favor, intenta nuevamente.');
      
      // Use backup data for the selected province
      const mockCitiesForProvince = mockCitiesByProvince[provinceId] || [];
      setCities(mockCitiesForProvince);
    } finally {
      setIsLoadingCities(false);
    }
  };
  
  const handleProvinceChange = (value: string) => {
    analytics.trackFormField('location', 'province', 'select', value);
    onProvinceChange(value);
    onCityChange('');
    setCitySearchText('');
    setSelectedCityObject(null);
    if (onCitySelect) onCitySelect(null);
  };
  
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearchText(value);
    onCityChange(value);
    
    if (!value) {
      setSelectedCityObject(null);
      if (onCitySelect) onCitySelect(null);
    }
    
    analytics.trackFormField('location', 'city', 'change', value);
  };
  
  const handleCitySelect = (city: City) => {
    setCitySearchText(city.nombre);
    onCityChange(city.nombre);
    setSelectedCityObject(city);
    setShowCitiesDropdown(false);
    if (onCitySelect) onCitySelect(city);
    
    analytics.trackFormField('location', 'city', 'select', city.nombre);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Province Selection */}
      <div className="space-y-2">
        <Label htmlFor="province">Provincia</Label>
        <Select 
          value={provinceValue} 
          onValueChange={handleProvinceChange} 
          defaultValue=""
        >
          <SelectTrigger id="province" className={provinceValue ? "" : "text-muted-foreground"}>
            <SelectValue placeholder="Selecciona una provincia" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {isLoadingProvinces ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Cargando provincias...</span>
              </div>
            ) : provinces.length > 0 ? (
              provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.nombre}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-sm">No se encontraron provincias</div>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* City Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="city">
          Ciudad / Localidad
          {provinceValue && isLoadingCities && (
            <Loader2 size={16} className="inline ml-2 animate-spin text-blue-500" />
          )}
        </Label>
        <div className="relative" ref={citiesDropdownRef}>
          <div className="relative">
            <Input
              id="city"
              placeholder={provinceValue ? "Ingresá tu ciudad o localidad" : "Primero seleccioná una provincia"}
              value={citySearchText}
              onChange={handleCityInputChange}
              onFocus={() => citySearchText.length >= 2 && setShowCitiesDropdown(true)}
              disabled={!provinceValue || isLoadingCities}
              className={cn(
                selectedCityObject && "pr-10",
                !provinceValue && "bg-gray-50"
              )}
            />
            {selectedCityObject && (
              <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
            )}
          </div>
          
          {/* Dropdown for cities */}
          {showCitiesDropdown && provinceValue && (
            <div className="absolute w-full mt-1 max-h-60 overflow-auto z-10 bg-white border rounded-md shadow-lg">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                    onClick={() => handleCitySelect(city)}
                  >
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div>{city.nombre}</div>
                      <div className="text-xs text-gray-500">{city.provincia.nombre}</div>
                    </div>
                  </div>
                ))
              ) : citySearchText.length >= 2 ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  No se encontraron localidades
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">
                  Ingresá al menos 2 letras para buscar
                </div>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 flex items-center text-amber-600 text-sm">
            <AlertTriangle size={16} className="mr-1" />
            <span>{error}</span>
          </div>
        )}
        
        {provinceValue && !cityValue && !isLoadingCities && cities.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {cities.length} localidades disponibles en {selectedProvinceName}
          </p>
        )}
      </div>
    </div>
  );
}

// Mock data for fallback if API fails
const mockProvinces: Province[] = [
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

// Sample mock cities for major provinces (partial data for fallback)
const mockCitiesByProvince: Record<string, City[]> = {
  "06": [ // Buenos Aires
    { id: "06007", nombre: "La Plata", provincia: { id: "06", nombre: "Buenos Aires" } },
    { id: "06357", nombre: "Mar del Plata", provincia: { id: "06", nombre: "Buenos Aires" } },
    { id: "06490", nombre: "Quilmes", provincia: { id: "06", nombre: "Buenos Aires" } },
    { id: "06269", nombre: "La Matanza", provincia: { id: "06", nombre: "Buenos Aires" } },
    { id: "06410", nombre: "Morón", provincia: { id: "06", nombre: "Buenos Aires" } }
  ],
  "02": [ // CABA
    { id: "02001", nombre: "Ciudad Autónoma de Buenos Aires", provincia: { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" } }
  ],
  "14": [ // Córdoba
    { id: "14014", nombre: "Córdoba", provincia: { id: "14", nombre: "Córdoba" } },
    { id: "14126", nombre: "Río Cuarto", provincia: { id: "14", nombre: "Córdoba" } },
    { id: "14147", nombre: "Villa María", provincia: { id: "14", nombre: "Córdoba" } }
  ],
  "50": [ // Mendoza
    { id: "50091", nombre: "Mendoza", provincia: { id: "50", nombre: "Mendoza" } },
    { id: "50028", nombre: "Godoy Cruz", provincia: { id: "50", nombre: "Mendoza" } },
    { id: "50007", nombre: "San Rafael", provincia: { id: "50", nombre: "Mendoza" } }
  ]
};
