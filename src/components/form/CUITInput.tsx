import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CUITInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CUITInput({
  value,
  onChange,
  className
}: CUITInputProps) {

  // Format CUIT to XX-XXXXXXXX-X pattern
  const formatCUIT = (input: string): string => {
    // Remove all non-numeric characters
    const numericValue = input.replace(/\D/g, '');
    
    // Apply formatting based on length
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 10) {
      return `${numericValue.slice(0, 2)}-${numericValue.slice(2)}`;
    } else {
      return `${numericValue.slice(0, 2)}-${numericValue.slice(2, 10)}-${numericValue.slice(10, 11)}`;
    }
  };

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers and hyphens, limit length
    const filteredValue = inputValue.replace(/[^\d-]/g, '').slice(0, 13);
    
    // Format the input
    const formattedValue = formatCUIT(filteredValue);
    
    // Update parent component
    onChange(formattedValue);
  };

  // Handle key press to prevent invalid characters
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumber = /^\d$/.test(e.key);
    const isHyphen = e.key === '-';
    
    if (!isNumber && !isHyphen && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="cuit" className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        CUIT de la Empresa
      </Label>
      
      <Input
        id="cuit"
        type="text"
        placeholder="20-12345678-9"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        maxLength={13} // XX-XXXXXXXX-X
        autoComplete="off"
      />
      
      <p className="text-xs text-gray-500">
        Formato: XX-XXXXXXXX-X (los guiones se agregan automáticamente)
      </p>
    </div>
  );
}