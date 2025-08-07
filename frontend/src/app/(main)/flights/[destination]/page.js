"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FlightSearchResults from "@/components/FlightSearchResults";
import FlightSearchFilters from "@/components/FlightSearchFilters";
import BookingProgress from "@/components/BookingProgress";
import { format } from "date-fns";

const FlightDestinationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [filters, setFilters] = useState({
    airlines: [],
    priceRange: [0, 1000],
    departureTimes: [],
    stops: [],
  });

  // Extract search parameters
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const departure = searchParams.get("departure");
  const returnDate = searchParams.get("return");
  const adults = searchParams.get("adults") || 1;
  const children = searchParams.get("children") || 0;
  const infants = searchParams.get("infants") || 0;
  const flightClass = searchParams.get("class") || "Economy";

  const generateMockFlights = useCallback(() => {
    const airlines = [
      { code: "BG", name: "Biman Bangladesh Airlines", logo: "/biman-logo.png" },
      { code: "AK", name: "Air Astra", logo: "/air-astra-logo.png" },
      { code: "US", name: "US-Bangla Airlines", logo: "/us-bangla-logo.png" },
      { code: "EK", name: "Emirates", logo: "/emirates-logo.png" },
    ];

    const mockFlights = [];
    const basePrice = Math.floor(Math.random() * 500) + 200;

    for (let i = 0; i < 12; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const departureTime = new Date();
      departureTime.setHours(Math.floor(Math.random() * 24));
      departureTime.setMinutes(Math.floor(Math.random() * 12) * 5);

      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(departureTime.getHours() + Math.floor(Math.random() * 5) + 1);

      mockFlights.push({
        id: `FL${Math.floor(Math.random() * 10000)}`,
        airline,
        flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
        departureTime,
        arrivalTime,
        duration: `${Math.floor((arrivalTime - departureTime) / (1000 * 60 * 60))}h ${Math.floor(((arrivalTime - departureTime) / (1000 * 60)) % 60)}m`,
        price: basePrice + Math.floor(Math.random() * 300),
        stops: Math.floor(Math.random() * 3),
        departureAirport: from,
        arrivalAirport: to,
        fareOptions: generateFareOptions(basePrice + Math.floor(Math.random() * 300)),
      });
    }

    return mockFlights.sort((a, b) => a.price - b.price);
  }, [from, to]);

  const generateFareOptions = (basePrice) => {
    return [
      {
        name: "Star Lite",
        cabinBag: "7 KG / Adult",
        checkedIn: "20 KG / Adult",
        cancellation: "As per Airlines Policy",
        dateChange: "As per Airlines Policy",
        meal: "Complementary meal included",
        price: basePrice,
      },
      {
        name: "Star Go",
        cabinBag: "7 KG / Adult",
        checkedIn: "20 KG / Adult",
        cancellation: "As per Airlines Policy",
        dateChange: "As per Airlines Policy",
        meal: "Complementary meal included",
        price: basePrice + 200,
      },
      {
        name: "Star Easy",
        cabinBag: "7 KG / Adult",
        checkedIn: "25 KG / Adult",
        cancellation: "BDT 1000 + Airline Fee",
        dateChange: "BDT 500 + Airline Fee",
        meal: "Complementary meal + Snack",
        price: basePrice + 500,
      },
      {
        name: "Star Prime",
        cabinBag: "10 KG / Adult",
        checkedIn: "30 KG / Adult",
        cancellation: "BDT 500 + Airline Fee",
        dateChange: "Free (Once)",
        meal: "Gourmet meal + Beverages",
        price: basePrice + 800,
      },
    ];
  };

  const applyFilters = useCallback(() => {
    let results = [...flights];

    // Filter by price range
    results = results.filter(
      (flight) =>
        flight.price >= filters.priceRange[0] && flight.price <= filters.priceRange[1]
    );

    // Filter by airlines
    if (filters.airlines.length > 0) {
      results = results.filter((flight) =>
        filters.airlines.includes(flight.airline.code)
      );
    }

    // Filter by departure times
    if (filters.departureTimes.length > 0) {
      results = results.filter((flight) => {
        const hours = flight.departureTime.getHours();
        return filters.departureTimes.some((time) => {
          if (time === "morning") return hours >= 6 && hours < 12;
          if (time === "afternoon") return hours >= 12 && hours < 18;
          if (time === "evening") return hours >= 18 && hours < 24;
          if (time === "night") return hours >= 0 && hours < 6;
          return false;
        });
      });
    }

    // Filter by stops
    if (filters.stops.length > 0) {
      results = results.filter((flight) => {
        if (filters.stops.includes("nonstop")) return flight.stops === 0;
        if (filters.stops.includes("1stop")) return flight.stops === 1;
        if (filters.stops.includes("2plus")) return flight.stops >= 2;
        return false;
      });
    }

    setFilteredFlights(results);
  }, [filters, flights]);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockFlights = generateMockFlights();
        setFlights(mockFlights);
        setFilteredFlights(mockFlights);
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, departure, generateMockFlights]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFlightSelect = (flightId) => {
    router.push(`/flights/${to}/${flightId}/user-info`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#5A53A7] to-[#4a8b9a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Booking Progress */}
      {/* <BookingProgress currentStep="select" /> */}

      {/* Search Summary Banner */}
      <div className="bg-gradient-to-r px-[190px] from-[#5A53A7] to-[#4a8b9a] text-white py-6  shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Flight Search Results</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="font-medium">{from}</span> → <span className="font-medium">{to}</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full">
              {format(new Date(departure), "EEE, MMM d")}
            </div>
            {returnDate && (
              <div className="bg-white/20 px-4 py-2 rounded-full">
                {format(new Date(returnDate), "EEE, MMM d")}
              </div>
            )}
            <div className="bg-white/20 px-4 py-2 rounded-full">
              {adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full capitalize">
              {flightClass.toLowerCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-[190px] py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4">
            <FlightSearchFilters 
              filters={filters} 
              onFilterChange={setFilters} 
            />
          </div>

          {/* Results List */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredFlights.length} Flights Found
              </h2>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  Sorted by: <span className="font-medium">Price (Lowest first)</span>
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