"use client"
import { useState } from 'react';
import MainNav from '@/components/MainNav';
import HotelSearchForm from '@/components/HotelSearchForm';
import HotelFilters from '@/components/HotelFilters';
import HotelCard from '@/components/HotelCard';
import { hotelData } from '@/constants/hotelData';

export default function HotelSearchPage() {
  const [filters, setFilters] = useState({
    rating: null,
    priceRange: [0, 10000],
    bedTypes: [],
    amenities: []
  });

  return (
    <div>
      <MainNav />
      
      <div className="px-[190px] py-8">
        {/* Compact Search Form */}
        <div className="mb-8">
          <HotelSearchForm />
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-1/4">
            <HotelFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Results */}
          <div className="w-3/4">
            <div className="grid gap-6">
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