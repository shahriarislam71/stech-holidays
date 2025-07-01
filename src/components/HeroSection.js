"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useActiveSection } from "@/context/ActiveSectionContext";

const HeroSection = () => {
  const { activeSection, setActiveSection } = useActiveSection();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("flight");
  const [holidaySearchQuery, setHolidaySearchQuery] = useState("");
  const [showHolidayDestinations, setShowHolidayDestinations] = useState(false);
  const [selectedHolidayDestination, setSelectedHolidayDestination] = useState("");
  const [visaSearchQuery, setVisaSearchQuery] = useState("");
  const [showVisaCountries, setShowVisaCountries] = useState(false);
  const [selectedVisaCountry, setSelectedVisaCountry] = useState("");
  const [showHotelDestinations, setShowHotelDestinations] = useState(false);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [selectedHotelDestination, setSelectedHotelDestination] = useState("Chattogram, Bangladesh");
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [flightType, setFlightType] = useState("Round Trip");
  const [showFromAirports, setShowFromAirports] = useState(false);
  const [showToAirports, setShowToAirports] = useState(false);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [selectedFrom, setSelectedFrom] = useState({
    code: "DAC",
    city: "Dhaka",
    name: "Hazrat Shahjalal International Airport"
  });
  const [selectedTo, setSelectedTo] = useState({
    code: "CXB",
    city: "Cox's Bazar",
    name: "Cox's Bazar Airport"
  });
  const [infants, setInfants] = useState(0);
  const [selectedClass, setSelectedClass] = useState("Economy");

  const bangladeshAirports = [
    { code: "DAC", city: "Dhaka", name: "Hazrat Shahjalal International Airport" },
    { code: "CGP", city: "Chittagong", name: "Shah Amanat International Airport" },
    { code: "CXB", city: "Cox's Bazar", name: "Cox's Bazar Airport" },
    { code: "ZYL", city: "Sylhet", name: "Osmani International Airport" },
    { code: "JSR", city: "Jashore", name: "Jashore Airport" },
    { code: "RJH", city: "Rajshahi", name: "Shah Makhdum Airport" },
    { code: "BZL", city: "Barisal", name: "Barisal Airport" },
    { code: "SPD", city: "Saidpur", name: "Saidpur Airport" },
  ];

  const holidayDestinations = [
    "Bangkok, Thailand",
    "Kuala Lumpur, Malaysia",
    "Male, Maldives",
    "Kathmandu, Nepal",
    "Mekkah, Saudi Arabia",
    "Singapore, Singapore",
    "Colombo, Sri Lanka",
    "Istanbul, Turkey",
  ];

  const hotelDestinations = [
    "Dhaka, Bangladesh",
    "Chattogram, Bangladesh",
    "Cox's Bazar, Bangladesh",
    "Sylhet, Bangladesh",
    "Khulna, Bangladesh",
    "Rajshahi, Bangladesh",
    "Barishal, Bangladesh",
    "Rangpur, Bangladesh",
    "Kolkata, India",
    "Delhi, India",
    "Mumbai, India",
    "Chennai, India",
    "Bangkok, Thailand",
    "Singapore, Singapore",
    "Kuala Lumpur, Malaysia",
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Doha, Qatar",
    "Istanbul, Turkey",
    "London, UK",
    "New York, USA",
    "Toronto, Canada",
    "Sydney, Australia",
  ];

  const visaCountries = [
    "Singapore", "Thailand", "Malaysia", "China", "Sweden", "Sri Lanka",
    "Canada", "United States", "Australia", "United Kingdom", "Philippines",
    "Indonesia", "Belgium", "Germany", "Italy", "Luxembourg", "Poland",
    "Slovenia", "Switzerland", "Finland", "Japan", "Pakistan", "Bhutan",
    "Egypt", "Netherlands", "Nepal", "Iceland", "Latvia", "Malta", "Slovakia",
  ];

  const hashToTabMap = {
    'flights': 'flight',
    'hotels': 'hotel',
    'holidays': 'holidays',
    'visa': 'visa'
  };

  const tabToHashMap = {
    'flight': 'flights',
    'hotel': 'hotels',
    'holidays': 'holidays',
    'visa': 'visa'
  };

  // Sync tab with URL hash (only on homepage)
  useEffect(() => {
  if (pathname !== "/") return;

  const handleHashChange = () => {
    const hash = window.location.hash.substring(1);
    if (hash in hashToTabMap) {
      setActiveTab(hashToTabMap[hash]);
    } else {
      // Default to flights if no matching hash
      setActiveTab('flight');
      window.history.replaceState(null, null, '#flights');
    }
  };

  // Initialize on mount
  handleHashChange();

  window.addEventListener("hashchange", handleHashChange);
  return () => window.removeEventListener("hashchange", handleHashChange);
}, [pathname]);

  // Update URL hash when tab changes (only on homepage)
  useEffect(() => {
    if (pathname !== "/") return;

    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash in hashToTabMap) {
        setActiveTab(hashToTabMap[hash]);
        setActiveSection(hash); // Sync with navbar
      } else {
        setActiveTab('flight');
        setActiveSection('flights');
        window.history.replaceState(null, null, '#flights');
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname, setActiveSection]);


  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (pathname !== "/") {
      router.push(`/#${tabToHashMap[tab]}`);
    }
  };

  const handleHolidaySearch = () => {
    if (selectedHolidayDestination) {
      const destinationSlug = selectedHolidayDestination
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(",", "");
      router.push(`/holidays/${destinationSlug}`);
    }
  };

  const handleVisaSearch = () => {
    if (selectedVisaCountry) {
      router.push(`/visa/${selectedVisaCountry.toLowerCase().replace(/\s+/g, "-")}`);
    }
  };

  const handleHotelSearch = () => {
    if (selectedHotelDestination) {
      const destinationSlug = selectedHotelDestination
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(",", "");

      const params = new URLSearchParams();
      params.append("destination", destinationSlug);
      params.append("checkIn", checkInDate.toISOString().split("T")[0]);
      params.append("checkOut", checkOutDate.toISOString().split("T")[0]);
      params.append("rooms", rooms);
      params.append("adults", adults);
      params.append("children", children);

      router.push(`/hotels/search?${params.toString()}`);
    }
  };

  const handleFlightSearch = () => {
  const params = new URLSearchParams();
  params.append("from", selectedFrom.code);
  params.append("to", selectedTo.code);
  params.append("departure", format(departureDate, "yyyy-MM-dd"));
  if (flightType === "Round Trip") {
    params.append("return", format(returnDate, "yyyy-MM-dd"));
  }
  params.append("adults", adults);
  params.append("children", children);
  params.append("infants", infants);
  params.append("class", selectedClass);

  // Redirect to dynamic route with destination code
  router.push(`/flights/${selectedTo.code}?${params.toString()}`);
};

  const handleCountrySelect = (country) => {
    setSelectedVisaCountry(country);
    setVisaSearchQuery(country);
    setShowVisaCountries(false);
  };

  const handleHolidayDestinationSelect = (destination) => {
    setSelectedHolidayDestination(destination);
    setHolidaySearchQuery(destination);
    setShowHolidayDestinations(false);
  };

  const handleHotelDestinationSelect = (destination) => {
    setSelectedHotelDestination(destination);
    setHotelSearchQuery(destination);
    setShowHotelDestinations(false);
  };

  const handleCheckInChange = (date) => {
    setCheckInDate(date);
    if (checkOutDate < date) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(date.getDate() + 1);
      setCheckOutDate(newCheckOut);
    }
  };

  const calculateNights = () => {
    const diffTime = Math.abs(checkOutDate - checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
        <div className="bg-gradient-to-r from-[#5A53A7] via-[#4a8b9a] to-[#55C3A9] rounded-3xl shadow-xl">
          {/* Tabs */}
          <div className="flex justify-center -mt-16">
            <div className="flex bg-white/20 backdrop-blur-md rounded-full overflow-hidden shadow-lg -mt-6 border border-white/20">
              {[
                { id: 'flight', label: 'Flight' },
                { id: 'hotel', label: 'Hotel' },
                { id: 'holidays', label: 'Holidays' },
                { id: 'visa', label: 'Visa' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-8 py-3 text-white font-medium hover:bg-white/20 transition-colors ${
                    activeTab === tab.id ? "bg-white/30 font-semibold" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {/* Flights Section */}
            {activeTab === "flight" && (
              <div className="space-y-4">
                {/* Flight Type Toggle */}
                <div className="flex justify-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full p-1 max-w-md mx-auto">
                  {["One Way", "Round Trip", "Multi City"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFlightType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        flightType === type
                          ? "bg-white text-[#5A53A7] shadow-sm"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Search Form */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* From Airport */}
                    <div className="space-y-1 relative">
                      <label className="text-sm text-white font-medium block">From</label>
                      <div
                        className="flex items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition cursor-pointer"
                        onClick={() => setShowFromAirports(!showFromAirports)}
                      >
                        <div className="bg-[#5A53A7] text-white rounded-full w-7 h-7 flex items-center justify-center text-xs mr-2 shrink-0">
                          {selectedFrom?.code || "DAC"}
                        </div>
                        <div className="truncate">
                          <div className="text-base font-medium text-white truncate">
                            {selectedFrom?.city || "Dhaka"}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            {selectedFrom?.name || "Shahjalal Airport"}
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-auto text-white/70"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      {showFromAirports && (
                        <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                          {bangladeshAirports.map((airport) => (
                            <div
                              key={airport.code}
                              className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer flex items-center"
                              onClick={() => {
                                setSelectedFrom(airport);
                                setShowFromAirports(false);
                              }}
                            >
                              <div className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">
                                {airport.code}
                              </div>
                              <div>
                                <div className="text-gray-800 font-medium hover:text-white">
                                  {airport.city}
                                </div>
                                <div className="text-xs text-gray-600 hover:text-white/70">
                                  {airport.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* To Airport */}
                    <div className="space-y-1 relative">
                      <label className="text-sm text-white font-medium block">To</label>
                      <div
                        className="flex items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition cursor-pointer"
                        onClick={() => setShowToAirports(!showToAirports)}
                      >
                        <div className="bg-[#5A53A7] text-white rounded-full w-7 h-7 flex items-center justify-center text-xs mr-2 shrink-0">
                          {selectedTo?.code || "CXB"}
                        </div>
                        <div className="truncate">
                          <div className="text-base font-medium text-white truncate">
                            {selectedTo?.city || "Cox's Bazar"}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            {selectedTo?.name || "Cox's Bazar Airport"}
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-auto text-white/70"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      {showToAirports && (
                        <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                          {bangladeshAirports.map((airport) => (
                            <div
                              key={airport.code}
                              className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer flex items-center"
                              onClick={() => {
                                setSelectedTo(airport);
                                setShowToAirports(false);
                              }}
                            >
                              <div className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">
                                {airport.code}
                              </div>
                              <div>
                                <div className="text-gray-800 font-medium hover:text-white">
                                  {airport.city}
                                </div>
                                <div className="text-xs text-gray-600 hover:text-white/70">
                                  {airport.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Departure Date */}
                    <div className="space-y-1">
                      <label className="text-sm text-white font-medium block">Departure</label>
                      <DatePicker
                        selected={departureDate}
                        onChange={(date) => setDepartureDate(date)}
                        minDate={new Date()}
                        className="w-full p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 text-white cursor-pointer"
                        customInput={
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-base text-white">
                                {format(departureDate, "d MMM, yyyy")}
                              </div>
                              <div className="text-xs text-white/80">
                                {format(departureDate, "EEEE")}
                              </div>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white/70"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        }
                      />
                    </div>

                    {/* Return Date (only for Round Trip) */}
                    {flightType === "Round Trip" && (
                      <div className="space-y-1">
                        <label className="text-sm text-white font-medium block">Return</label>
                        <DatePicker
                          selected={returnDate}
                          onChange={(date) => setReturnDate(date)}
                          minDate={departureDate}
                          className="w-full p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 text-white cursor-pointer"
                          customInput={
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-base text-white">
                                  {format(returnDate, "d MMM, yyyy")}
                                </div>
                                <div className="text-xs text-white/80">
                                  {format(returnDate, "EEEE")}
                                </div>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-white/70"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          }
                        />
                      </div>
                    )}

                    {/* Traveller & Class */}
                    <div className="space-y-1 relative">
                      <label className="text-sm text-white font-medium block">Traveller & Class</label>
                      <div
                        className="flex p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition cursor-pointer"
                        onClick={() => setShowTravellerModal(true)}
                      >
                        <div className="flex-1 text-center">
                          <div className="text-base text-white">
                            {adults + children + infants}
                          </div>
                          <div className="text-xs text-white/80">
                            Traveller{adults + children + infants !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="flex-1 text-center border-l border-white/20">
                          <div className="text-base text-white">
                            {selectedClass.split("/")[0]}
                          </div>
                          <div className="text-xs text-white/80">Class</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <label className="text-sm text-white font-medium">Fare Type</label>
                      <div className="flex space-x-2">
                        <button className="flex-1 flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mb-1 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-white">Regular</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mb-1 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="text-sm text-white">Student</span>
                        </button>
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end justify-end">
                      <button 
                        onClick={handleFlightSearch}
                        className="px-6 py-3 rounded-lg text-[#5A53A7] bg-white font-medium hover:bg-[#4a4791] transition shadow-md text-base"
                      >
                        Search Flights
                      </button>
                    </div>
                  </div>
                </div>

                {/* Traveller and Class Modal */}
                {showTravellerModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl text-gray-800 font-bold">Travellers & Class</h3>
                        <button
                          onClick={() => setShowTravellerModal(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Adults */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-gray-700"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <div className="text-gray-800 font-medium">Adult</div>
                              <div className="text-xs text-gray-500">12 years and above</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-6 text-center">{adults}</span>
                            <button
                              onClick={() => setAdults(adults + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-gray-700"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <div className="text-gray-800 font-medium">Children</div>
                              <div className="text-xs text-gray-500">2 years - under 12 years</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setChildren(Math.max(0, children - 1))}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-6 text-center">{children}</span>
                            <button
                              onClick={() => setChildren(children + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-gray-700"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <div>
                              <div className="text-gray-800 font-medium">Infants</div>
                              <div className="text-xs text-gray-500">Below 2 years</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setInfants(Math.max(0, infants - 1))}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-6 text-center">{infants}</span>
                            <button
                              onClick={() => setInfants(infants + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Booking Class */}
                      <div>
                        <h4 className="text-gray-800 font-medium mb-3">Booking Class</h4>
                        <div className="space-y-2">
                          {[
                            "Economy",
                            "Economy/Premium Economy",
                            "Premium Economy",
                            "First/Business",
                            "Business",
                            "First Class",
                          ].map((cls, index) => (
                            <label
                              key={index}
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="cabin_class"
                                checked={selectedClass === cls}
                                onChange={() => setSelectedClass(cls)}
                                className="h-4 w-4 text-[#5A53A7] border-gray-300 focus:ring-[#5A53A7]"
                              />
                              <span className="text-gray-700">{cls}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowTravellerModal(false)}
                        className="mt-6 w-full py-3 rounded-lg bg-[#5A53A7] text-white font-medium hover:bg-[#4a4791] transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hotels Section */}
            {activeTab === "hotel" && (
              <div>
                <div className="grid grid-cols-4 gap-6">
                  {/* Destination Field */}
                  <div className="relative">
                    <p className="text-white/90 font-medium mb-2">Destination</p>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedHotelDestination}
                        onChange={(e) => {
                          setHotelSearchQuery(e.target.value);
                          setShowHotelDestinations(true);
                        }}
                        onFocus={() => setShowHotelDestinations(true)}
                        onBlur={() => setTimeout(() => setShowHotelDestinations(false), 200)}
                        placeholder="Where do you want to stay?"
                        className="w-full p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      {showHotelDestinations && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 max-h-60 overflow-y-auto">
                          {hotelDestinations
                            .filter((dest) =>
                              dest.toLowerCase().includes(hotelSearchQuery.toLowerCase())
                            )
                            .map((destination) => (
                              <div
                                key={destination}
                                className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-[#445494] flex items-center"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleHotelDestinationSelect(destination)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2 text-[#5A53A7]"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {destination}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check-in Date */}
                  <div>
                    <p className="text-white/90 font-medium mb-2">Check In</p>
                    <div className="relative">
                      <DatePicker
                        selected={checkInDate}
                        onChange={handleCheckInChange}
                        minDate={new Date()}
                        className="w-full p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                        popperPlacement="bottom-start"
                        customInput={
                          <div className="flex items-center justify-between cursor-pointer">
                            <span>{formatDate(checkInDate)}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        }
                      />
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <p className="text-white/90 font-medium mb-2">Check Out</p>
                    <div className="relative">
                      <DatePicker
                        selected={checkOutDate}
                        onChange={(date) => setCheckOutDate(date)}
                        minDate={checkInDate}
                        className="w-full p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                        popperPlacement="bottom-start"
                        customInput={
                          <div className="flex items-center justify-between cursor-pointer">
                            <span>
                              {formatDate(checkOutDate)} ({calculateNights()} Nights)
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        }
                      />
                    </div>
                  </div>

                  {/* Rooms & Guests */}
                  <div className="relative">
                    <p className="text-white/90 font-medium mb-2">Rooms & Guests</p>
                    <div
                      className="flex items-center justify-between p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white cursor-pointer"
                      onClick={() => setShowGuestSelector(!showGuestSelector)}
                    >
                      <span>
                        {rooms} Room, {adults} Adult{adults !== 1 ? "s" : ""}, {children} Child{children !== 1 ? "ren" : ""}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    {showGuestSelector && (
                      <div className="absolute z-10 w-full mt-2 p-4 bg-white rounded-lg shadow-xl border border-white/30">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Rooms</span>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (rooms > 1) setRooms(rooms - 1);
                                }}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="mx-3 text-gray-700">{rooms}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (rooms < 10) setRooms(rooms + 1);
                                }}
                                className="w-8 h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Adults</span>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (adults > 1) setAdults(adults - 1);
                                }}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="mx-3 text-gray-700">{adults}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (adults < 10) setAdults(adults + 1);
                                }}
                                className="w-8 h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Children</span>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (children > 0) setChildren(children - 1);
                                }}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="mx-3 text-gray-700">{children}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (children < 10) setChildren(children + 1);
                                }}
                                className="w-8 h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleHotelSearch}
                    disabled={!selectedHotelDestination}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                      selectedHotelDestination
                        ? "bg-white text-[#5A53A7] hover:bg-white/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Search Hotels
                  </button>
                </div>
              </div>
            )}

            {/* Holidays Section */}
            {activeTab === "holidays" && (
              <div>
                <div className="relative mb-6">
                  <p className="text-white/90 font-medium mb-2">Search Destination</p>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={selectedHolidayDestination || holidaySearchQuery}
                        onChange={(e) => {
                          setHolidaySearchQuery(e.target.value);
                          setSelectedHolidayDestination("");
                          setShowHolidayDestinations(true);
                        }}
                        onFocus={() => setShowHolidayDestinations(true)}
                        onBlur={() => setTimeout(() => setShowHolidayDestinations(false), 200)}
                        placeholder="Where do you want to go?"
                        className="w-full p-3 rounded-l-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      {showHolidayDestinations && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 max-h-60 overflow-y-auto">
                          {holidayDestinations
                            .filter((dest) =>
                              dest.toLowerCase().includes(holidaySearchQuery.toLowerCase())
                            )
                            .map((destination) => (
                              <div
                                key={destination}
                                className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-[#445494] flex items-center"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleHolidayDestinationSelect(destination)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2 text-[#5A53A7]"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {destination}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleHolidaySearch}
                      disabled={!selectedHolidayDestination}
                      className={`px-6 py-3 rounded-r-lg font-semibold transition-colors ${
                        selectedHolidayDestination
                          ? "bg-white text-[#5A53A7] hover:bg-white/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p className="text-white/90 font-medium">Need a customised holiday?</p>
                  <button className="bg-white text-[#5A53A7] px-6 py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition">
                    Request Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Visa Section */}
            {activeTab === "visa" && (
              <div>
                <div className="relative mb-6">
                  <p className="text-white/90 font-medium mb-2">Search Country</p>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={selectedVisaCountry || visaSearchQuery}
                        onChange={(e) => {
                          setVisaSearchQuery(e.target.value);
                          setSelectedVisaCountry("");
                          setShowVisaCountries(true);
                        }}
                        onFocus={() => setShowVisaCountries(true)}
                        onBlur={() => setTimeout(() => setShowVisaCountries(false), 200)}
                        placeholder="Which country visa do you need?"
                        className="w-full p-3 rounded-l-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      {showVisaCountries && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 max-h-60 overflow-y-auto">
                          {visaCountries
                            .filter((country) =>
                              country.toLowerCase().includes(visaSearchQuery.toLowerCase())
                            )
                            .map((country) => (
                              <div
                                key={country}
                                className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-[#445494] flex items-center"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleCountrySelect(country)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2 text-[#5A53A7]"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {country}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleVisaSearch}
                      disabled={!selectedVisaCountry}
                      className={`px-6 py-3 rounded-r-lg font-semibold transition-colors ${
                        selectedVisaCountry
                          ? "bg-white text-[#5A53A7] hover:bg-white/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p className="text-white/90 font-medium">Need visa assistance?</p>
                  <button className="bg-white text-[#5A53A7] px-6 py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition">
                    Request Help
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
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