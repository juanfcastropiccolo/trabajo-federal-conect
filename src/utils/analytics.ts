
// Analytics utility for tracking events and API requests
export const analytics = {
  trackEvent: (eventName: string, properties?: any) => {
    console.log(`📊 Analytics Event: ${eventName}`, properties);
    // Aquí se podría integrar con Google Analytics, Mixpanel, etc.
  },

  trackApiRequest: (endpoint: string, success: boolean, duration: number, error?: string) => {
    console.log(`🌐 API Request: ${endpoint}`, {
      success,
      duration: `${duration}ms`,
      error: error || 'None'
    });
    // Aquí se podría enviar métricas a un servicio de monitoreo
  }
};
