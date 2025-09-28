"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

const FlightCard = ({ flight, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPackages, setShowPackages] = useState(false);

  const farePackages = [
    {
      name: "Economy Saver",
      cabinBag: "7 KG /Adult",
      checkedIn: "20 KG /Adult",
      cancellation: "As per Airlines Policy",
      dateChange: "As per Airlines Policy",
      meal: "Get complementary meal",
      price: "BDT6,699"
    },
    {
      name: "Economy Value",
      cabinBag: "7 KG /Adult",
      checkedIn: "20 KG /Adult",
      cancellation: "As per Airlines Policy",
      dateChange: "As per Airlines Policy",
      meal: "Get complementary meal",
      price: "BDT8,650"
    },
    {
      name: "Economy Flex",
      cabinBag: "7 KG /Adult",
      checkedIn: "20 KG /Adult",
      cancellation: "As per Airlines Policy",
      dateChange: "As per Airlines Policy",
      meal: "Get complementary meal",
      price: "BDT10,700"
    }
  ];

  // Get airline logo
  const getAirlineLogo = (airlineName) => {
    const logoMap = {
      "Biman Bangladesh Airlines": "/biman-logo.png",
      "Duffel Airways": "/duffel-logo.png",
      // Add more airline logos as needed
    };
    return logoMap[airlineName] || `https://logo.clearbit.com/${airlineName.toLowerCase().replace(/\s+/g, '')}.com`;
  };

  const mainSegment = flight.segments?.[0] || flight;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-100 hover:shadow-md transition">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-lg mr-4">
              <Image
                src={getAirlineLogo(flight.airlines?.[0] || flight.airline?.name)}
                alt={flight.airlines?.[0] || flight.airline?.name}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.target.src = "/airline-placeholder.png";
                }}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{flight.airlines?.[0] || flight.airline?.name}</h3>
              <p className="text-sm text-gray-500">
                {mainSegment.flightNumber} • {mainSegment.duration || flight.duration}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#5A53A7]">{flight.totalPrice || `BDT ${flight.price}`}</p>
            <p className="text-sm text-gray-500">per person</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800">
              {mainSegment.departure?.time || format(flight.departureTime, "h:mm a")}
            </p>
            <p className="text-sm text-gray-500">{mainSegment.departure?.airportCode || flight.departureAirport}</p>
          </div>
          <div className="flex-1 px-4">
            <div className="relative">
              <div className="border-t-2 border-gray-200 border-dashed"></div>
              <div className="absolute -top-2 left-0 right-0 flex justify-center">
                <div className="bg-white p-1 rounded-full shadow-xs border border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#55C3A9]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              {mainSegment.duration || flight.duration}
              {mainSegment.stops > 0 ? ` • ${mainSegment.stops} stop${mainSegment.stops > 1 ? "s" : ""}` : " • Non-stop"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800">
              {mainSegment.arrival?.time || format(flight.arrivalTime, "h:mm a")}
            </p>
            <p className="text-sm text-gray-500">{mainSegment.arrival?.airportCode || flight.arrivalAirport}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button 
            onClick={() => setShowDetails(true)}
            className="text-[#5A53A7] text-sm font-medium hover:underline hover:text-[#445494] transition"
          >
            Flight details
          </button>
          <button 
            onClick={() => setShowPackages(true)}
            className="bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            View Packages
          </button>
        </div>
      </div>

      {/* Flight Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#445494]">Flight Details</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-[#5A53A7] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold">{flight.airlines?.[0] || flight.airline?.name} {mainSegment.flightNumber}</h4>
                    <p className="text-sm opacity-90">{mainSegment.duration || flight.duration} • {mainSegment.stops > 0 ? `${mainSegment.stops} stop(s)` : 'Non-stop'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{format(flight.departureTime || new Date(), "EEE, MMM d")}</p>
                    <p className="text-sm opacity-90">{mainSegment.departure?.airportCode || flight.departureAirport} to {mainSegment.arrival?.airportCode || flight.arrivalAirport}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-[#445494] mb-4">Flight Itinerary</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-[#55C3A9] rounded-full p-2 mr-4 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Departure</h5>
                        <p className="text-gray-600">{mainSegment.departure?.time || format(flight.departureTime, "h:mm a")} • {mainSegment.departure?.airportCode || flight.departureAirport}</p>
                        <p className="text-sm text-gray-500 mt-1">Terminal 1 • Check-in closes 45 mins before departure</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-[#5A53A7] rounded-full p-2 mr-4 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">In-flight</h5>
                        <p className="text-gray-600">Duration: {mainSegment.duration || flight.duration}</p>
                        <p className="text-sm text-gray-500 mt-1">Economy Class • Meal included</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-[#54ACA4] rounded-full p-2 mr-4 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Arrival</h5>
                        <p className="text-gray-600">{mainSegment.arrival?.time || format(flight.arrivalTime, "h:mm a")} • {mainSegment.arrival?.airportCode || flight.arrivalAirport}</p>
                        <p className="text-sm text-gray-500 mt-1">Terminal 2 • Estimated arrival time</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-[#445494] mb-4">Flight Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Aircraft</h5>
                        <p className="text-gray-800">Boeing 737-800</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Seat Pitch</h5>
                        <p className="text-gray-800">30 inches</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Cabin Crew</h5>
                        <p className="text-gray-800">6 members</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">WiFi</h5>
                        <p className="text-gray-800">Available</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Baggage Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cabin baggage</span>
                        <span className="font-medium">7 kg (1 piece)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Checked baggage</span>
                        <span className="font-medium">20 kg (1 piece)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Excess baggage fee</span>
                        <span className="font-medium">BDT 500/kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packages Modal */}
      {showPackages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#445494]">Select Fare Package</h3>
              <button 
                onClick={() => setShowPackages(false)}
                className="text-gray-500 hover:text-[#5A53A7] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex items-center bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] p-4 rounded-lg text-white">
                <Image
                  src={getAirlineLogo(flight.airlines?.[0] || flight.airline?.name)}
                  alt={flight.airlines?.[0] || flight.airline?.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain mr-3"
                  onError={(e) => {
                    e.target.src = "/airline-placeholder.png";
                  }}
                />
                <div>
                  <h4 className="font-bold">{flight.airlines?.[0] || flight.airline?.name}</h4>
                  <p className="text-sm opacity-90">
                    {format(flight.departureTime || new Date(), "EEE, MMM d")} • {mainSegment.departure?.time || format(flight.departureTime, "h:mm a")} - {mainSegment.arrival?.time || format(flight.arrivalTime, "h:mm a")}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {farePackages.map((pkg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-[#5A53A7] transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-[#445494]">{pkg.name}</h4>
                        <p className="text-sm text-gray-600">Best value for money</p>
                      </div>
                      <p className="text-xl font-bold text-[#5A53A7]">{pkg.price}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                      <div className="flex items-center">
                        <div className="bg-[#55C3A9]/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#55C3A9]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                          </svg>
                        </div>
                        <span>{pkg.cabinBag}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-[#5A53A7]/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5A53A7]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 010-2V4zm3 1h2v2H7V5zm4 0h2v2h-2V5zm-4 3h2v2H7V8zm4 0h2v2h-2V8zm-4 3h2v2H7v-2zm4 0h2v2h-2v-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>{pkg.checkedIn}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-[#54ACA4]/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#54ACA4]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>{pkg.cancellation}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-[#445494]/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#445494]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>{pkg.dateChange}</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/flights/${(mainSegment.departure?.airportCode || flight.departureAirport).toLowerCase()}-${(mainSegment.arrival?.airportCode || flight.arrivalAirport).toLowerCase()}/userInfo`}
                      className="block w-full bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FlightSearchResults = ({ flights, onSelectFlight }) => {
  return (
    <div className="space-y-4">
      {flights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No flights found matching your criteria
            </h3>
            <p className="text-gray-600 text-center">
              Try adjusting your filters or search dates to find more options.
            </p>
          </div>
        </div>
      ) : (
        flights.map((flight) => (
          <FlightCard 
            key={flight.id} 
            flight={flight} 
            onSelect={onSelectFlight}
          />
        ))
      )}
    </div>
  );
};

export default FlightSearchResults;