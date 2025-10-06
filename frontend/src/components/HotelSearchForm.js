"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";

export default function HotelSearchForm({ initialParams, onSearch }) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  // Initialize state with URL parameters or initialParams
  const [destination, setDestination] = useState("Dhaka, Bangladesh");
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showHotelDestinations, setShowHotelDestinations] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Initialize form with URL parameters or stored parameters
  useEffect(() => {
    console.log('HotelSearchForm initializing with:', { initialParams, urlSearchParams });
    
    // First priority: URL parameters (new search)
    const urlDestination = urlSearchParams.get('destination');
    const urlLat = urlSearchParams.get('lat');
    const urlLng = urlSearchParams.get('lng');
    const urlCheckIn = urlSearchParams.get('checkIn');
    const urlCheckOut = urlSearchParams.get('checkOut');
    const urlRooms = urlSearchParams.get('rooms');
    const urlAdults = urlSearchParams.get('adults');
    const urlChildren = urlSearchParams.get('children');

    if (urlDestination && urlLat && urlLng) {
      console.log('Using URL parameters');
      setDestination(urlDestination.replace(/-/g, ' '));
      setSelectedLat(parseFloat(urlLat));
      setSelectedLng(parseFloat(urlLng));
      if (urlCheckIn) setCheckInDate(new Date(urlCheckIn));
      if (urlCheckOut) setCheckOutDate(new Date(urlCheckOut));
      if (urlRooms) setRooms(parseInt(urlRooms));
      if (urlAdults) setAdults(parseInt(urlAdults));
      if (urlChildren) setChildren(parseInt(urlChildren));
    } 
    // Second priority: initialParams from parent (when coming back from hotel details)
    else if (initialParams) {
      console.log('Using initialParams:', initialParams);
      setDestination(initialParams.destination.replace(/-/g, ' '));
      setSelectedLat(parseFloat(initialParams.lat));
      setSelectedLng(parseFloat(initialParams.lng));
      setCheckInDate(new Date(initialParams.checkIn));
      setCheckOutDate(new Date(initialParams.checkOut));
      setRooms(initialParams.rooms);
      setAdults(initialParams.adults);
      setChildren(initialParams.children);
    } else {
      // Default coordinates for Dhaka
      console.log('Using default parameters');
      setSelectedLat(23.8103);
      setSelectedLng(90.4125);
    }
  }, [urlSearchParams, initialParams]);

  // Fetch location suggestions from OpenStreetMap Nominatim API
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setIsSearchingLocation(true);
      console.log('Fetching location suggestions for:', query);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Location suggestions received:', data);
      
      const suggestions = data.map((place) => ({
        display_name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        type: place.type,
        importance: place.importance,
        address: place.address
      }));
      
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Handle destination input change
  const handleDestinationChange = (value) => {
    setDestination(value);
    setSelectedLat(null);
    setSelectedLng(null);
    
    if (value.length >= 3) {
      setShowHotelDestinations(true);
      fetchLocationSuggestions(value);
    } else {
      setShowHotelDestinations(false);
      setLocationSuggestions([]);
    }
  };

  // Handle location selection from suggestions
  const handleLocationSelect = (suggestion) => {
    console.log('Location selected:', suggestion);
    setDestination(suggestion.display_name);
    setSelectedLat(suggestion.lat);
    setSelectedLng(suggestion.lon);
    setShowHotelDestinations(false);
    setLocationSuggestions([]);
  };

  const handleSearch = async () => {
    if (!destination || !selectedLat || !selectedLng) {
      alert("Please select a valid location from the suggestions");
      return;
    }

    const destinationSlug = destination
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/,/g, '')
      .replace(/'/g, '');
    
    const params = new URLSearchParams();
    params.append("destination", destinationSlug);
    params.append("lat", selectedLat.toString());
    params.append("lng", selectedLng.toString());
    params.append("checkIn", checkInDate.toISOString().split("T")[0]);
    params.append("checkOut", checkOutDate.toISOString().split("T")[0]);
    params.append("rooms", rooms.toString());
    params.append("adults", adults.toString());
    params.append("children", children.toString());

    const newUrl = `/hotels/search?${params.toString()}`;
    console.log('Navigating to:', newUrl);
    
    // Use router.push with scroll: false to prevent page scroll and then trigger search
    await router.push(newUrl, { scroll: false });
    
    // Call the onSearch callback to trigger data refetch
    if (onSearch) {
      console.log('Calling onSearch callback');
      onSearch();
    }
  };

  // ... rest of the component remains the same
  const handleCheckInChange = (date) => {
    setCheckInDate(date);
    if (checkOutDate < date) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      setCheckOutDate(newDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Popular destinations for quick selection
  const popularDestinations = [
    { name: "Dhaka, Bangladesh", lat: 23.8103, lng: 90.4125 },
    { name: "Chattogram, Bangladesh", lat: 22.3569, lng: 91.7832 },
    { name: "Cox's Bazar, Bangladesh", lat: 21.4272, lng: 92.0058 },
    { name: "Sylhet, Bangladesh", lat: 24.8949, lng: 91.8687 },
    { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
    { name: "London, UK", lat: 51.5074, lng: -0.1278 },
    { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
    { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
    { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
    { name: "Singapore, Singapore", lat: 1.3521, lng: 103.8198 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Destination Field with API-based search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => {
                if (destination.length >= 3) {
                  setShowHotelDestinations(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowHotelDestinations(false), 200)}
              placeholder="Enter city, address, or landmark..."
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
            />
            
            {/* Loading indicator */}
            {isSearchingLocation && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5A53A7]"></div>
              </div>
            )}

            {/* Location suggestions dropdown */}
            {showHotelDestinations && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                {/* Popular destinations */}
                {locationSuggestions.length === 0 && destination.length < 3 && (
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">POPULAR DESTINATIONS</p>
                    {popularDestinations.map((dest, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-gray-800 flex items-center text-sm rounded"
                        onClick={() => {
                          setDestination(dest.name);
                          setSelectedLat(dest.lat);
                          setSelectedLng(dest.lng);
                          setShowHotelDestinations(false);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 text-[#5A53A7]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {dest.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* API search results */}
                {locationSuggestions.length > 0 && (
                  <>
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-600 font-medium">SEARCH RESULTS</p>
                    </div>
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        <div className="flex items-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {suggestion.display_name.split(',')[0]}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {suggestion.display_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Coordinates: {suggestion.lat.toFixed(4)}, {suggestion.lon.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* No results message */}
                {locationSuggestions.length === 0 && destination.length >= 3 && !isSearchingLocation && (
                  <div className="p-4 text-center text-gray-500">
                    No locations found. Try a different search term.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected coordinates display */}
          {selectedLat && selectedLng && (
            <div className="mt-1 text-xs text-green-600">
              ✓ Location selected: {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          {/* Check-in Date */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check In
            </label>
            <DatePicker
              selected={checkInDate}
              onChange={handleCheckInChange}
              minDate={new Date()}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
              calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
              customInput={
                <div className="flex items-center justify-between cursor-pointer">
                  <span>{formatDate(checkInDate)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
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

          {/* Check-out Date */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Out
            </label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              minDate={checkInDate}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
              calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
              customInput={
                <div className="flex items-center justify-between cursor-pointer">
                  <span>{formatDate(checkOutDate)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rooms & Guests
          </label>
          <div
            className="flex items-center justify-between p-3 rounded-lg border border-gray-300 cursor-pointer"
            onClick={() => setShowGuestSelector(!showGuestSelector)}
          >
            <span>
              {rooms} Room, {adults} Adult{adults !== 1 ? "s" : ""}, {children}{" "}
              Child{children !== 1 ? "ren" : ""}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
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
            <div className="absolute z-10 w-full mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Rooms</span>
                  <div className="flex items-center">
                    <button
                      type="button"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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

      {/* Search Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSearch}
          disabled={!selectedLat || !selectedLng}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            selectedLat && selectedLng
              ? "bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Search Hotels
        </button>
      </div>
    </div>
  );
}