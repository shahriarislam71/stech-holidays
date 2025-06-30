"use client"
import { useState } from 'react';

export default function HotelFilters({ filters, setFilters }) {
  const [expandedSections, setExpandedSections] = useState({
    rating: true,
    propertyTypes: true,
    budget: true,
    bedTypes: true,
    amenities: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating
    }));
  };

  const handleBedTypeToggle = (bedType) => {
    setFilters(prev => ({
      ...prev,
      bedTypes: prev.bedTypes.includes(bedType)
        ? prev.bedTypes.filter(type => type !== bedType)
        : [...prev.bedTypes, bedType]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Property Rating */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('rating')}
        >
          <h3 className="font-semibold text-gray-800">Property Rating</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center">
                <input
                  type="checkbox"
                  id={`rating-${stars}`}
                  checked={filters.rating === stars}
                  onChange={() => handleRatingChange(stars)}
                  className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                />
                <label htmlFor={`rating-${stars}`} className="ml-2 flex items-center">
                  {[...Array(stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-gray-600">({stars * 10 + Math.floor(Math.random() * 10)})</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Types */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('propertyTypes')}
        >
          <h3 className="font-semibold text-gray-800">Property Types</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.propertyTypes ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.propertyTypes && (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hotel"
                className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
              />
              <label htmlFor="hotel" className="ml-2 text-gray-600">
                Hotel <span className="text-gray-400">(10)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('budget')}
        >
          <h3 className="font-semibold text-gray-800">Budget</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.budget ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.budget && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>৳ 2,777</span>
              <span>৳ 7,700</span>
            </div>
            <input
              type="range"
              min="2777"
              max="7700"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Bed Types */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('bedTypes')}
        >
          <h3 className="font-semibold text-gray-800">Bed Types</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.bedTypes ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.bedTypes && (
          <div className="space-y-2">
            {[
              { type: 'Double', count: 5 },
              { type: 'Queen', count: 3 },
              { type: 'Twin bed', count: 9 },
              { type: 'King', count: 6 },
              { type: 'Triple Bed', count: 2 }
            ].map((bed, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`bed-${bed.type}`}
                  checked={filters.bedTypes.includes(bed.type)}
                  onChange={() => handleBedTypeToggle(bed.type)}
                  className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                />
                <label htmlFor={`bed-${bed.type}`} className="ml-2 text-gray-600">
                  {bed.type} <span className="text-gray-400">({bed.count})</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('amenities')}
        >
          <h3 className="font-semibold text-gray-800">Amenities</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.amenities ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.amenities && (
          <div className="space-y-2">
            {[
              { amenity: 'Coffee/Tea in Lobby', count: 4 },
              { amenity: '24 Hour Security', count: 2 },
              { amenity: 'Swimming Pool', count: 1 },
              { amenity: 'Air Conditioning', count: 7 },
              { amenity: 'Lockers', count: 1 }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`amenity-${index}`}
                  className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                />
                <label htmlFor={`amenity-${index}`} className="ml-2 text-gray-600">
                  {item.amenity} <span className="text-gray-400">({item.count})</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}