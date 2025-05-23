
/**
 * Formats a CUIT number to the standard XX-XXXXXXXX-X format
 * @param cuit Raw CUIT input
 * @returns Formatted CUIT
 */
export const formatCUIT = (cuit: string): string => {
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

/**
 * Validates a CUIT number format and check digit
 * @param cuit CUIT to validate
 * @returns boolean indicating if the format and check digit are valid
 */
export const validateCUITFormat = (cuit: string): boolean => {
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

/**
 * Formats a phone number to international format
 * Example: 1155667788 -> +54 11 5566-7788
 * 
 * @param phone Raw phone number input
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove non-numeric characters
  const numericValue = phone.replace(/\D/g, '');
  
  // If it starts with country code
  if (numericValue.startsWith('54')) {
    const withoutCode = numericValue.substring(2);
    
    if (withoutCode.length <= 2) {
      return `+54 ${withoutCode}`;
    } else if (withoutCode.length <= 6) {
      return `+54 ${withoutCode.substring(0, 2)} ${withoutCode.substring(2)}`;
    } else {
      return `+54 ${withoutCode.substring(0, 2)} ${withoutCode.substring(2, 6)}-${withoutCode.substring(6)}`;
    }
  }
  
  // If no country code, assume Argentina
  if (numericValue.length <= 2) {
    return `+54 ${numericValue}`;
  } else if (numericValue.length <= 6) {
    return `+54 ${numericValue.substring(0, 2)} ${numericValue.substring(2)}`;
  } else {
    return `+54 ${numericValue.substring(0, 2)} ${numericValue.substring(2, 6)}-${numericValue.substring(6)}`;
  }
};
