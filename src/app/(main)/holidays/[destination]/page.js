'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiCheck, FiHome, FiChevronRight, FiCalendar, FiUsers, FiStar, FiArrowRight, FiMapPin } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import Link from 'next/link';

// Data
const countries = [
  { name: 'Bangkok, Thailand', value: 'bangkok-thailand' },
  { name: 'Dubai, UAE', value: 'dubai-uae' },
  { name: 'Bali, Indonesia', value: 'bali-indonesia' },
  { name: 'Singapore', value: 'singapore' },
  { name: 'Malaysia', value: 'malaysia' },
  { name: 'Maldives', value: 'maldives' },
];

const tags = [
  { name: 'Bed & Breakfast', count: 6 },
  { name: 'Pick & Drop', count: 6 },
  { name: 'Relaxation', count: 6 },
  { name: 'Spiritual', count: 6 },
  { name: 'Local Experiences', count: 6 },
  { name: 'Weekend Destinations', count: 6 },
  { name: 'Holiday Packages', count: 6 }
];

const durationOptions = [
  { label: '24 hr', value: '24' },
  { label: '1-2 Days', value: '1-2' },
  { label: '3-5 Days', value: '3-5' },
  { label: '5+ days', value: '5+' }
];

const packages = {
  'bangkok-thailand': [
    {
      id: 1,
      title: 'Blissful Bangkok',
      duration: '2 Night(s) 3 Day(s)',
      maxPeople: '2-20',
      availability: "01 Jun' 25 - 31 Jul' 25",
      price: 'BDT 10,340',
      image: '/countries/visa-photo-1.jpg',
      tags: ['Bed & Breakfast', 'Pick & Drop', '5+'],
      suitableFor: ['Family', 'Friends'],
      hasFlight: false,
      details: [
        {
          day: 1,
          title: 'Arrival & City Tour',
          activities: [
            'Arrival at Bangkok Airport',
            'Transfer to hotel',
            'Visit Grand Palace & Wat Pho',
            'Evening at Khao San Road'
          ]
        },
        {
          day: 2,
          title: 'Cultural Exploration',
          activities: [
            'Visit Floating Market',
            'Lunch at local restaurant',
            'Temple of Dawn visit',
            'Evening cruise on Chao Phraya River'
          ]
        },
        {
          day: 3,
          title: 'Departure',
          activities: [
            'Free time for shopping',
            'Check-out from hotel',
            'Transfer to airport'
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Golden Horizon: Pattaya Mini Break',
      duration: '2 Night(s) 3 Day(s)',
      maxPeople: '2-20',
      availability: "01 Jun' 25 - 31 Jul' 25",
      price: 'BDT 12,320',
      image: '/countries/visa-photo-2.jpg',
      tags: ['Bed & Breakfast', 'Pick & Drop', '5+'],
      suitableFor: ['Family', 'Friends'],
      hasFlight: true,
      details: [
        {
          day: 1,
          title: 'Arrival & Beach Time',
          activities: [
            'Arrival at Pattaya',
            'Check-in at beach resort',
            'Relax at Jomtien Beach',
            'Evening at Walking Street'
          ]
        },
        {
          day: 2,
          title: 'Island Adventure',
          activities: [
            'Boat trip to Coral Island',
            'Snorkeling and water sports',
            'Seafood lunch by the beach',
            'Sunset viewpoint visit'
          ]
        },
        {
          day: 3,
          title: 'Departure',
          activities: [
            'Morning at leisure',
            'Check-out from hotel',
            'Transfer to airport'
          ]
        }
      ]
    }
  ]
};

const Breadcrumb = ({ destination }) => {
  const destinationName = destination.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  
  return (
    <div className="flex items-center text-sm text-gray-600 mb-6">
      <a href="/" className="flex items-center hover:text-[#5A53A7]">
        <FiHome className="mr-2" />
        <span>Home</span>
      </a>
      <FiChevronRight className="mx-2 text-gray-400" />
      <a href="/holidays" className="hover:text-[#5A53A7]">Holidays</a>
      <FiChevronRight className="mx-2 text-gray-400" />
      <span className="font-medium text-gray-800">{destinationName}</span>
    </div>
  );
};

const PackageDetailsModal = ({ packageData, onClose, destination }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img 
              src={packageData.image} 
              alt={packageData.title}
              className="w-full h-full object-cover"
            />
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
                <p className="font-medium">{packageData.duration}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiUsers className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Max People</p>
                <p className="font-medium">{packageData.maxPeople}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiStar className="text-[#5A53A7] text-xl mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Availability</p>
                <p className="font-medium">{packageData.availability}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#445494] mb-4">Package Includes</h3>
            <div className="flex flex-wrap gap-2">
              {packageData.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
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
          
          <div className="mt-8 flex justify-between items-center">
            <div>
              <p className="text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-[#5A53A7]">{packageData.price}</p>
            </div>
            <Link 
              href={`/holidays/${destination}/bookings/${packageData.id}`}
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

const HolidayDestinationPage = ({ params }) => {
  const destination = React.use(params)?.destination || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [priceRange, setPriceRange] = useState([10340, 30690]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [flightOption, setFlightOption] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const searchRef = useRef(null);

  const destinationName = destination.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  const destinationPackages = packages[destination] || [];

  useEffect(() => {
    const currentCountry = countries.find(c => c.value === destination);
    if (currentCountry) {
      setSearchTerm(currentCountry.name);
    }
  }, [destination]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      setFilteredCountries(
        countries.filter(country => 
          country.name.toLowerCase().includes(term.toLowerCase())
      ));
    } else {
      setFilteredCountries(countries);
    }
  };

  const handleCountrySelect = (country) => {
    setSearchTerm(country.name);
    setShowSuggestions(false);
  };

  const toggleDuration = (duration) => {
    setSelectedDurations(prev =>
      prev.includes(duration)
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-[190px] py-12">
        <Breadcrumb destination={destination} />
        
        {/* Enhanced Search Section */}
        <div className="mb-8 relative" ref={searchRef}>
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
            <div className="absolute z-10 mt-2 w-full bg-white shadow-xl rounded-lg max-h-60 overflow-auto border border-gray-200">
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
                min="5000"
                max="50000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm"
              />
              <input
                type="range"
                min="5000"
                max="50000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm mt-2"
              />
            </div>

            {/* Package Duration */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-700 mb-4">Package Duration</h4>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleDuration(option.value)}
                    className={`py-2 px-3 rounded-lg text-sm flex flex-col items-center transition-colors ${
                      selectedDurations.includes(option.value)
                        ? 'bg-[#5A53A7] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flight Options */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-700 mb-4">Flight</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setFlightOption('with')}
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
                    <span className="text-gray-700">With Flight (0)</span>
                  </div>
                </button>
                <button
                  onClick={() => setFlightOption('without')}
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
                    <span className="text-gray-700">Without Flight (6)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4">Tags</h4>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search Tags"
                  className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A53A7] focus:border-transparent text-sm"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
                <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => toggleTag(tag.name)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'bg-[#5A53A7]/10 text-[#5A53A7] font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tag.name}</span>
                    <span className="text-gray-500">({tag.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Content - Single Column Cards */}
          <div className="flex-1">
            <div className="space-y-6">
              {destinationPackages.length > 0 ? (
                destinationPackages.map(pkg => (
                  <div 
                    key={pkg.id} 
                    className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 h-64 md:h-auto">
                        <img 
                          src={pkg.image} 
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-8 md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-2xl font-bold text-[#445494]">{pkg.title}</h2>
                          <span className="text-xl font-bold text-[#5A53A7]">{pkg.price}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center text-gray-600">
                            <FiCalendar className="mr-2 text-[#5A53A7]" />
                            {pkg.duration}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FiUsers className="mr-2 text-[#5A53A7]" />
                            {pkg.maxPeople}
                          </div>
                          {pkg.hasFlight && (
                            <div className="flex items-center text-gray-600">
                              <FaPlane className="mr-2 text-[#5A53A7]" />
                              Flight Included
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {pkg.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
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
                <div className="col-span-full text-center py-10">
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