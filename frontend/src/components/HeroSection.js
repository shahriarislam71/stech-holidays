"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  const [showHolidayDestinations, setShowHolidayDestinations] = useState(false);
  const [selectedHolidayDestination, setSelectedHolidayDestination] =
    useState("");
  const [visaSearchQuery, setVisaSearchQuery] = useState("");
  const [showVisaCountries, setShowVisaCountries] = useState(false);
  const [selectedVisaCountry, setSelectedVisaCountry] = useState("");
  const [showHotelDestinations, setShowHotelDestinations] = useState(false);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [selectedHotelDestination, setSelectedHotelDestination] = useState(
    "Chattogram, Bangladesh"
  );
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
    name: "Hazrat Shahjalal International Airport",
  });
  const [selectedTo, setSelectedTo] = useState({
    code: "CXB",
    city: "Cox's Bazar",
    name: "Cox's Bazar Airport",
  });
  const [infants, setInfants] = useState(0);
  const [selectedClass, setSelectedClass] = useState("Economy");

  // Umrah states
  const [umrahPackageSearch, setUmrahPackageSearch] = useState("");
  const [showUmrahPackages, setShowUmrahPackages] = useState(false);
  const [selectedUmrahPackage, setSelectedUmrahPackage] = useState(null);
  const [umrahPackages, setUmrahPackages] = useState([]);

  // In your useEffect for fetching Umrah packages:
  useEffect(() => {
    const fetchUmrahPackages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/umrah-packages-list/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Umrah packages");
        }
        const data = await response.json();
        setUmrahPackages(data.packages); // Store the full package objects
      } catch (err) {
        console.error("Error fetching Umrah packages:", err);
      }
    };

    fetchUmrahPackages();
  }, []);

  // Update the handleUmrahSearch function:
  const handleUmrahSearch = () => {
    if (selectedUmrahPackage) {
      router.push(`/umrah/${selectedUmrahPackage.slug}`);
    }
  };

  // Update the filteredUmrahPackages calculation:
  const filteredUmrahPackages = useMemo(() => {
    if (!umrahPackageSearch) return umrahPackages;
    return umrahPackages.filter((pkg) =>
      pkg.title.toLowerCase().includes(umrahPackageSearch.toLowerCase())
    );
  }, [umrahPackageSearch, umrahPackages]);

  // holiday states
  const [holidayDestinations, setHolidayDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [holidaySearchQuery, setHolidaySearchQuery] = useState("");

  // visa states
  const [visaCountries, setVisaCountries] = useState([]);
  const [isLoadingVisaCountries, setIsLoadingVisaCountries] = useState(false);

  // flight states
  const bangladeshAirports = [
    {
      code: "DAC",
      city: "Dhaka",
      name: "Hazrat Shahjalal International Airport",
    },
    {
      code: "CGP",
      city: "Chittagong",
      name: "Shah Amanat International Airport",
    },
    { code: "CXB", city: "Cox's Bazar", name: "Cox's Bazar Airport" },
    { code: "ZYL", city: "Sylhet", name: "Osmani International Airport" },
    { code: "JSR", city: "Jashore", name: "Jashore Airport" },
    { code: "RJH", city: "Rajshahi", name: "Shah Makhdum Airport" },
    { code: "BZL", city: "Barisal", name: "Barisal Airport" },
    { code: "SPD", city: "Saidpur", name: "Saidpur Airport" },
  ];

  // hotel states
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

  const hashToTabMap = useMemo(
    () => ({
      flights: "flight",
      hotels: "hotel",
      holidays: "holidays",
      visa: "visa",
      umrah: "umrah",
    }),
    []
  );

  const tabToHashMap = useMemo(
    () => ({
      flight: "flights",
      hotel: "hotels",
      holidays: "holidays",
      visa: "visa",
      umrah: "umrah",
    }),
    []
  );

  // Fetch holiday destinations on component mount
  useEffect(() => {
    const fetchHolidayDestinations = async () => {
      setIsLoadingDestinations(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/holiday-destinations/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }
        const data = await response.json();
        setHolidayDestinations(data.destinations);
      } catch (err) {
        console.error("Error fetching holiday destinations:", err);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    fetchHolidayDestinations();
  }, []);

  // Fetch visa countries on component mount
  useEffect(() => {
    const fetchVisaCountries = async () => {
      setIsLoadingVisaCountries(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/visa-destinations/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch visa countries");
        }
        const data = await response.json();
        console.log("Visa countries data:", data);
        setVisaCountries(data.countries);
      } catch (err) {
        console.error("Error fetching visa countries:", err);
      } finally {
        setIsLoadingVisaCountries(false);
      }
    };

    fetchVisaCountries();
  }, []);

  // Filter visa countries based on search query
  const filteredVisaCountries = useMemo(() => {
    if (!visaSearchQuery) return visaCountries;
    return visaCountries.filter((country) =>
      country.name.toLowerCase().includes(visaSearchQuery.toLowerCase())
    );
  }, [visaSearchQuery, visaCountries]);

  // Filter holiday destinations
  const filteredHolidayDestinations = useMemo(() => {
    if (!holidaySearchQuery) return holidayDestinations;
    return holidayDestinations.filter((dest) =>
      dest.name.toLowerCase().includes(holidaySearchQuery.toLowerCase())
    );
  }, [holidaySearchQuery, holidayDestinations]);

  // Sync tab with URL hash (only on homepage)
  useEffect(() => {
    if (pathname !== "/") return;

    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash in hashToTabMap) {
        setActiveTab(hashToTabMap[hash]);
        setActiveSection(hash); // Sync with navbar
      } else {
        setActiveTab("flight");
        setActiveSection("flights");
        window.history.replaceState(null, null, "#flights");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname, setActiveSection, hashToTabMap]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (pathname !== "/") {
      router.push(`/#${tabToHashMap[tab]}`);
    }
  };

  const handleHolidaySearch = () => {
    if (selectedHolidayDestination) {
      const destinationObj = holidayDestinations.find(
        (dest) => dest.name === selectedHolidayDestination
      );

      if (destinationObj) {
        router.push(`/holidays/${destinationObj.slug}`);
      }
    }
  };

  const handleVisaSearch = () => {
    if (selectedVisaCountry) {
      const countryObj = visaCountries.find(
        (country) => country.name === selectedVisaCountry
      );

      if (countryObj) {
        router.push(`/visa/${countryObj.id}`);
      }
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

    router.push(`/flights/${selectedTo.code}?${params.toString()}`);
  };

  const handleCountrySelect = (country) => {
    setSelectedVisaCountry(country);
    setVisaSearchQuery(country);
    setShowVisaCountries(false);
  };

  const handleHolidayDestinationSelect = (destination) => {
    setSelectedHolidayDestination(destination.name);
    setHolidaySearchQuery(destination.name);
    setShowHolidayDestinations(false);
  };

  const handleHotelDestinationSelect = (destination) => {
    setSelectedHotelDestination(destination);
    setHotelSearchQuery(destination);
    setShowHotelDestinations(false);
  };

  const handleUmrahPackageSelect = (pkg) => {
    setSelectedUmrahPackage(pkg);
    setUmrahPackageSearch(pkg.title);
    setShowUmrahPackages(false);
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
    <div className="relative w-full bg-white">
      {/* Background Video */}
      <div className="relative h-[300px] sm:h-[400px]">
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
      <div className="relative flex flex-col items-center justify-center h-[200px] sm:h-[400px] px-4 sm:px-[190px] -mt-[350px] sm:-mt-[450px]">
        <h1 className="text-white text-2xl sm:text-5xl font-bold mb-2 hidden sm:block sm:mb-4 text-center">
          Create A New Story With Every Trip
        </h1>
        <p className="text-white text-sm sm:text-xl mb-8 sm:mb-12 hidden sm:block">
          Flight, Hotel, Holidays & Visa at your fingertips
        </p>
      </div>

      {/* Booking Sections */}
      <div className="relative mx-4 sm:mx-[190px]">
        <div className="bg-gradient-to-r from-[#5A53A7] via-[#4a8b9a] to-[#55C3A9] rounded-3xl shadow-xl">
          {/* Tabs */}
          <div className="flex justify-center -mt-12 sm:-mt-16">
            <div className="flex bg-white/20 backdrop-blur-md rounded-full overflow-hidden shadow-lg -mt-4 sm:-mt-6 border border-white/20 w-[80%] h-[50px] sm:w-auto">
              {[
                { id: "flight", label: "Flight" },
                { id: "hotel", label: "Hotel" },
                { id: "holidays", label: "Holidays" },
                { id: "visa", label: "Visa" },
                { id: "umrah", label: "Umrah" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-3 py-2 sm:px-8 sm:py-3 text-md sm:text-base text-white font-medium hover:bg-white/20 transition-colors ${
                    activeTab === tab.id ? "bg-white/30 font-semibold" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-8">
            {/* Flights Section */}
            {activeTab === "flight" && (
              <div className="space-y-4">
                {/* Flight Type Toggle */}
                <div className="flex justify-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full p-1 max-w-md mx-auto">
                  {["One Way", "Round Trip", "Multi City"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFlightType(type)}
                      className={`px-2 py-1 sm:px-4 sm:py-2 sm:text-sm rounded-full font-medium transition-all ${
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
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {/* From Airport */}
                    <div className="space-y-1 relative">
                      <label className="text-xs sm:text-sm text-white font-medium block">
                        From
                      </label>
                      <div
                        className="flex items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition cursor-pointer"
                        onClick={() => setShowFromAirports(!showFromAirports)}
                      >
                        <div className="bg-[#5A53A7] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs mr-2 shrink-0">
                          {selectedFrom?.code || "DAC"}
                        </div>
                        <div className="truncate">
                          <div className="text-sm sm:text-base font-medium text-white truncate">
                            {selectedFrom?.city || "Dhaka"}
                          </div>
                          <div className="text-xs text-white/80 truncate hidden sm:block">
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
                                <div className="text-xs text-gray-600 hover:text-white/70 hidden sm:block">
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
                      <label className="text-xs sm:text-sm text-white font-medium block">
                        To
                      </label>
                      <div
                        className="flex items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition cursor-pointer"
                        onClick={() => setShowToAirports(!showToAirports)}
                      >
                        <div className="bg-[#5A53A7] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs mr-2 shrink-0">
                          {selectedTo?.code || "CXB"}
                        </div>
                        <div className="truncate">
                          <div className="text-sm sm:text-base font-medium text-white truncate">
                            {selectedTo?.city || "Cox's Bazar"}
                          </div>
                          <div className="text-xs text-white/80 truncate hidden sm:block">
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
                                <div className="text-xs text-gray-600 hover:text-white/70 hidden sm:block">
                                  {airport.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Departure & Return */}
                    <div className="flex justify-between gap-3">
                      {/* Departure Date */}
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm text-white font-medium block">
                          Departure
                        </label>
                        <DatePicker
                          selected={departureDate}
                          onChange={(date) => setDepartureDate(date)}
                          minDate={new Date()}
                          className="w-full p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 text-white cursor-pointer"
                          customInput={
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm sm:text-base text-white">
                                  {format(departureDate, "d MMM, yyyy")}
                                </div>
                                <div className="text-xs text-white/80 hidden sm:block">
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
                          <label className="text-xs sm:text-sm text-white font-medium block">
                            Return
                          </label>
                          <DatePicker
                            selected={returnDate}
                            onChange={(date) => setReturnDate(date)}
                            minDate={departureDate}
                            className="w-full p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 text-white cursor-pointer"
                            customInput={
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm sm:text-base text-white">
                                    {format(returnDate, "d MMM, yyyy")}
                                  </div>
                                  <div className="text-xs text-white/80 hidden sm:block">
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
                    </div>

                    {/* Traveller & Class */}
                    <div className="space-y-1 relative">
                      <label className="text-xs sm:text-sm text-white font-medium block">
                        Traveller & Class
                      </label>
                      <div
                        className="flex p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition cursor-pointer"
                        onClick={() => setShowTravellerModal(true)}
                      >
                        <div className="flex-1 text-center">
                          <div className="text-sm sm:text-base text-white">
                            {adults + children + infants}
                          </div>
                          <div className="text-xs text-white/80">
                            Traveller
                            {adults + children + infants !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="flex-1 text-center border-l border-white/20">
                          <div className="text-sm sm:text-base text-white">
                            {selectedClass.split("/")[0]}
                          </div>
                          <div className="text-xs text-white/80">Class</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm text-white font-medium">
                        Fare Type
                      </label>
                      <div className="flex space-x-2">
                        <button className="flex-1 flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5 mb-1 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs sm:text-sm text-white">
                            Regular
                          </span>
                        </button>
                        <button className="flex-1 flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5 mb-1 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="text-xs sm:text-sm text-white">
                            Student
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end justify-end">
                      <button
                        onClick={handleFlightSearch}
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-[#5A53A7] bg-white font-medium hover:bg-[#4a4791] transition shadow-md text-sm sm:text-base"
                      >
                        Search Flights
                      </button>
                    </div>
                  </div>
                </div>

                {/* Traveller and Class Modal */}
                {showTravellerModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md border border-gray-200 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl text-gray-800 font-bold">
                          Travellers & Class
                        </h3>
                        <button
                          onClick={() => setShowTravellerModal(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 sm:h-6 sm:w-6"
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
                              <div className="text-gray-800 font-medium">
                                Adult
                              </div>
                              <div className="text-xs text-gray-500">
                                12 years and above
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-6 text-center">
                              {adults}
                            </span>
                            <button
                              onClick={() => setAdults(adults + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
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
                              <div className="text-gray-800 font-medium">
                                Children
                              </div>
                              <div className="text-xs text-gray-500">
                                2 years - under 12 years
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                setChildren(Math.max(0, children - 1))
                              }
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-6 text-center">
                              {children}
                            </span>
                            <button
                              onClick={() => setChildren(children + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
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
                              <div className="text-gray-800 font-medium">
                                Infants
                              </div>
                              <div className="text-xs text-gray-500">
                                Below 2 years
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                setInfants(Math.max(0, infants - 1))
                              }
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-6 text-center">
                              {infants}
                            </span>
                            <button
                              onClick={() => setInfants(infants + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Booking Class */}
                      <div>
                        <h4 className="text-gray-800 font-medium mb-3">
                          Booking Class
                        </h4>
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
                              <span className="text-sm sm:text-base text-gray-700">
                                {cls}
                              </span>
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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                  {/* Destination Field */}
                  <div className="relative">
                    <p className="text-white/90 font-medium mb-2 text-sm sm:text-base">
                      Destination
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedHotelDestination}
                        onChange={(e) => {
                          setHotelSearchQuery(e.target.value);
                          setShowHotelDestinations(true);
                        }}
                        onFocus={() => setShowHotelDestinations(true)}
                        onBlur={() =>
                          setTimeout(() => setShowHotelDestinations(false), 200)
                        }
                        placeholder="Where do you want to stay?"
                        className="w-full p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                      />
                      {showHotelDestinations && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 max-h-60 overflow-y-auto">
                          {hotelDestinations
                            .filter((dest) =>
                              dest
                                .toLowerCase()
                                .includes(hotelSearchQuery.toLowerCase())
                            )
                            .map((destination) => (
                              <div
                                key={destination}
                                className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-[#445494] flex items-center text-sm sm:text-base"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  handleHotelDestinationSelect(destination)
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#5A53A7]"
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

                  <div className="flex justify-between">
                    {/* Check-in Date */}
                    <div>
                      <p className="text-white/90 font-medium mb-2 text-sm sm:text-base">
                        Check In
                      </p>
                      <div className="relative md:w-[210px]">
                        <DatePicker
                          selected={checkInDate}
                          onChange={handleCheckInChange}
                          minDate={new Date()}
                          className="w-full p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                          calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                          popperPlacement="bottom-start"
                          customInput={
                            <div className="flex items-center justify-between cursor-pointer">
                              <span className="text-sm sm:text-base">
                                {formatDate(checkInDate)}
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      <p className="text-white/90 font-medium mb-2 text-sm sm:text-base">
                        Check Out
                      </p>
                      <div className="relative md:w-[250px]">
                        <DatePicker
                          selected={checkOutDate}
                          onChange={(date) => setCheckOutDate(date)}
                          minDate={checkInDate}
                          className="w-full p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                          calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                          popperPlacement="bottom-start"
                          customInput={
                            <div className="flex items-center justify-between cursor-pointer">
                              <span className="text-sm sm:text-base">
                                {formatDate(checkOutDate)} ({calculateNights()}{" "}
                                Nights)
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                  </div>
                  <div></div>

                  {/* Rooms & Guests */}
                  <div className="relative">
                    <p className="text-white/90 font-medium mb-2 text-sm sm:text-base">
                      Rooms & Guests
                    </p>
                    <div
                      className="flex items-center justify-between p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white cursor-pointer text-sm sm:text-base"
                      onClick={() => setShowGuestSelector(!showGuestSelector)}
                    >
                      <span>
                        {rooms} Room, {adults} Adult{adults !== 1 ? "s" : ""},{" "}
                        {children} Child{children !== 1 ? "ren" : ""}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
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
                            <span className="text-gray-700 text-sm sm:text-base">
                              Rooms
                            </span>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (rooms > 1) setRooms(rooms - 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="mx-3 text-gray-700 text-sm sm:text-base">
                                {rooms}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (rooms < 10) setRooms(rooms + 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 text-sm sm:text-base">
                              Adults
                            </span>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (adults > 1) setAdults(adults - 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="mx-3 text-gray-700 text-sm sm:text-base">
                                {adults}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (adults < 10) setAdults(adults + 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-sm sm:text-base">
                              Children
                            </span>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (children > 0) setChildren(children - 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="mx-3 text-gray-700 text-sm sm:text-base">
                                {children}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (children < 10) setChildren(children + 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
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
                    className={`px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
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
                  <p className="text-white/90 font-medium mb-2 text-sm sm:text-base">
                    Search Destination
                  </p>
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
                        onBlur={() =>
                          setTimeout(
                            () => setShowHolidayDestinations(false),
                            200
                          )
                        }
                        placeholder="Where do you want to go?"
                        className="w-full p-3 rounded-l-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                      />
                      {isLoadingDestinations && showHolidayDestinations && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 p-4">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5A53A7]"></div>
                          </div>
                        </div>
                      )}
                      {showHolidayDestinations &&
                        filteredHolidayDestinations.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 max-h-[300px] overflow-y-scroll">
                            {filteredHolidayDestinations.map(
                              (destination, index) => (
                                <div
                                  key={index}
                                  className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-[#445494] flex items-center text-sm sm:text-base"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() =>
                                    handleHolidayDestinationSelect(destination)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#5A53A7]"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {destination.name}
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {showHolidayDestinations &&
                        !isLoadingDestinations &&
                        filteredHolidayDestinations.length === 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 p-4 text-[#445494] text-sm sm:text-base">
                            No destinations found
                          </div>
                        )}
                    </div>
                    <button
                      onClick={handleHolidaySearch}
                      disabled={!selectedHolidayDestination}
                      className={`px-4 py-3 sm:px-6 sm:py-3 rounded-r-lg font-semibold transition-colors text-sm sm:text-base ${
                        selectedHolidayDestination
                          ? "bg-white text-[#5A53A7] hover:bg-white/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <p className="text-white/90 font-medium text-sm sm:text-base">
                    Need a customised holiday?
                  </p>
                  <button className="bg-white text-[#5A53A7] px-4 py-2 sm:px-6 sm:py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition text-sm sm:text-base">
                    Request Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2"
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

            {activeTab === "umrah" && (
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-white text-lg sm:text-xl font-medium mb-2">
                    Explore Umrah Packages
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base">
                    Find the perfect package for your spiritual journey
                  </p>
                </div>

                <button
                  onClick={() => router.push("/umrah/packages")}
                  className="px-6 py-2 sm:px-8 sm:py-3 rounded-lg bg-white text-[#5A53A7] font-medium hover:bg-white/90 transition shadow-md text-sm sm:text-base"
                >
                  View All Packages
                </button>

                <div className="mt-6">
                  <button
                    onClick={() => router.push("/contact")}
                    className="text-white/80 hover:text-white text-xs sm:text-sm flex items-center justify-center mx-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    Need assistance? Contact us
                  </button>
                </div>
              </div>
            )}

            {/* Visa Section */}
            {activeTab === "visa" && (
              <div>
                <div className="relative mb-6">
                  <p className="text-white/90 font-medium mb-2 text-sm sm:text-base">
                    Search Country
                  </p>
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
                        onFocus={() => {
                          setShowVisaCountries(true);
                          if (visaSearchQuery) {
                            setVisaSearchQuery(visaSearchQuery);
                          }
                        }}
                        onBlur={() =>
                          setTimeout(() => setShowVisaCountries(false), 200)
                        }
                        placeholder="Which country visa do you need?"
                        className="w-full p-3 rounded-l-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                      />

                      {isLoadingVisaCountries && showVisaCountries && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 p-4">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5A53A7]"></div>
                          </div>
                        </div>
                      )}

                      {showVisaCountries &&
                        filteredVisaCountries.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 max-h-60 overflow-y-auto">
                            {filteredVisaCountries.map((country, index) => (
                              <div
                                key={index}
                                className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-[#445494] flex items-center text-sm sm:text-base"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  handleCountrySelect(country.name);
                                  setShowVisaCountries(false);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#5A53A7]"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {country.name}
                              </div>
                            ))}
                          </div>
                        )}

                      {showVisaCountries &&
                        !isLoadingVisaCountries &&
                        filteredVisaCountries.length === 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-white/30 p-4 text-[#445494] text-sm sm:text-base">
                            No countries found
                          </div>
                        )}
                    </div>

                    <button
                      onClick={handleVisaSearch}
                      disabled={!selectedVisaCountry}
                      className={`px-4 py-3 sm:px-6 sm:py-3 rounded-r-lg font-semibold transition-colors text-sm sm:text-base ${
                        selectedVisaCountry
                          ? "bg-white text-[#5A53A7] hover:bg-white/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <p className="text-white/90 font-medium text-sm sm:text-base">
                    Need visa assistance?
                  </p>
                  <button className="bg-white text-[#5A53A7] px-4 py-2 sm:px-6 sm:py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition text-sm sm:text-base">
                    Request Help
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2"
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
