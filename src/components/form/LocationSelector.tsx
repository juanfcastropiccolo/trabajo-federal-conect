import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
  provinceValue: string;
  cityValue: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

export function LocationSelector({
  provinceValue,
  cityValue,
  onProvinceChange,
  onCityChange,
  className
}: LocationSelectorProps) {

  // Argentina provinces - lista simple
  const argentineProvinces = [
    { id: "buenos-aires", nombre: "Buenos Aires" },
    { id: "caba", nombre: "Ciudad Autónoma de Buenos Aires" },
    { id: "catamarca", nombre: "Catamarca" },
    { id: "chaco", nombre: "Chaco" },
    { id: "chubut", nombre: "Chubut" },
    { id: "cordoba", nombre: "Córdoba" },
    { id: "corrientes", nombre: "Corrientes" },
    { id: "entre-rios", nombre: "Entre Ríos" },
    { id: "formosa", nombre: "Formosa" },
    { id: "jujuy", nombre: "Jujuy" },
    { id: "la-pampa", nombre: "La Pampa" },
    { id: "la-rioja", nombre: "La Rioja" },
    { id: "mendoza", nombre: "Mendoza" },
    { id: "misiones", nombre: "Misiones" },
    { id: "neuquen", nombre: "Neuquén" },
    { id: "rio-negro", nombre: "Río Negro" },
    { id: "salta", nombre: "Salta" },
    { id: "san-juan", nombre: "San Juan" },
    { id: "san-luis", nombre: "San Luis" },
    { id: "santa-cruz", nombre: "Santa Cruz" },
    { id: "santa-fe", nombre: "Santa Fe" },
    { id: "santiago-del-estero", nombre: "Santiago del Estero" },
    { id: "tierra-del-fuego", nombre: "Tierra del Fuego" },
    { id: "tucuman", nombre: "Tucumán" }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Province Selection */}
      <div className="space-y-2">
        <Label htmlFor="province">Provincia</Label>
        <Select value={provinceValue} onValueChange={onProvinceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una provincia" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
            {argentineProvinces.map((province) => (
              <SelectItem key={province.id} value={province.nombre}>
                {province.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City/Location Manual Input */}
      <div className="space-y-2">
        <Label htmlFor="city">Ciudad/Localidad</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="city"
            placeholder="Escribí tu ciudad o localidad"
            value={cityValue}
            onChange={(e) => onCityChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}