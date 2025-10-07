'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiCheck, FiHome, FiChevronRight, FiCalendar, FiUsers, FiStar, FiArrowRight, FiMapPin, FiFilter } from 'react-icons/fi';
import { FaPlane, FaHotel, FaCar, FaPassport } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const Breadcrumb = ({ destination }) => {
  const destinationName = destination.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  
  return (
    <div className="flex items-center text-sm text-gray-600 mb-4">
      <Link href="/" className="flex items-center hover:text-[#5A53A7]">
        <FiHome className="mr-2" />
        <span>Home</span>
      </Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <Link href="/umrah" className="hover:text-[#5A53A7]">Umrah</Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <span className="font-medium text-gray-800">{destinationName}</span>
    </div>
  );
};

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search packages by name, features, or destination..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A53A7] focus:border-transparent"
      />
    </div>
  );
};

const PackageDetailsModal = ({ packageData, onClose, destination }) => {
  if (!packageData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
        
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#445494] mb-4">{packageData.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="flex items-center">
              <FiCalendar className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Duration</p>
                <p className="font-medium text-sm md:text-base">{packageData.nights} Night(s) {packageData.days} Day(s)</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiUsers className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Max People</p>
                <p className="font-medium text-sm md:text-base">{packageData.max_people}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiStar className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Availability</p>
                <p className="font-medium text-xs md:text-sm">
                  {new Date(packageData.availability_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
                  {new Date(packageData.availability_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-[#5A53A7] text-xl mr-3">
                {packageData.includes_flight ? <FaPlane /> : <FaPlane className="opacity-30" />}
              </div>
              <div>
                <p className="text-gray-500 text-sm">Flight</p>
                <p className="font-medium text-sm md:text-base">{packageData.includes_flight ? 'Included' : 'Not Included'}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center p-3 rounded-lg bg-[#5A53A7]/10">
              <FaHotel className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-700 font-medium text-sm md:text-base">Hotel</p>
                <p className="text-xs md:text-sm text-gray-600">{packageData.includes_hotel ? 'Included' : 'Not Included'}</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-[#5A53A7]/10">
              <FaCar className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-700 font-medium text-sm md:text-base">Transport</p>
                <p className="text-xs md:text-sm text-gray-600">{packageData.includes_transport ? 'Included' : 'Not Included'}</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-[#5A53A7]/10">
              <FaPassport className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-700 font-medium text-sm md:text-base">Visa</p>
                <p className="text-xs md:text-sm text-gray-600">{packageData.includes_visa ? 'Included' : 'Not Included'}</p>
              </div>
            </div>
          </div>
          
          {packageData.tags && packageData.tags.length > 0 && (
            <div className="mb-6 md:mb-8">
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
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              href={`/umrah/${destination}/bookings/${packageData.id}`}
              className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center w-full sm:w-auto justify-center"
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

const FilterSidebar = ({ filters, setFilters, priceRange, setPriceRange, isOpen, onClose }) => {
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

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const toggleFlightOption = (value) => {
    setFilters(prev => ({
      ...prev,
      includesFlight: prev.includesFlight === value ? null : value
    }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-full md:h-auto w-80 md:w-64 lg:w-80 bg-white p-6 rounded-xl shadow-xl md:shadow-md border border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50 md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:relative
        overflow-y-auto
      `}>
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h3 className="text-lg font-bold text-gray-800">Filter Packages</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FiX className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-6 hidden md:block">Filter</h3>
        
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

        {/* Flight Options */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-700 mb-4">Flight</h4>
          <div className="space-y-2">
            <button
              onClick={() => toggleFlightOption(true)}
              className={`w-full flex items-center justify-between py-2 px-4 rounded-lg transition-colors ${
                filters.includesFlight === true ? 'bg-[#5A53A7]/10 border border-[#5A53A7]' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                {filters.includesFlight === true ? (
                  <FiCheck className="text-[#5A53A7] mr-2" />
                ) : (
                  <FiX className="text-gray-500 mr-2" />
                )}
                <span className="text-gray-700">With Flight</span>
              </div>
            </button>
            <button
              onClick={() => toggleFlightOption(false)}
              className={`w-full flex items-center justify-between py-2 px-4 rounded-lg transition-colors ${
                filters.includesFlight === false ? 'bg-[#5A53A7]/10 border border-[#5A53A7]' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                {filters.includesFlight === false ? (
                  <FiCheck className="text-[#5A53A7] mr-2" />
                ) : (
                  <FiX className="text-gray-500 mr-2" />
                )}
                <span className="text-gray-700">Without Flight</span>
              </div>
            </button>
          </div>
        </div>

        {/* Other Inclusions */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Package Includes</h4>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includesHotel}
              onChange={() => toggleFilter('includesHotel')}
              className="h-4 w-4 text-[#5A53A7] border-gray-300 focus:ring-[#5A53A7]"
            />
            <span className="text-gray-700">Hotel Accommodation</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includesTransport}
              onChange={() => toggleFilter('includesTransport')}
              className="h-4 w-4 text-[#5A53A7] border-gray-300 focus:ring-[#5A53A7]"
            />
            <span className="text-gray-700">Transportation</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includesVisa}
              onChange={() => toggleFilter('includesVisa')}
              className="h-4 w-4 text-[#5A53A7] border-gray-300 focus:ring-[#5A53A7]"
            />
            <span className="text-gray-700">Visa Assistance</span>
          </label>
        </div>

        {/* Apply button for mobile */}
        <button 
          onClick={onClose}
          className="mt-8 w-full py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg font-medium md:hidden"
        >
          Apply Filters
        </button>
      </div>
    </>
  );
};

const UmrahDestinationPage = () => {
  const { destination } = useParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    includesFlight: null,
    includesHotel: true,
    includesTransport: true,
    includesVisa: true
  });

  const [priceRange, setPriceRange] = useState([5000, 50000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUmrahPackages = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-packages/`;
        
        // Add filters to URL
        const params = new URLSearchParams();
        if (filters.minPrice) params.append('min_price', filters.minPrice);
        if (filters.maxPrice) params.append('max_price', filters.maxPrice);
        if (filters.includesFlight !== null) params.append('includes_flight', filters.includesFlight);
        if (filters.includesHotel !== null) params.append('includes_hotel', filters.includesHotel);
        if (filters.includesTransport !== null) params.append('includes_transport', filters.includesTransport);
        if (filters.includesVisa !== null) params.append('includes_visa', filters.includesVisa);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

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

    fetchUmrahPackages();
  }, [filters]);

  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg => 
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.tags && pkg.tags.some(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 md:px-[190px] py-8 md:py-12">
        <Breadcrumb destination={destination} />
        
        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-full py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <FiFilter className="h-5 w-5" />
            Filter Packages
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <FilterSidebar 
            filters={filters}
            setFilters={setFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          {/* Right Side Content - Packages */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredPackages.length} of {packages.length} packages
              </p>
            </div>
            
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
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map(pkg => (
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
                      <div className="p-6 md:p-8 md:w-2/3">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
                          <h2 className="text-xl md:text-2xl font-bold text-[#445494]">{pkg.title}</h2>
                          <span className="text-xl font-bold text-[#5A53A7]">
                            {pkg.discount_price > 0 ? (
                              <>
                                BDT {pkg.discount_price.toLocaleString()}
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  BDT {pkg.price.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <>BDT {pkg.price.toLocaleString()}</>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 mb-6">
                          <div className="flex items-center text-gray-600">
                            <FiCalendar className="mr-2 text-[#5A53A7]" />
                            {pkg.nights} Night(s) {pkg.days} Day(s)
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FiUsers className="mr-2 text-[#5A53A7]" />
                            Max {pkg.max_people} people
                          </div>
                          {pkg.includes_flight && (
                            <div className="flex items-center text-gray-600">
                              <FaPlane className="mr-2 text-[#5A53A7]" />
                              Flight Included
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {pkg.includes_hotel && (
                            <span className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm flex items-center">
                              <FaHotel className="mr-1" /> Hotel
                            </span>
                          )}
                          {pkg.includes_transport && (
                            <span className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm flex items-center">
                              <FaCar className="mr-1" /> Transport
                            </span>
                          )}
                          {pkg.includes_visa && (
                            <span className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm flex items-center">
                              <FaPassport className="mr-1" /> Visa
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage(pkg);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center w-full md:w-auto"
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
                  <p className="mt-1 text-gray-500">
                    {searchTerm ? 
                      `We couldn't find any packages matching "${searchTerm}".` : 
                      "We couldn't find any packages matching your filters."
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-[#5A53A7] text-white rounded-lg"
                    >
                      Clear Search
                    </button>
                  )}
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

export default UmrahDestinationPage;