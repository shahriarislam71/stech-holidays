// components/FlightSearchResults.js
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FlightCard = ({ flight, searchParams }) => {
  const [showPackages, setShowPackages] = useState(false);
  const [farePackages, setFarePackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageError, setPackageError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  // Convert searchParams to a plain object safely
  const getSearchParamsObject = () => {
    if (!searchParams) return {};
    try {
      // If it's already an object, return it
      if (typeof searchParams === 'object' && !(searchParams instanceof URLSearchParams)) {
        return searchParams;
      }
      // If it's URLSearchParams, convert to object
      if (searchParams instanceof URLSearchParams) {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
        return params;
      }
      return {};
    } catch (error) {
      console.error('Error converting searchParams:', error);
      return {};
    }
  };

  const searchParamsObj = getSearchParamsObject();

  // Fetch fare packages
  useEffect(() => {
    const fetchFarePackages = async () => {
      if (!showPackages || !flight.id) return;
      
      setLoadingPackages(true);
      setPackageError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      try {
        const response = await fetch(`${apiUrl}/flights/offers/${flight.id}/package/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch packages: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.fares && Array.isArray(data.fares)) {
          setFarePackages(data.fares);
        } else {
          throw new Error('Invalid package data received');
        }
      } catch (error) {
        console.error('Error fetching fare packages:', error);
        setPackageError(error.message);
        setFarePackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchFarePackages();
  }, [showPackages, flight.id]);

  // Reset packages when modal closes
  useEffect(() => {
    if (!showPackages) {
      setFarePackages([]);
      setPackageError(null);
    }
  }, [showPackages]);

  // Get airline logo
  const getAirlineLogo = (airlineName) => {
    const logoMap = {
      "Biman Bangladesh Airlines": "/biman-logo.png",
      "Duffel Airways": "/duffel-logo.png",
    };
    return logoMap[airlineName] || `https://logo.clearbit.com/${airlineName.toLowerCase().replace(/\s+/g, '')}.com`;
  };

  // Helper function to group segments by journey
  const getJourneySegments = () => {
    if (!flight.segments || flight.segments.length === 0) return [];
    
    if (flight.tripType === "Round-trip" && flight.segments.length >= 2) {
      return [
        {
          type: "outbound",
          segments: [flight.segments[0]],
          summary: `${flight.segments[0].departure.airportCode} → ${flight.segments[0].arrival.airportCode}`
        },
        {
          type: "return", 
          segments: [flight.segments[1]],
          summary: `${flight.segments[1].departure.airportCode} → ${flight.segments[1].arrival.airportCode}`
        }
      ];
    }
    
    if (flight.tripType === "Multi-city" && flight.segments.length > 0) {
      return [
        {
          type: "multi-city",
          segments: flight.segments,
          summary: flight.summary || `Multi-city (${flight.segments.length} flights)`
        }
      ];
    }
    
    return [
      {
        type: "one-way",
        segments: flight.segments,
        summary: flight.summary || `${flight.segments[0].departure.airportCode} → ${flight.segments[flight.segments.length - 1].arrival.airportCode}`
      }
    ];
  };
  
  const handleSelectFlight = () => {
    const destination = searchParamsObj.destination;
    if (!destination) {
      alert("Destination information is missing. Please try your search again.");
      return;
    }

    const queryParams = new URLSearchParams({
      offer_id: flight.id,
      price: flight.totalPrice,
      airline: flight.airlines?.[0] || 'Unknown Airline',
      flight_number: flight.segments?.[0]?.flightNumber || '',
      departure: flight.segments?.[0]?.departure?.airportCode || '',
      arrival: flight.segments?.[flight.segments.length - 1]?.arrival?.airportCode || '',
      departure_time: flight.segments?.[0]?.departure?.time || '',
      arrival_time: flight.segments?.[flight.segments.length - 1]?.arrival?.time || '',
      duration: flight.totalDuration,
      cabin_class: flight.cabinClass,
      travelers: flight.travelers || 1,
      fare_name: "Standard Fare",
      ...searchParamsObj
    });

    router.push(`/flights/${destination}/user-info?${queryParams.toString()}`);
  };

  const handlePackageSelect = async (pkg) => {
    setSelectedPackage(pkg);
    setShowPackages(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const destination = searchParamsObj.destination;
      
      if (!destination) {
        alert("Destination information is missing. Please try your search again.");
        return;
      }

      // Select the package in backend
      const response = await fetch(`${apiUrl}/flights/package/select/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer_id: flight.id,
          fare_name: pkg.name
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to select package: ${response.status}`);
      }

      const result = await response.json();
      
      // Navigate to user info page with all necessary data
      const queryParams = new URLSearchParams({
        offer_id: flight.id,
        fare_name: pkg.name,
        price: pkg.price,
        airline: flight.airlines?.[0] || 'Unknown Airline',
        flight_number: flight.segments?.[0]?.flightNumber || '',
        departure: flight.segments?.[0]?.departure?.airportCode || '',
        arrival: flight.segments?.[flight.segments.length - 1]?.arrival?.airportCode || '',
        departure_time: flight.segments?.[0]?.departure?.time || '',
        arrival_time: flight.segments?.[flight.segments.length - 1]?.arrival?.time || '',
        duration: flight.totalDuration,
        cabin_class: flight.cabinClass,
        travelers: flight.travelers || 1,
        ...searchParamsObj
      });

      router.push(`/flights/${destination}/user-info?${queryParams.toString()}`);
      
    } catch (error) {
      console.error('Error selecting package:', error);
      alert(`Failed to select package: ${error.message}. Please try again.`);
      setSelectedPackage(null);
    }
  };

  const journeys = getJourneySegments();

  return (
    <div className="relative bg-white rounded-2xl mb-8 overflow-hidden shadow-lg border border-gray-200">
      {/* Left punch hole */}
      <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 w-12 h-12 bg-gray-50 rounded-full border border-gray-200"></div>

      {/* Right punch hole */}
      <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-12 h-12 bg-gray-50 rounded-full border border-gray-200"></div>

      {/* Ticket Layout */}
      <div className="flex">
        {/* Left Section: Flight Journeys */}
        <div className="flex-1 p-6">
          {/* Trip Type Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Image
                src={flight.segments?.[0]?.airlineLogo || getAirlineLogo(flight.airlines?.[0])}
                alt={flight.airlines?.[0] || "Airline"}
                width={48}
                height={48}
                className="mr-3 h-12 w-12 object-contain"
              />
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{flight.airlines?.join(", ")}</h3>
                <p className="text-xs text-gray-500">{flight.tripType} • {flight.totalDuration}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">{flight.summary}</p>
            </div>
          </div>

          {/* Journeys */}
          <div className="space-y-4">
            {journeys.map((journey, journeyIndex) => (
              <div key={journeyIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {/* Journey Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {journey.type.replace('-', ' ')} • {journey.segments.length} flight(s)
                  </span>
                  <span className="text-xs text-gray-500">{journey.summary}</span>
                </div>

                {/* Segments for this journey */}
                <div className="space-y-3">
                  {journey.segments.map((segment, segmentIndex) => (
                    <div key={segmentIndex} className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-xl font-bold text-gray-900">{segment.departure?.time}</p>
                        <p className="text-sm font-semibold text-gray-700">{segment.departure?.airportCode}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {segment.departure?.airportName}
                        </p>
                      </div>

                      <div className="flex-1 mx-4 relative">
                        <div className="border-t-2 border-dashed border-gray-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white px-2 text-center">
                            <p className="text-xs font-medium text-gray-700">
                              {segment.duration}
                            </p>
                            <p className="text-xs text-gray-500">
                              {segment.flightNumber} • {segment.stops}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center flex-1">
                        <p className="text-xl font-bold text-gray-900">{segment.arrival?.time}</p>
                        <p className="text-sm font-semibold text-gray-700">{segment.arrival?.airportCode}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {segment.arrival?.airportName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Fare Info */}
          <div className="flex flex-wrap gap-2 mt-5 text-xs">
            <span className="bg-gray-100 px-2 py-1 rounded-md border">
              {flight.cabinClass || "Economy"}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded-md border">
              {flight.fareType || "Regular"}
            </span>
            {flight.offerDetails?.conditions?.refund_before_departure?.allowed ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md border border-green-200">
                ✅ Refundable
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md border border-red-200">❌ Non-refundable</span>
            )}
          </div>

          {/* Show Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-sm text-[#5A53A7] font-medium hover:underline flex items-center"
          >
            {showDetails ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide Details
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show All Details
              </>
            )}
          </button>

          {/* Detailed Segments View */}
          {showDetails && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Flight Details
              </h4>
              <div className="space-y-4">
                {flight.segments?.map((segment, index) => (
                  <div key={index} className="border-l-2 border-[#5A53A7] pl-4 bg-white p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          {segment.departure?.airportCode} → {segment.arrival?.airportCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          {segment.airline} {segment.flightNumber}
                        </p>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {segment.duration}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Departure</p>
                        <p className="text-gray-600">{segment.departure?.time}</p>
                        <p className="text-xs text-gray-500">{segment.departure?.airportName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Arrival</p>
                        <p className="text-gray-600">{segment.arrival?.time}</p>
                        <p className="text-xs text-gray-500">{segment.arrival?.airportName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Price + CTA */}
        <div className="w-64 border-l border-dashed border-gray-300 p-6 flex flex-col justify-between bg-gray-50">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Price</p>
            <p className="text-3xl font-bold text-[#5A53A7] my-2">{flight.totalPrice}</p>
            <p className="text-xs text-gray-400 mb-4">for {flight.travelers || 1} traveler(s)</p>
            
            {/* Additional Price Info */}
            {flight.offerDetails && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Base Fare:</span>
                  <span>{flight.offerDetails.base_amount} {flight.offerDetails.base_currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees:</span>
                  <span>{flight.offerDetails.tax_amount} {flight.offerDetails.tax_currency}</span>
                </div>
              </div>
            )}

            {/* Selection Status */}
            {selectedPackage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Package Selected
                </p>
                <p className="text-xs text-green-600 mt-1">{selectedPackage.name}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowPackages(true)}
              className="w-full bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white text-center py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-md flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {selectedPackage ? `Change Package` : 'View Packages'}
            </button>
            
            <button
              onClick={handleSelectFlight}
              className="w-full border-2 border-[#5A53A7] text-[#5A53A7] text-center py-3 rounded-xl font-semibold hover:bg-[#5A53A7] hover:text-white transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Select Flight
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500 mt-2">
                🔒 Secure booking • 📧 E-ticket • 24/7 Support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Modal */}
      {showPackages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Select Your Fare Package</h3>
                  <p className="text-blue-100 mt-1">Choose the option that best fits your travel needs</p>
                </div>
                <button
                  onClick={() => setShowPackages(false)}
                  className="text-white hover:text-blue-200 text-2xl p-2 rounded-full hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingPackages ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5A53A7] mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading available packages...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the best options for you</p>
                </div>
              ) : packageError ? (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Packages</h4>
                    <p className="text-red-600 mb-4">{packageError}</p>
                    <button
                      onClick={() => setShowPackages(false)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : farePackages.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {farePackages.map((pkg, index) => (
                    <div key={index} className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                      selectedPackage?.name === pkg.name 
                        ? 'border-[#5A53A7] bg-[#5A53A7]/5' 
                        : 'border-gray-200 hover:border-[#55C3A9]'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-xl text-gray-800">{pkg.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                        </div>
                        <span className="text-2xl font-bold text-[#5A53A7]">{pkg.price}</span>
                      </div>
                      
                      <div className="space-y-3 text-sm mb-6">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Cabin Baggage</span>
                          <span className="font-semibold text-gray-800">{pkg.baggage?.cabin || "As per Airlines Policy"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Checked Baggage</span>
                          <span className="font-semibold text-gray-800">{pkg.baggage?.checked || "As per Airlines Policy"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium text-gray-600">Available Seats</span>
                          <span className={`font-semibold ${
                            pkg.available_seats === "Limited" ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {pkg.available_seats || "Limited"}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handlePackageSelect(pkg)}
                        className={`w-full py-3 rounded-lg font-bold transition shadow-md ${
                          selectedPackage?.name === pkg.name
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white hover:opacity-90'
                        }`}
                      >
                        {selectedPackage?.name === pkg.name ? (
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Selected
                          </span>
                        ) : (
                          'Select Package'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Packages Available</h4>
                    <p className="text-yellow-700">No fare packages are currently available for this flight.</p>
                    <p className="text-sm text-yellow-600 mt-2">Please try selecting a different flight or contact support.</p>
                    <button
                      onClick={() => setShowPackages(false)}
                      className="mt-4 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FlightSearchResults = ({ flights, searchParams }) => {
  // Convert searchParams to a plain object safely
  const getSearchParamsObject = () => {
    if (!searchParams) return {};
    try {
      // If it's already an object, return it
      if (typeof searchParams === 'object' && !(searchParams instanceof URLSearchParams)) {
        return searchParams;
      }
      // If it's URLSearchParams, convert to object
      if (searchParams instanceof URLSearchParams) {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
        return params;
      }
      return {};
    } catch (error) {
      console.error('Error converting searchParams:', error);
      return {};
    }
  };

  const searchParamsObj = getSearchParamsObject();

  if (!flights || flights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="flex flex-col items-center">
          <svg
            className="w-20 h-20 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            No Flights Found
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            We couldn't find any flights matching your search criteria. This could be due to:
          </p>
          <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Selected dates might be fully booked
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              No direct flights available for your route
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Try adjusting your travel dates or filters
            </li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Try searching with different dates or check nearby airports for more options.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
            {flights.length} Flight{flights.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Sorted by: <span className="font-medium ml-1">Best Value</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Select a flight to continue with your booking
        </p>
      </div>

      {flights.map((flight) => (
        <FlightCard 
          key={flight.id} 
          flight={flight} 
          searchParams={searchParamsObj}
        />
      ))}
    </div>
  );
};

export default FlightSearchResults;