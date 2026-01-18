"use client"
import { useState, useEffect, useRef } from 'react';
import MainNav from '@/components/MainNav';
import HotelSearchForm from '@/components/HotelSearchForm';
import HotelFilters from '@/components/HotelFilters';
import HotelCard from '@/components/HotelCard';
import { FiFilter, FiX } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import { useExchangeRates } from '@/app/hooks/useExchangeRates';

export default function HotelSearchPage() {
  const [filters, setFilters] = useState({
    rating: null,
    priceRange: [0, 10000],
    bedTypes: [],
    amenities: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const filtersRef = useRef(null);
  
    const { formatPrice } = useExchangeRates();
  
  // Format hotel prices
  const formatHotelPrice = (price) => {
    return formatPrice(`USD ${price}`, "hotel", true);
  };

  // Use Next.js useSearchParams hook to react to URL changes
  const urlSearchParams = useSearchParams();

  // Store search parameters in localStorage
  const storeSearchParams = (params) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotelSearchParams', JSON.stringify(params));
    }
  };

  // Get search parameters from URL or localStorage
  const getSearchParams = () => {
    if (typeof window === 'undefined') return null;
    
    // Get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearchParams = {
      destination: urlParams.get('destination'),
      lat: urlParams.get('lat'),
      lng: urlParams.get('lng'),
      checkIn: urlParams.get('checkIn'),
      checkOut: urlParams.get('checkOut'),
      rooms: parseInt(urlParams.get('rooms')) || 1,
      adults: parseInt(urlParams.get('adults')) || 1,
      children: parseInt(urlParams.get('children')) || 0
    };

    console.log('URL Search Parameters:', urlSearchParams);

    // If URL has parameters, use them and store them
    if (urlSearchParams.destination && urlSearchParams.lat && urlSearchParams.lng) {
      storeSearchParams(urlSearchParams);
      return urlSearchParams;
    }

    // If no URL parameters, try to get from localStorage (when coming back from hotel details)
    const storedParams = localStorage.getItem('hotelSearchParams');
    if (storedParams) {
      console.log('Using stored parameters from localStorage');
      return JSON.parse(storedParams);
    }

    // Default fallback parameters
    console.log('Using default parameters');
    return {
      destination: 'dhaka-bangladesh',
      lat: '23.8103',
      lng: '90.4125',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rooms: 1,
      adults: 1,
      children: 0
    };
  };

  // Fetch hotels from API
  const fetchHotels = async (currentSearchParams = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const paramsToUse = currentSearchParams || getSearchParams();
      setSearchParams(paramsToUse);

      console.log('Fetching hotels with parameters:', paramsToUse);

      if (!paramsToUse?.destination || !paramsToUse?.lat || !paramsToUse?.lng) {
        throw new Error('Missing required search parameters: destination, lat, lng');
      }

      // Prepare children ages array (default age 0 for children)
      const childrenAges = Array(paramsToUse.children).fill(0);

      // CORRECTED REQUEST BODY - Using location object with geographic_coordinates
      const requestBody = {
        check_in_date: paramsToUse.checkIn,
        check_out_date: paramsToUse.checkOut,
        location: {
          geographic_coordinates: {
            latitude: parseFloat(paramsToUse.lat),
            longitude: parseFloat(paramsToUse.lng)
          },
          radius: 5 // 5km radius as per requirement
        },
        travelers: {
          adults: paramsToUse.adults,
          children_ages: childrenAges
        },
        rooms: paramsToUse.rooms
      };

      console.log('Sending hotel search request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.status === 'success') {
        setHotels(data.results || []);
      } else {
        throw new Error(data.message || 'Failed to fetch hotels');
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(err.message);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch hotels when component mounts or URL changes
  useEffect(() => {
    console.log('URL parameters changed, fetching hotels...');
    const currentParams = getSearchParams();
    fetchHotels(currentParams);
  }, [urlSearchParams]); // Re-run when URL search params change

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // Apply filters to hotels
  const filteredHotels = hotels.filter(hotel => {
    // Rating filter
    if (filters.rating && Math.floor(hotel.rating) !== filters.rating) {
      return false;
    }

    // Price filter
    const price = hotel.pricing?.total_amount || 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    // Add more filter logic as needed for bed types and amenities

    return true;
  });

  // Format destination for display
  const formatDestination = (destination) => {
    return destination
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle manual refetch (for error retry)
  const handleRefetch = () => {
    const currentParams = getSearchParams();
    fetchHotels(currentParams);
  };

  return (
    <div>
      <MainNav />
      
      <div className="px-4 md:px-[190px] py-4 md:py-8">
        {/* Compact Search Form */}
        <div className="mb-6 md:mb-8">
          <HotelSearchForm 
            initialParams={searchParams} 
            onSearch={() => {
              // Force a refetch when search is performed
              const currentParams = getSearchParams();
              fetchHotels(currentParams);
            }}
          />
        </div>


        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7] mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for hotels...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Hotels</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={handleRefetch}
                className="px-6 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4791] transition"
              >
                Try Again
              </button>
              <div className="text-xs text-red-500">
                <p>Check if:</p>
                <ul className="list-disc list-inside text-left mt-2">
                  <li>Backend server is running on http://localhost:8000</li>
                  <li>API endpoint /api/hotels/search/ is accessible</li>
                  <li>Coordinates are valid: {searchParams?.lat}, {searchParams?.lng}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Mobile Filter Button */}
            <div className="md:hidden flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {filteredHotels.length} Hotels Found
              </h2>
              <button 
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 bg-[#5A53A7] text-white px-4 py-2 rounded-lg"
              >
                <FiFilter size={18} />
                Filters
              </button>
            </div>

            <div className="flex gap-6 md:gap-8">
              {/* Filters Sidebar - Mobile overlay */}
              {showFilters && (
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden">
                  <div 
                    ref={filtersRef}
                    className="fixed left-0 top-0 h-full w-4/5 max-w-sm bg-white z-50 overflow-y-auto animate-in slide-in-from-left duration-300"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                        <button 
                          onClick={() => setShowFilters(false)} 
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FiX size={24} />
                        </button>
                      </div>
                      <HotelFilters 
                        filters={filters} 
                        setFilters={setFilters} 
                        onApply={() => setShowFilters(false)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Filters Sidebar - Desktop */}
              <div className="hidden md:block w-full md:w-1/4">
                <HotelFilters filters={filters} setFilters={setFilters} />
              </div>

              {/* Results */}
              <div className="w-full md:w-3/4">
                {/* Results header - hidden on mobile */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {filteredHotels.length} Hotels Found
                    </h2>
                    <button 
                      onClick={handleRefetch}
                      className="text-sm text-[#5A53A7] hover:text-[#4a4791] font-medium"
                    >
                      Refresh Results
                    </button>
                  </div>
                </div>

                {/* No Results */}
                {filteredHotels.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                      <h3 className="text-yellow-800 text-lg font-semibold mb-2">No hotels found</h3>
                      <p className="text-yellow-700 mb-4">
                        Try adjusting your search criteria or try a different location.
                      </p>
                      <button 
                        onClick={handleRefetch}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                      >
                        Search Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Hotels Grid */}
                <div className="grid gap-4 md:gap-6">
                  {filteredHotels.map(hotel => (
                    <HotelCard key={hotel.search_result_id} hotel={hotel} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}