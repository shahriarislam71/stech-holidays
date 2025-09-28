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
    priceRange: [0, 1000],
    departureTimes: [],
    stops: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);

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
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const departure = searchParams.get("departure");
  const returnDate = searchParams.get("return");
  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const flightClass = searchParams.get("class") || "Economy";

  // Build API request payload
  const buildApiPayload = useCallback(() => {
    const payload = {
      slices: [
        {
          origin: from,
          destination: to,
          departure_date: departure,
        },
      ],
      travelers: {
        adults: adults,
        children: children,
        infants: infants,
      },
      cabin_class: flightClass.toLowerCase(),
      fare_type: "regular", // You can make this dynamic based on HeroSection selection
    };

    // Add return date for round trip
    if (returnDate) {
      payload.return_date = returnDate;
    }

    return payload;
  }, [from, to, departure, returnDate, adults, children, infants, flightClass]);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const payload = buildApiPayload();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/flights/search/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch flights");
      }

      const data = await response.json();
      
      if (data.status === "success") {
        setFlights(data.results.itineraries);
        setFilteredFlights(data.results.itineraries);
        setSearchData(data.search);
        setApiFilters(data.filters);
        
        // Update local filters with API data
        setFilters(prev => ({
          ...prev,
          priceRange: [data.filters.priceRange.min, data.filters.priceRange.max],
        }));
      } else {
        throw new Error(data.message || "Failed to fetch flights");
      }
    } catch (error) {
      console.error("Error fetching flights:", error);
      // You might want to show an error state here
      setFlights([]);
      setFilteredFlights([]);
    } finally {
      setLoading(false);
    }
  }, [buildApiPayload]);

  const applyFilters = useCallback(() => {
    let results = [...flights];

    // Filter by price range
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
        </div>
      </div>
    );
  }

  // Format display data from search response or URL params
  const displayFrom = searchData?.route?.from?.city || from;
  const displayTo = searchData?.route?.to?.city || to;
  const displayDeparture = searchData?.dates?.departure || departure;
  const displayReturn = searchData?.dates?.return || returnDate;
  const displayTotalTravelers = searchData?.travelers?.total || (adults + children + infants);
  const displayCabinClass = searchData?.preferences?.cabinClass || flightClass;

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
              onSelectFlight={handleFlightSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDestinationPage;