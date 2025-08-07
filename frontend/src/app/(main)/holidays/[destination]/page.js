'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiCheck, FiHome, FiChevronRight, FiCalendar, FiUsers, FiStar, FiArrowRight, FiMapPin } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';   // ⬅️ new

const Breadcrumb = ({ destination }) => {
  const destinationName = destination.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  
  return (
    <div className="flex items-center text-sm text-gray-600 mb-6">
      <Link href="/" className="flex items-center hover:text-[#5A53A7]">
        <FiHome className="mr-2" />
        <span>Home</span>
      </Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <Link href="/holidays" className="hover:text-[#5A53A7]">Holidays</Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <span className="font-medium text-gray-800">{destinationName}</span>
    </div>
  );
};

const PackageDetailsModal = ({ packageData, onClose, destination }) => {
  if (!packageData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="h-64 bg-gray-200 overflow-hidden relative">
            {packageData.featured_image && (
              <Image
                src={packageData.featured_image}
                alt={packageData.title}
                fill
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
          >
            <FiX className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        <div className="p-8">
          <h2 className="text-3xl font-bold text-[#445494] mb-4">{packageData.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center">
              <FiCalendar className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Duration</p>
                <p className="font-medium">{packageData.nights} Night(s) {packageData.days} Day(s)</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiUsers className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Max People</p>
                <p className="font-medium">{packageData.max_people}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiStar className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Availability</p>
                <p className="font-medium">
                  {new Date(packageData.availability_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
                  {new Date(packageData.availability_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          
          {packageData.tags && packageData.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#445494] mb-4">Package Includes</h3>
              <div className="flex flex-wrap gap-2">
                {packageData.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {packageData.details && packageData.details.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-[#445494] mb-4">Travel Plan</h3>
              <div className="space-y-6">
                {packageData.details.map((day, index) => (
                  <div key={index} className="border-l-2 border-[#5A53A7] pl-6 py-2 relative">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#5A53A7] rounded-full"></div>
                    <h4 className="text-lg font-semibold text-[#5A53A7] mb-2">Day {day.day}: {day.title}</h4>
                    <ul className="space-y-2">
                      {day.activities.map((activity, i) => (
                        <li key={i} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-[#55C3A9] rounded-full mt-2 mr-2"></span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between items-center">
            <div>
              <p className="text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-[#5A53A7]">
                BDT {packageData.price.toLocaleString()}
                {packageData.discount_price && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    BDT {packageData.discount_price.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <Link 
              href={`/holidays/${destination}/bookings/${packageData.id}-${packageData.slug}`}
              className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center"
            >
              Book This Package
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const HolidayDestinationPage = () => {
  const { destination } = useParams();  // destination is now pulled from the route  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    durations: [],
    hasFlight: null,
    tags: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [priceRange, setPriceRange] = useState([5000, 50000]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [flightOption, setFlightOption] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const fetchHolidayPackages = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/holiday-packages/?destination_slug=${destination}`;
        
        // Add filters to URL
        if (filters.minPrice) url += `&min_price=${filters.minPrice}`;
        if (filters.maxPrice) url += `&max_price=${filters.maxPrice}`;
        if (filters.durations.length) url += `&duration=${filters.durations.join(',')}`;
        if (filters.hasFlight !== null) url += `&includes_flight=${filters.hasFlight}`;
        if (filters.tags.length) url += `&tags=${filters.tags.join(',')}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch packages');
        const data = await response.json();
        setPackages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidayPackages();
  }, [destination, filters]);

  // Fetch available destinations for search
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/holiday-destinations/`
        );
        if (!response.ok) throw new Error('Failed to fetch destinations');
        const data = await response.json();
        setFilteredCountries(data.destinations.map(dest => ({
          name: dest.name,
          value: dest.slug,
        })));
      } catch (err) {
        console.error('Error fetching destinations:', err);
      }
    };

    fetchDestinations();
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      setFilteredCountries(prev => 
        prev.filter(country => 
          country.name.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };

  const handleCountrySelect = (country) => {
    setSearchTerm(country.name);
    setShowSuggestions(false);
    // Navigate to selected country
    window.location.href = `/holidays/${country.value}`;
  };

  const toggleDuration = (duration) => {
    const newDurations = selectedDurations.includes(duration)
      ? selectedDurations.filter(d => d !== duration)
      : [...selectedDurations, duration];
    setSelectedDurations(newDurations);
    setFilters(prev => ({ ...prev, durations: newDurations }));
  };

  const toggleFlightOption = (option) => {
    const newOption = flightOption === option ? null : option;
    setFlightOption(newOption);
    setFilters(prev => ({ ...prev, hasFlight: newOption === 'with' }));
  };

  const handlePriceChange = (index, value) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(value);
    setPriceRange(newPriceRange);
    setFilters(prev => ({
      ...prev,
      minPrice: newPriceRange[0],
      maxPrice: newPriceRange[1]
    }));
  };

  const destinationName = destination.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-[190px] py-12">
        <Breadcrumb destination={destination} />
        
        <div className="mb-8 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search destinations..."
              className="w-full pl-12 pr-12 py-4 border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7] bg-white text-gray-800 transition-all duration-300 hover:shadow-md"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
              </button>
            )}
          </div>
          
          {showSuggestions && filteredCountries.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white shadow-xl rounded-lg max-h-60 overflow-auto border border-gray-200">
              {filteredCountries.map((country, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center transition-colors duration-200"
                  onClick={() => handleCountrySelect(country)}
                >
                  <FiMapPin className="mr-3 text-[#5A53A7]" />
                  <div>
                    <div className="font-medium text-gray-800">{country.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-full md:w-64 lg:w-80 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Filter</h3>
            
            {/* Price Range */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-700 mb-4">Price (Per Person)</h4>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">৳ {priceRange[0].toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-600">৳ {priceRange[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm"
              />
              <input
                type="range"
                min="0"
                max="1000000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm mt-2"
              />
            </div>

            {/* Package Duration */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-700 mb-4">Package Duration</h4>
              <div className="grid grid-cols-2 gap-2">
                {['24', '1-2', '3-5', '5+'].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => toggleDuration(duration)}
                    className={`py-2 px-3 rounded-lg text-sm flex flex-col items-center transition-colors ${
                      selectedDurations.includes(duration)
                        ? 'bg-[#5A53A7] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-medium">
                      {duration === '24' ? '24 hr' : 
                       duration === '1-2' ? '1-2 Days' : 
                       duration === '3-5' ? '3-5 Days' : '5+ days'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flight Options */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-700 mb-4">Flight</h4>
              <div className="space-y-2">
                <button
                  onClick={() => toggleFlightOption('with')}
                  className={`w-full flex items-center justify-between py-2 px-4 rounded-lg transition-colors ${
                    flightOption === 'with' ? 'bg-[#5A53A7]/10 border border-[#5A53A7]' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    {flightOption === 'with' ? (
                      <FiCheck className="text-[#5A53A7] mr-2" />
                    ) : (
                      <FiX className="text-gray-500 mr-2" />
                    )}
                    <span className="text-gray-700">With Flight</span>
                  </div>
                </button>
                <button
                  onClick={() => toggleFlightOption('without')}
                  className={`w-full flex items-center justify-between py-2 px-4 rounded-lg transition-colors ${
                    flightOption === 'without' ? 'bg-[#5A53A7]/10 border border-[#5A53A7]' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    {flightOption === 'without' ? (
                      <FiCheck className="text-[#5A53A7] mr-2" />
                    ) : (
                      <FiX className="text-gray-500 mr-2" />
                    )}
                    <span className="text-gray-700">Without Flight</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side Content - Packages */}
          <div className="flex-1">
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7]"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <div className="text-red-500 mb-4">Error: {error}</div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#5A53A7] text-white rounded"
                  >
                    Retry
                  </button>
                </div>
              ) : packages.length > 0 ? (
                packages.map(pkg => (
                  <div 
                    key={pkg.id} 
                    className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 h-64 md:h-auto relative">
                        {pkg.featured_image && (
                          <Image
                            src={pkg.featured_image} 
                            alt={pkg.title}
                            fill
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-8 md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-2xl font-bold text-[#445494]">{pkg.title}</h2>
                          <span className="text-xl font-bold text-[#5A53A7]">
                            BDT {pkg.price.toLocaleString()}
                            {pkg.discount_price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                BDT {pkg.discount_price.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center text-gray-600">
                            <FiCalendar className="mr-2 text-[#5A53A7]" />
                            {pkg.nights} Night(s) {pkg.days} Day(s)
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FiUsers className="mr-2 text-[#5A53A7]" />
                            {pkg.max_people}
                          </div>
                          {pkg.includes_flight && (
                            <div className="flex items-center text-gray-600">
                              <FaPlane className="mr-2 text-[#5A53A7]" />
                              Flight Included
                            </div>
                          )}
                        </div>
                        
                        {pkg.tags && pkg.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {pkg.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage(pkg);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center"
                        >
                          View Details
                          <FiArrowRight className="ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No packages found</h3>
                  <p className="mt-1 text-gray-500">We couldn't find any packages matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedPackage && (
        <PackageDetailsModal 
          packageData={selectedPackage} 
          onClose={() => setSelectedPackage(null)}
          destination={destination}
        />
      )}
    </div>
  );
};

export default HolidayDestinationPage;