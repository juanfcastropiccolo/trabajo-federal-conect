
interface EventParams {
  [key: string]: string | number | boolean;
}

/**
 * Analytics utility for tracking user actions
 */
export const analytics = {
  /**
   * Track a user action
   * 
   * @param eventName Name of the event
   * @param params Additional event parameters
   */
  trackEvent: (eventName: string, params?: EventParams) => {
    console.log(`[Analytics] ${eventName}`, params);
    
    // In a real implementation, you would integrate with your analytics 
    // provider (e.g., Google Analytics, Mixpanel, Amplitude)
    
    // Example implementation with Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  },
  
  /**
   * Track form field interaction
   * 
   * @param formName The name of the form
   * @param fieldName The name of the field
   * @param action The action (focus, blur, change, etc)
   * @param value Optional value
   */
  trackFormField: (formName: string, fieldName: string, action: string, value?: string) => {
    analytics.trackEvent('form_field_interaction', {
      form_name: formName,
      field_name: fieldName,
      action,
      value: value || ''
    });
  },
  
  /**
   * Track API request
   * 
   * @param endpoint API endpoint
   * @param success Whether request succeeded
   * @param timeMs Time in milliseconds
   * @param errorMessage Optional error message
   */
  trackApiRequest: (endpoint: string, success: boolean, timeMs: number, errorMessage?: string) => {
    analytics.trackEvent('api_request', {
      endpoint,
      success,
      time_ms: timeMs,
      error: errorMessage || ''
    });
  },
  
  /**
   * Track validation result
   * 
   * @param field Field being validated
   * @param isValid Whether validation succeeded
   * @param details Additional details
   */
  trackValidation: (field: string, isValid: boolean, details?: string) => {
    analytics.trackEvent('validation', {
      field,
      is_valid: isValid,
      details: details || ''
    });
  }
};

// Add type definition for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}
