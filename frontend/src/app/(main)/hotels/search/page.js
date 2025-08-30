"use client"
import { useState, useEffect, useRef } from 'react';
import MainNav from '@/components/MainNav';
import HotelSearchForm from '@/components/HotelSearchForm';
import HotelFilters from '@/components/HotelFilters';
import HotelCard from '@/components/HotelCard';
import { hotelData } from '@/constants/hotelData';
import { FiFilter, FiX } from 'react-icons/fi';

export default function HotelSearchPage() {
  const [filters, setFilters] = useState({
    rating: null,
    priceRange: [0, 10000],
    bedTypes: [],
    amenities: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);

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

  return (
    <div>
      <MainNav />
      
      <div className="px-4 md:px-[190px] py-4 md:py-8">
        {/* Compact Search Form */}
        <div className="mb-6 md:mb-8">
          <HotelSearchForm />
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {hotelData['dhaka-bangladesh'].hotels.length} Hotels Found
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
              <h2 className="text-xl font-semibold text-gray-800">
                {hotelData['dhaka-bangladesh'].hotels.length} Hotels Found
              </h2>
            </div>

            <div className="grid gap-4 md:gap-6">
              {hotelData['dhaka-bangladesh'].hotels.map(hotel => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}