import Link from 'next/link';
import React, { useState } from 'react';
import { useExchangeRates } from "@/app/hooks/useExchangeRates";

const HotelCard = ({ hotel }) => {
  const [imageError, setImageError] = useState(false);
  
  // Format price based on currency
 const { formatPrice } = useExchangeRates();

  // Get first photo or placeholder
  const mainPhoto = hotel.photos?.[0]?.url || '/hotel-placeholder.jpg';
  
  // Format location
  const location = hotel.location?.address ? 
    `${hotel.location.address.city_name}, ${hotel.location.address.country_code}` : 
    'Location not available';

  // Get amenities (limit to 4)
  const amenities = hotel.amenities?.slice(0, 4).map(a => a.description) || [];

  // Create hotel detail URL using search_result_id
  const hotelDetailUrl = `/hotels/search/${hotel.search_result_id}`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-48 w-full object-cover md:w-64" 
            src={imageError ? '/hotel-placeholder.jpg' : mainPhoto} 
            alt={hotel.name}
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
              <p className="mt-1 text-gray-600">{location}</p>
            </div>
            <div className="flex items-center bg-blue-100 px-2 py-1 rounded">
              <span className="text-blue-800 font-medium">{hotel.rating}</span>
              <svg className="w-4 h-4 ml-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-700 line-clamp-2">{hotel.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {amenity}
                </span>
              ))}
              {hotel.amenities?.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-gray-900">
              {formatPrice(`${hotel.pricing?.currency} ${hotel.pricing?.total_amount}`, "hotel", true)}
              </span>
              <span className="text-gray-600"> total</span>
              {hotel.pricing?.due_at_accommodation_amount > 0 && (
                <div className="text-sm text-gray-500">
                  {formatPrice(hotel.pricing.due_at_accommodation_amount, hotel.pricing.currency)} at property
                </div>
              )}
            </div>
            
            {/* View Details Button with search_result_id */}
            <Link 
              href={hotelDetailUrl}
              className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-lg hover:opacity-90 transition"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;