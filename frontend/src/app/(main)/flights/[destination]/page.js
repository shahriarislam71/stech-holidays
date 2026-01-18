// pages/flights/[destination]/page.js
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FlightSearchResults from "@/components/FlightSearchResults";
import FlightSearchFilters from "@/components/FlightSearchFilters";
import { format } from "date-fns";
import { FiFilter, FiX } from "react-icons/fi";

const FlightDestinationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [searchData, setSearchData] = useState(null);
  const [apiFilters, setApiFilters] = useState({});
  const [filters, setFilters] = useState({
    airlines: [],
    priceRange: [0, 1000], // Keep in USD (1000 USD max)
    departureTimes: [],
    stops: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

  // Extract search parameters
  const flightType = searchParams.get("flight_type") || "one_way";
  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const cabinClass = searchParams.get("cabin_class") || "economy";

  // Extract parameters based on flight type
  let from, to, departure, returnDate;

  const searchParamsObj = {};
  for (const [key, value] of searchParams.entries()) {
    searchParamsObj[key] = value;
  }

  if (flightType === "multi_city") {
    // For multi-city, we'll handle flights differently
    from = searchParams.get("flights[0][from]");
    to = searchParams.get("flights[0][to]");
    departure = searchParams.get("flights[0][departure_date]");
  } else {
    // For one-way and round-trip
    from = searchParams.get("origin");
    to = searchParams.get("destination");
    departure = searchParams.get("departure_date");
    returnDate = searchParams.get("return_date");
  }

  console.log("Search params:", {
    flightType,
    from,
    to,
    departure,
    returnDate,
    adults,
    children,
    infants,
    cabinClass
  });

  // Build API payload
  const buildApiPayload = useCallback(() => {
    const flightType = searchParams.get("flight_type") || "one_way";
    
    const payload = {
      flight_type: flightType,
      travelers: {
        adults: adults,
        children: children,
        infants: infants,
      },
      cabin_class: cabinClass,
    };

    if (flightType === "multi_city") {
      // Extract multi-city flights from URL params
      const flights = [];
      let index = 0;
      
      while (searchParams.has(`flights[${index}][from]`)) {
        flights.push({
          from: searchParams.get(`flights[${index}][from]`),
          to: searchParams.get(`flights[${index}][to]`),
          departure_date: searchParams.get(`flights[${index}][departure_date]`)
        });
        index++;
      }
      
      payload.flights = flights;
      
    } else if (flightType === "round_trip") {
      payload.origin = from;
      payload.destination = to;
      payload.departure_date = departure;
      payload.return_date = returnDate;
      
    } else { // one_way
      payload.origin = from;
      payload.destination = to;
      payload.departure_date = departure;
    }

    console.log("API Payload:", payload);
    return payload;
  }, [from, to, departure, returnDate, adults, children, infants, cabinClass, searchParams]);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    console.log("Starting flight search...");
    
    try {
      const payload = buildApiPayload();
      
      // Validate required parameters
      if (!payload.origin && !payload.flights) {
        console.error("Missing required parameters: origin or flights");
        setLoading(false);
        return;
      }

      console.log("Sending request to API with payload:", payload);
      
      const response = await fetch(
        `${apiUrl}/flights/search/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch flights: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      if (data.status === "success") {
        // Keep prices in original format - FlightSearchResults will handle conversion
        const processedFlights = data.results.itineraries.map(flight => ({
          ...flight,
          // Keep original price format (e.g., "USD 288")
          priceAmount: flight.priceAmount,
          totalPrice: flight.totalPrice,
          currency: flight.currency || 'USD',
          // Keep offer details as-is
          offerDetails: flight.offerDetails
        }));
        
        setFlights(processedFlights);
        setFilteredFlights(processedFlights);
        setSearchData(data.search);
        
        // Keep API filter price ranges in original currency
        setApiFilters(data.filters);
        
        // Update local filters with API data (keep in original currency)
        setFilters(prev => ({
          ...prev,
          priceRange: [data.filters.priceRange.min, data.filters.priceRange.max],
        }));
      } else {
        throw new Error(data.message || "Failed to fetch flights");
      }
    } catch (error) {
      console.error("Error fetching flights:", error);
      setFlights([]);
      setFilteredFlights([]);
    } finally {
      setLoading(false);
      console.log("Flight search completed");
    }
  }, [buildApiPayload]);

  useEffect(() => {
    console.log("Parameters check:", { from, to, departure, flightType });
    
    // Check if we have the minimum required parameters
    const hasRequiredParams = flightType === "multi_city" 
      ? searchParams.has("flights[0][from]")
      : (from && to && departure);

    if (hasRequiredParams) {
      console.log("Fetching flights with parameters...");
      fetchFlights();
    } else {
      console.log("Missing required parameters, not fetching flights");
      setLoading(false);
    }
  }, [from, to, departure, flightType, fetchFlights, searchParams]);

  const applyFilters = useCallback(() => {
    let results = [...flights];

    // Filter by price range (in original currency - USD)
    results = results.filter(
      (flight) =>
        flight.priceAmount >= filters.priceRange[0] &&
        flight.priceAmount <= filters.priceRange[1]
    );

    // Filter by airlines
    if (filters.airlines.length > 0) {
      results = results.filter((flight) =>
        flight.airlines.some(airline => filters.airlines.includes(airline))
      );
    }

    // Filter by departure times
    if (filters.departureTimes.length > 0) {
      results = results.filter((flight) => {
        // Parse time from flight.segments[0].departure.time (e.g., "6:34 PM")
        const timeStr = flight.segments[0].departure.time;
        const [time, period] = timeStr.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        let hour24 = hours;
        
        if (period === "PM" && hours !== 12) hour24 += 12;
        if (period === "AM" && hours === 12) hour24 = 0;

        return filters.departureTimes.some((timeFilter) => {
          if (timeFilter === "morning") return hour24 >= 6 && hour24 < 12;
          if (timeFilter === "afternoon") return hour24 >= 12 && hour24 < 18;
          if (timeFilter === "evening") return hour24 >= 18 && hour24 < 24;
          if (timeFilter === "night") return hour24 >= 0 && hour24 < 6;
          return false;
        });
      });
    }

    // Filter by stops
    if (filters.stops.length > 0) {
      results = results.filter((flight) => {
        const stops = flight.segments[0].stops;
        if (filters.stops.includes("nonstop")) return stops === "Non-stop";
        if (filters.stops.includes("1stop")) return stops.includes("1 stop");
        if (filters.stops.includes("2plus")) return stops.includes("2") || stops.includes("3+");
        return false;
      });
    }

    setFilteredFlights(results);
  }, [filters, flights]);

  useEffect(() => {
    if (from && to && departure) {
      fetchFlights();
    }
  }, [from, to, departure, fetchFlights]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFlightSelect = (flightId) => {
    router.push(`/flights/${to}/${flightId}/user-info`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#5A53A7] to-[#4a8b9a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Searching for flights...</p>
          <p className="text-white/70 text-sm mt-2">Parameters: {from} → {to} on {departure}</p>
        </div>
      </div>
    );
  }

  // Add error state if no flights and not loading
  if (flights.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r px-4 md:px-[190px] from-[#5A53A7] to-[#4a8b9a] text-white py-6 shadow-md">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-4">Flight Search</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Flights Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find any flights matching your search criteria.</p>
            <p className="text-sm text-gray-500 mb-6">
              Parameters: {flightType} | {from} → {to} | {departure}
            </p>
            <button
              onClick={() => router.back()}
              className="bg-[#5A53A7] text-white px-6 py-2 rounded-lg hover:bg-[#4a4791] transition"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format display data from search response or URL params
  const displayFrom = searchData?.route?.[0]?.from || from;
  const displayTo = searchData?.route?.[0]?.to || to;
  const displayDeparture = searchData?.dates?.departure || departure;
  const displayReturn = searchData?.dates?.return || returnDate;
  const displayTotalTravelers = searchData?.travelers?.total || (adults + children + infants);
  const displayCabinClass = searchData?.preferences?.cabinClass || cabinClass;

  // For multi-city, show the route differently
  const displayRoute = flightType === "multi_city" 
    ? `Multi-City (${searchParams.has("flights[0][from]") ? "Multiple" : "0"} Cities)` 
    : `${displayFrom} → ${displayTo}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Summary Banner */}
      <div className="bg-gradient-to-r px-4 md:px-[190px] from-[#5A53A7] to-[#4a8b9a] text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Flight Search Results
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <div className="bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base">
              <span className="font-medium">{displayFrom}</span> →{" "}
              <span className="font-medium">{displayTo}</span>
            </div>
            <div className="bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base">
              {format(new Date(displayDeparture), "EEE, MMM d")}
            </div>
            {displayReturn && (
              <div className="bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base">
                {format(new Date(displayReturn), "EEE, MMM d")}
              </div>
            )}
            <div className="bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base">
              {adults} Adult{adults > 1 ? "s" : ""}
              {children > 0
                ? `, ${children} Child${children > 1 ? "ren" : ""}`
                : ""}
              {infants > 0
                ? `, ${infants} Infant${infants > 1 ? "s" : ""}`
                : ""}
            </div>
            <div className="bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base capitalize">
              {displayCabinClass.toLowerCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-4 md:mx-[190px] py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Mobile Filter Button */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredFlights.length} Flights Found
            </h2>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-[#5A53A7] text-white px-4 py-2 rounded-lg"
            >
              <FiFilter size={18} />
              Filters
            </button>
          </div>

          {/* Filters Sidebar - Mobile overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-40 bg-black/50 bg-opacity-50 md:hidden">
              <div
                ref={filtersRef}
                className="fixed left-0 top-0 h-full w-4/5 max-w-sm bg-white z-50 overflow-y-auto animate-in slide-in-from-left duration-300"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  <FlightSearchFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    apiFilters={apiFilters}
                    onApply={() => setShowFilters(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-full md:w-1/4">
            <FlightSearchFilters
              filters={filters}
              onFilterChange={setFilters}
              apiFilters={apiFilters}
            />
          </div>

          {/* Results List */}
          <div className="w-full md:w-3/4">
            {/* Results header - hidden on mobile */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm p-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredFlights.length} Flights Found
              </h2>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  Sorted by:{" "}
                  <span className="font-medium">Price (Lowest first)</span>
                </span>
              </div>
            </div>

            <FlightSearchResults 
              flights={filteredFlights} 
              searchParams={searchParamsObj}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDestinationPage;
