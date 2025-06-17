"use client"

import React, { useState } from 'react';

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState('holidays');
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  const [showHolidayDestinations, setShowHolidayDestinations] = useState(false);
  const [selectedHolidayDestination, setSelectedHolidayDestination] = useState('');
  const [visaSearchQuery, setVisaSearchQuery] = useState('');
  const [showVisaCountries, setShowVisaCountries] = useState(false);
  const [selectedVisaCountry, setSelectedVisaCountry] = useState('');

  const holidayDestinations = [
    'Kathmandu, Nepal',
    'Kuala Lumpur, Malaysia',
    'Male, Maldives',
    'Mekkah, Saudi Arabia',
    'Singapore, Singapore'
  ];

  const visaCountries = [
    'Singapore',
    'Thailand',
    'Malaysia',
    'China',
    'Sweden',
    'Sri Lanka',
    'Canada',
    'United States'
  ];

  const handleHolidaySearch = () => {
    console.log('Searching holiday for:', selectedHolidayDestination || holidaySearchQuery);
  };

  const handleVisaSearch = () => {
    console.log('Searching visa for:', selectedVisaCountry || visaSearchQuery);
  };

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Background Video */}
      <div className="relative h-[400px]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
          poster="/travel-poster.jpg"
        >
          <source src="/banner.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-traveling-down-a-tree-lined-road-15837-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-[400px] px-[190px] -mt-[450px]">
        <h1 className="text-white text-5xl font-bold mb-4 text-center">
          Create A New Story With Every Trip
        </h1>
        <p className="text-white text-xl mb-12">
          Flight, Hotel, Holidays & Visa at your fingertips
        </p>
      </div>

      {/* Booking Sections */}
      <div className="relative mx-[190px]">
        <div className="bg-gradient-to-r from-[#4a42a1] via-[#3e7e8f] to-[#2fb1a2] rounded-3xl shadow-xl">
          {/* Tabs */}
          <div className="flex justify-center -mt-16">
            <div className="flex bg-white/20 backdrop-blur-md rounded-full overflow-hidden shadow-lg -mt-6 border border-white/20">
              <button 
                onClick={() => setActiveTab('flight')}
                className={`px-8 py-3 text-white font-medium hover:bg-white/20 transition-colors ${activeTab === 'flight' ? 'bg-white/30 font-semibold' : ''}`}
              >
                Flight
              </button>
              <button 
                onClick={() => setActiveTab('hotel')}
                className={`px-8 py-3 text-white font-medium hover:bg-white/20 transition-colors ${activeTab === 'hotel' ? 'bg-white/30 font-semibold' : ''}`}
              >
                Hotel
              </button>
              <button 
                onClick={() => setActiveTab('holidays')}
                className={`px-8 py-3 text-white font-medium hover:bg-white/20 transition-colors ${activeTab === 'holidays' ? 'bg-white/30 font-semibold' : ''}`}
              >
                Holidays
              </button>
              <button 
                onClick={() => setActiveTab('visa')}
                className={`px-8 py-3 text-white font-medium hover:bg-white/20 transition-colors ${activeTab === 'visa' ? 'bg-white/30 font-semibold' : ''}`}
              >
                Visa
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {/* Flight Section */}
            {activeTab === 'flight' && (
              <div>
                <p className="text-white/80">flights data will be shown later</p>
              </div>
            )}

            {/* Hotel Section */}
            {activeTab === 'hotel' && (
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <p className="text-white/90 font-medium mb-2">Destination</p>
                  <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white">
                    <span>Chattogram, Bangladesh</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-white/90 font-medium mb-2">Check In</p>
                  <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white">
                    <span>Thu, Jun 19</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-white/90 font-medium mb-2">8 Nights</p>
                  <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white">
                    <span>Check Out: Fri, Jun 27</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-white/90 font-medium mb-2">Rooms & Guests</p>
                  <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white">
                    <span>1 Room, 1 Adult, 0 Child</span>
                  </div>
                </div>
              </div>
            )}

            {/* Holidays Section */}
            {activeTab === 'holidays' && (
              <div>
                <div className="relative mb-6">
                  <p className="text-white/90 font-medium mb-2">Search Destination</p>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={selectedHolidayDestination || holidaySearchQuery}
                        onChange={(e) => setHolidaySearchQuery(e.target.value)}
                        onFocus={() => setShowHolidayDestinations(true)}
                        onBlur={() => setTimeout(() => setShowHolidayDestinations(false), 200)}
                        placeholder="Where do you want to go?"
                        className="w-full p-3 rounded-l-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      {showHolidayDestinations && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30">
                          {holidayDestinations
                            .filter(dest => dest.toLowerCase().includes(holidaySearchQuery.toLowerCase()))
                            .map(destination => (
                              <div
                                key={destination}
                                className="p-3 hover:bg-[#4a42a1] hover:text-white cursor-pointer text-gray-800 hover:text-white"
                                onClick={() => {
                                  setSelectedHolidayDestination(destination);
                                  setShowHolidayDestinations(false);
                                }}
                              >
                                {destination}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleHolidaySearch}
                      className="bg-white text-[#4a42a1] px-6 py-3 rounded-r-lg hover:bg-white/90 transition-colors font-semibold"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p className="text-white/90 font-medium">Need a customised holiday?</p>
                  <button className="bg-white text-[#4a42a1] px-6 py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition">
                    Request Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Visa Section */}
            {activeTab === 'visa' && (
              <div>
                <div className="relative mb-6">
                  <p className="text-white/90 font-medium mb-2">Search Country</p>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={selectedVisaCountry || visaSearchQuery}
                        onChange={(e) => setVisaSearchQuery(e.target.value)}
                        onFocus={() => setShowVisaCountries(true)}
                        onBlur={() => setTimeout(() => setShowVisaCountries(false), 200)}
                        placeholder="Which country visa do you need?"
                        className="w-full p-3 rounded-l-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      {showVisaCountries && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30">
                          {visaCountries
                            .filter(country => country.toLowerCase().includes(visaSearchQuery.toLowerCase()))
                            .map(country => (
                              <div
                                key={country}
                                className="p-3 hover:bg-[#4a42a1] hover:text-white cursor-pointer text-gray-800 hover:text-white"
                                onClick={() => {
                                  setSelectedVisaCountry(country);
                                  setShowVisaCountries(false);
                                }}
                              >
                                {country}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleVisaSearch}
                      className="bg-white text-[#4a42a1] px-6 py-3 rounded-r-lg hover:bg-white/90 transition-colors font-semibold"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p className="text-white/90 font-medium">Need visa assistance?</p>
                  <button className="bg-white text-[#4a42a1] px-6 py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition">
                    Request Help
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;