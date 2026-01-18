// /hooks/useExchangeRates.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchExchangeRates, convertPriceToBDT } from '@/lib/exchangeRate';

export const useExchangeRates = () => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchExchangeRates();
      setRates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load exchange rates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const formatPrice = (priceString, productType = "hotel", applyMarkup = true) => {
    if (loading || Object.keys(rates).length === 0) {
      return "৳...";
    }
    
    return convertPriceToBDT(priceString, rates, productType, applyMarkup);
  };

  return {
    rates,
    loading,
    error,
    formatPrice,
    refreshRates: loadRates
  };
};