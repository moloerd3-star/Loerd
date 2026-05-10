
import { SOCIAL_CATALOG, SERVICES_DATA } from '../constants';

// Simulated external provider API data
// In a real scenario, this would be a fetch() call to an SMM provider (e.g., JAP, SMMKings, etc.)
const fetchExternalMarketData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate market fluctuations (-10% to +15%)
  const fluctuations: Record<string, number> = {};
  
  // 1. Sync Social Services
  Object.keys(SOCIAL_CATALOG).forEach(platform => {
    SOCIAL_CATALOG[platform].forEach(service => {
      // Random multiplier between 0.9 and 1.15
      const multiplier = 0.9 + Math.random() * 0.25;
      fluctuations[service.id] = Math.round(service.price * multiplier * 100) / 100;
    });
  });

  // 2. Sync Global Services
  SERVICES_DATA.forEach(section => {
    section.items.forEach(item => {
      if (item.id && (item as any).price) {
         const multiplier = 0.95 + Math.random() * 0.1;
         fluctuations[item.id] = Math.round((item as any).price * multiplier * 100) / 100;
      }
    });
  });

  return {
    timestamp: new Date().toISOString(),
    provider: "Global Market Index v2",
    prices: fluctuations
  };
};

export const marketSync = {
  syncPrices: async (onUpdate: (data: any) => void) => {
    console.log("Starting Market Price Sync...");
    try {
      const marketData = await fetchExternalMarketData();
      
      // Update the local state or handle the new prices
      onUpdate(marketData);
      
      localStorage.setItem('ALQAID_LAST_SYNC', marketData.timestamp);
      localStorage.setItem('ALQAID_MARKET_PRICES', JSON.stringify(marketData.prices));
      
      return marketData;
    } catch (error) {
      console.error("Market sync failed:", error);
      throw error;
    }
  },
  
  getLastSyncTime: () => {
    return localStorage.getItem('ALQAID_LAST_SYNC');
  },
  
  getCachedPrices: () => {
    const cached = localStorage.getItem('ALQAID_MARKET_PRICES');
    return cached ? JSON.parse(cached) : null;
  }
};
