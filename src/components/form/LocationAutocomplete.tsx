
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationService, Province, City } from "@/services/api/locationService";
import { analytics } from "@/utils/analytics";

interface LocationAutocompleteProps {
  provinceValue: string;
  cityValue: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

export function LocationAutocomplete({
  provinceValue,
  cityValue,
  onProvinceChange,
  onCityChange,
  className
}: LocationAutocompleteProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (provinceValue) {
      loadCitiesForProvince(provinceValue);
    } else {
      setCities([]);
    }
  }, [provinceValue]);

  // Set city search query when cityValue changes
  useEffect(() => {
    if (cityValue) {
      const selectedCity = cities.find(c => c.nombre === cityValue) || 
                          searchResults.find(c => c.nombre === cityValue);
      if (selectedCity) {
        setCitySearchQuery(selectedCity.nombre);
      }
    } else {
      setCitySearchQuery("");
    }
  }, [cityValue, cities, searchResults]);

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const fetchedProvinces = await LocationService.getProvinces();
      console.log("Fetched provinces:", fetchedProvinces);
      setProvinces(fetchedProvinces);
    } catch (err) {
      console.error('Error fetching provinces:', err);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const loadCitiesForProvince = async (provinceId: string) => {
    setIsLoadingCities(true);
    try {
      const fetchedCities = await LocationService.getCitiesByProvince(provinceId);
      setCities(fetchedCities);
    } catch (err) {
      console.error('Error fetching cities for province:', provinceId, err);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const searchCitiesGlobally = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await LocationService.searchCities(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching cities:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    console.log("Province selected:", value);
    analytics.trackFormField('location', 'province', 'select', value);
    onProvinceChange(value);
    onCityChange('');
    setCitySearchQuery("");
    setSearchResults([]);
  };

  const handleCitySearch = (query: string) => {
    setCitySearchQuery(query);
    setShowCityDropdown(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchCitiesGlobally(query);
    }, 300);
  };

  const handleCitySelect = (cityName: string) => {
    setCitySearchQuery(cityName);
    onCityChange(cityName);
    setShowCityDropdown(false);
    analytics.trackFormField('location', 'city', 'select', cityName);
  };

  const getDisplayCities = () => {
    if (citySearchQuery.length >= 3 && searchResults.length > 0) {
      return searchResults;
    }
    return cities;
  };

  const selectedProvince = provinces.find(p => p.id === provinceValue);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="province">Provincia</Label>
        <Select value={provinceValue} onValueChange={handleProvinceChange}>
          <SelectTrigger id="province" className={cn(provinceValue ? "" : "text-muted-foreground")}>
            <SelectValue placeholder="Selecciona una provincia" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
            {isLoadingProvinces ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Cargando provincias...</span>
              </div>
            ) : (
              provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.nombre}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">
          Ciudad/Localidad
          {selectedProvince && (
            <span className="text-xs text-gray-500 ml-2">
              (Escribí al menos 3 letras para buscar)
            </span>
          )}
        </Label>
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              ref={cityInputRef}
              id="city"
              placeholder={selectedProvince ? "Escribí el nombre de tu ciudad..." : "Primero seleccioná una provincia"}
              value={citySearchQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
              onFocus={() => setShowCityDropdown(true)}
              disabled={!selectedProvince}
              className="pl-10"
            />
          </div>
          
          {showCityDropdown && selectedProvince && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
              {isSearching || isLoadingCities ? (
                <div className="flex items-center justify-center p-3">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Buscando ciudades...</span>
                </div>
              ) : citySearchQuery.length < 3 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  Escribí al menos 3 letras para buscar ciudades
                </div>
              ) : getDisplayCities().length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No se encontraron ciudades
                </div>
              ) : (
                getDisplayCities().map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                    onClick={() => handleCitySelect(city.nombre)}
                  >
                    <div className="font-medium">{city.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {city.provincia.nombre}
                      {city.departamento && ` • ${city.departamento.nombre}`}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
