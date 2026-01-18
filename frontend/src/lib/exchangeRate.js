// /lib/exchangeRate.js
// Common exchange rate utilities with different markups for hotel and flight

// Configuration
const HOTEL_MARKUP_PERCENTAGE = 10; // 10% markup for hotels
const FLIGHT_MARKUP_PERCENTAGE = 8; // 8% markup for flights
const TARGET_CURRENCY = "BDT";

// Helper function to parse price strings
export const parsePrice = (priceString) => {
  if (!priceString) return { amount: 0, currency: "USD" };
  
  const cleanString = priceString.toString().trim();
  
  // Handle "৳44,640" format
  let match = cleanString.match(/^৳\s*([\d,.]+)$/);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    return { amount, currency: "BDT" };
  }
  
  // Handle "USD 288" format
  match = cleanString.match(/^([A-Z]{3})\s+([\d,.]+)$/);
  if (match) {
    return { 
      amount: parseFloat(match[2].replace(/,/g, '')), 
      currency: match[1] 
    };
  }
  
  // Handle "288 USD" format
  match = cleanString.match(/^([\d,.]+)\s+([A-Z]{3})$/);
  if (match) {
    return { 
      amount: parseFloat(match[1].replace(/,/g, '')), 
      currency: match[2] 
    };
  }
  
  // Just a number - assume USD
  match = cleanString.match(/^[\d,.]+$/);
  if (match) {
    return { 
      amount: parseFloat(cleanString.replace(/,/g, '')), 
      currency: "USD" 
    };
  }
  
  // Handle currency symbols
  match = cleanString.match(/^([^\d\s]*)\s*([\d,.]+)$/);
  if (match) {
    const currencySymbol = match[1].trim();
    const amount = parseFloat(match[2].replace(/,/g, ''));
    
    const symbolMap = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      '৳': 'BDT',
      '₽': 'RUB',
      '฿': 'THB'
    };
    
    return { 
      amount, 
      currency: symbolMap[currencySymbol] || 'USD' 
    };
  }
  
  console.warn("Could not parse price string:", priceString);
  return { amount: 0, currency: "USD" };
};

// Main conversion function
export const convertPriceToBDT = (
  priceString,
  exchangeRates,
  productType = "hotel",
  applyMarkup = true
) => {
  try {
    const { amount, currency } = parsePrice(priceString);
    
    if (!amount || amount === 0 || isNaN(amount)) {
      return "৳0";
    }
    
    // Apply appropriate markup
    const markupPercentage = productType === "flight" 
      ? FLIGHT_MARKUP_PERCENTAGE 
      : HOTEL_MARKUP_PERCENTAGE;
    
    const finalAmount = applyMarkup 
      ? amount * (1 + markupPercentage / 100) 
      : amount;
    
    // If already in BDT, just format
    if (currency === "BDT") {
      return `৳${Math.round(finalAmount).toLocaleString('en-BD')}`;
    }
    
    // Get exchange rate
    const rate = exchangeRates[TARGET_CURRENCY];
    if (!rate) {
      return `$${Math.round(finalAmount).toLocaleString()}`;
    }
    
    // Convert currency
    let convertedAmount;
    
    if (currency === "USD") {
      convertedAmount = finalAmount * rate;
    } else {
      const usdRate = exchangeRates[currency];
      if (!usdRate) {
        return `${currency} ${Math.round(finalAmount).toLocaleString()}`;
      }
      const amountInUSD = finalAmount / usdRate;
      convertedAmount = amountInUSD * rate;
    }
    
    return `৳${Math.round(convertedAmount).toLocaleString('en-BD')}`;
    
  } catch (error) {
    console.error("Price conversion error:", error);
    return `৳0`;
  }
};

// Fetch exchange rates with caching
export const fetchExchangeRates = async () => {
  const CACHE_KEY = 'exchangeRates';
  const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return rates;
      }
    }
    
    // Try primary API
    const API_KEY = "8721bcb35649e95000de54f2";
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.result === "success") {
        const rates = data.conversion_rates;
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          rates,
          timestamp: Date.now()
        }));
        return rates;
      }
    }
    
    // Fallback API
    const fallbackResponse = await fetch(
      'https://api.frankfurter.app/latest?from=USD'
    );
    
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      const rates = data.rates;
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        rates,
        timestamp: Date.now()
      }));
      return rates;
    }
    
    throw new Error('Failed to fetch exchange rates');
    
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    
    // Return default rates if all fails
  }
};