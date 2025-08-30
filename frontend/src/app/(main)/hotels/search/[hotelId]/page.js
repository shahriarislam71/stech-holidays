// app/hotels/search/[hotelId]/page.js
"use client";

import { use, useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
} from "react-icons/fi";
import {
  FaSwimmingPool,
  FaWifi,
  FaUtensils,
  FaWheelchair,
  FaDumbbell,
  FaShieldAlt,
  FaFireExtinguisher,
  FaPrint,
  FaLaptop,
  FaTv,
  FaSnowflake,
} from "react-icons/fa";
import {
  MdElevator,
  MdRestaurant,
  MdSmokeFree,
  MdLocalCafe,
} from "react-icons/md";
import Link from "next/link";
import { hotelData } from "@/constants/hotelData";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamic map import
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
      Loading map...
    </div>
  ),
});

// Room data
const rooms = [
  {
    id: 1,
    type: "Executive Deluxe",
    image:
      "/hotels/hotel-image-1.jpg", // Add your room image path
    bedType: "Queen",
    capacity: "02",
    smoking: "Non-Smoking Room",
    size: "380 sq.ft",
    prices: [5000, 6000, 8000],
    facilities: [
      { icon: <FaTv className="text-[#5A53A7]" />, name: "TV" },
      { icon: <FaSnowflake className="text-[#5A53A7]" />, name: "AC Room" },
      { icon: <FaSnowflake className="text-[#5A53A7]" />, name: "AC remote" },
    ],
    amenities: [
      {
        icon: <FaSnowflake className="text-[#5A53A7]" />,
        name: "Fresh pillows",
      },
      {
        icon: <FaSnowflake className="text-[#5A53A7]" />,
        name: "Fresh towels",
      },
    ],
  },
  {
    id: 2,
    type: "Bed And Breakfast",
    image:
      "/hotels/hotel-image-2.jpg", // Add your room image path
    bedType: "King",
    capacity: "02",
    smoking: "Non-Smoking Room",
    size: "420 sq.ft",
    prices: [7000, 8000, 9000],
    facilities: [
      { icon: <FaTv className="text-[#5A53A7]" />, name: "TV" },
      { icon: <FaSnowflake className="text-[#5A53A7]" />, name: "AC Room" },
    ],
    amenities: [
      {
        icon: <FaSnowflake className="text-[#5A53A7]" />,
        name: "Fresh pillows",
      },
      {
        icon: <FaSnowflake className="text-[#5A53A7]" />,
        name: "Daily cleaning",
      },
    ],
  },
];

export default function HotelDetailsPage({ params }) {
  const { hotelId } = use(params);
  const numericHotelId = Number(hotelId);

  const [showDescModal, setShowDescModal] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [currentRoomDetails, setCurrentRoomDetails] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Find the hotel by ID
  let hotel = null;
  for (const city of Object.values(hotelData)) {
    const foundHotel = city.hotels.find((h) => h.id === numericHotelId);
    if (foundHotel) {
      hotel = foundHotel;
      break;
    }
  }

  if (!hotel) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hotel not found
          </h2>
          <Link
            href="/hotels/search"
            className="inline-flex items-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to search results
          </Link>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setSelectedPrice(null);
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price);
  };

  const openRoomDetails = (room) => {
    setCurrentRoomDetails(room);
    setShowRoomDetailsModal(true);
  };

  return (
    <div className="px-4 md:px-[190px] py-4 bg-gradient-to-b from-[#f7f7ff] to-white min-h-screen">
      {/* Back button */}
      <div className="max-w-7xl mx-auto">
        <Link
          href="/hotels/search"
          className="flex items-center text-[#5A53A7] mb-3 hover:underline font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to results
        </Link>

        {/* Hotel header */}
        <div className="bg-white rounded-xl shadow-lg px-6 py-2 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {hotel.name}
              </h1>
              <div className="flex items-center mt-2 text-gray-600">
                <FiMapPin className="mr-1 text-[#5A53A7]" />
                <p className="text-sm md:text-base">{hotel.location}</p>
              </div>
            </div>
            <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-blue-800 font-medium mr-1">
                {hotel.rating}
              </span>
              <FiStar className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>

          <div className="mt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] bg-clip-text text-transparent">
              <p className="text-gray-500 text-sm md:text-base">
                Starting from
              </p>
              <p className="text-2xl md:text-3xl font-bold">${hotel.price}</p>
              <p className="text-xs text-gray-500">per night</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-lg hover:opacity-90 transition font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform w-full md:w-auto">
              Select Rooms
            </button>
          </div>
        </div>

        {/* Hotel image and details */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-2/3">
            <div className="relative rounded-xl shadow-lg overflow-hidden h-64 md:h-96">
              <Image width={100} height={100}
                src={hotel.image}
                alt={hotel.name}
                className="w-full rounded object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <button
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20"
                >
                  <FiMapPin className="mr-1" />
                  <span className="text-sm">View on map</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Property Info
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Rooms:</span>
                <span className="text-gray-900 font-medium">101</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Floors:</span>
                <span className="text-gray-900 font-medium">8</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 text-sm line-clamp-3">
                Hotel Agrabad with its 4 star guest facilities is the best
                business and leisure hotel in Chittagong...
              </p>

              <button
                onClick={() => setShowDescModal(true)}
                className="text-[#5A53A7] hover:underline text-sm font-medium mt-2 flex items-center"
              >
                Read full description
                <FiChevronDown className="ml-1" />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Top Facilities
              </h3>
              <div className="space-y-3">
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-50 rounded-lg p-2"
                  >
                    <div className="text-[#5A53A7] mr-3 bg-white p-2 rounded-lg shadow-sm">
                      {amenity.includes("Pool") && <FaSwimmingPool size={16} />}
                      {amenity.includes("WiFi") && <FaWifi size={16} />}
                      {amenity.includes("Restaurant") && (
                        <FaUtensils size={16} />
                      )}
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowFacilitiesModal(true)}
                className="mt-3 text-[#5A53A7] hover:underline text-sm font-medium flex items-center"
              >
                See All Facilities
                <FiChevronDown className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible sections */}
        <div className="space-y-4 max-w-4xl mb-8">
          {/* Check In/Out */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <button
              onClick={() => toggleSection("checkInOut")}
              className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#5A53A7]/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#5A53A7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">Check In & Out</h2>
              </div>
              {expandedSection === "checkInOut" ? (
                <FiChevronUp className="text-[#5A53A7]" />
              ) : (
                <FiChevronDown className="text-[#5A53A7]" />
              )}
            </button>
            {expandedSection === "checkInOut" && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="text-gray-900 font-medium">
                    From 2:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="text-gray-900 font-medium">
                    Before 12:00 PM
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nearby */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <button
              onClick={() => toggleSection("nearby")}
              className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#5A53A7]/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#5A53A7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">What&apos;s Nearby</h2>
              </div>
              {expandedSection === "nearby" ? (
                <FiChevronUp className="text-[#5A53A7]" />
              ) : (
                <FiChevronDown className="text-[#5A53A7]" />
              )}
            </button>
            {expandedSection === "nearby" && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Airport:</span>
                  <span className="text-gray-900 font-medium">16.2 km</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Railway Station:</span>
                  <span className="text-gray-900 font-medium">2.6 km</span>
                </div>
                <button
                  onClick={() => setShowMapModal(true)}
                  className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
                >
                  <FiMapPin className="mr-2" />
                  View on Map
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rooms Selection Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Select Your Room
              </h2>

              {rooms.map((room) => (
                <div key={room.id} className="mb-8 last:mb-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Room Image */}
                    <div className="md:w-1/3">
                      <div className="relative rounded-lg overflow-hidden h-48">
                        <Image width={50} height={50}
                          src={room.image}
                          alt={room.type}
                          className="w-full h-full rounded object-cover"
                        />
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {room.type}
                      </h3>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium">{room.bedType}</span>
                        </div>
                        <div className="flex items-center">
                          <span>Max Capacity: {room.capacity}</span>
                        </div>
                        <div className="flex items-center">
                          <span>{room.smoking}</span>
                        </div>
                        <div className="flex items-center">
                          <span>{room.size}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openRoomDetails(room)}
                        className="mt-3 text-[#5A53A7] hover:underline text-sm font-medium flex items-center"
                      >
                        View Room Details <FiChevronDown className="ml-1" />
                      </button>

                      {/* Price Selection */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Select Price:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {room.prices.map((price, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleRoomSelect(room);
                                handlePriceSelect(price);
                              }}
                              className={`px-4 py-2 rounded-lg border ${
                                selectedRoom?.id === room.id &&
                                selectedPrice === price
                                  ? "border-[#5A53A7] bg-[#5A53A7]/10 text-[#5A53A7]"
                                  : "border-gray-300 hover:border-[#5A53A7]"
                              }`}
                            >
                              {price} BDT
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary Sidebar - Desktop Only */}
          {!isMobile && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Pricing Summary
                </h2>

                {selectedRoom && selectedPrice ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-medium">{selectedRoom.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">{selectedPrice} BDT</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{selectedPrice} BDT</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={{
                        pathname: `/hotels/search/${hotelId}/booking`,
                        query: {
                          roomType: selectedRoom?.type,
                          checkIn: "Sun, Jun 29", // Replace with actual dates
                          checkOut: "Mon, Jun 30",
                          nights: "1",
                          adults: "1",
                          children: "0",
                          price: selectedPrice,
                          taxes: "3467",
                          total: (parseInt(selectedPrice) + 3467).toString(),
                        },
                      }}
                    >
                      <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-lg hover:opacity-90 transition font-medium shadow-md">
                        Continue →
                      </button>
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select a room and price to see summary</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Booking Button - Fixed at bottom */}
        {isMobile && selectedRoom && selectedPrice && (
          <div className="fixed bottom-4 right-4 z-40">
            <Link
              href={{
                pathname: `/hotels/search/${hotelId}/booking`,
                query: {
                  roomType: selectedRoom?.type,
                  checkIn: "Sun, Jun 29",
                  checkOut: "Mon, Jun 30",
                  nights: "1",
                  adults: "1",
                  children: "0",
                  price: selectedPrice,
                  taxes: "3467",
                  total: (parseInt(selectedPrice) + 3467).toString(),
                },
              }}
            >
              <button className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <FiCheck size={24} />
              </button>
            </Link>
           
          </div>
        )}

        {/* Room Details Modal */}
        {showRoomDetailsModal && currentRoomDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Room Details
                </h2>
                <button
                  onClick={() => setShowRoomDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Room Image */}
                <div className="relative rounded-lg overflow-hidden h-64 mb-6">
                  <Image width={50} height={50}
                    src={currentRoomDetails.image}
                    alt={currentRoomDetails.type}
                    className="w-full h-full rounded object-cover"
                  />
                </div>

                {/* Room Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {currentRoomDetails.type}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {currentRoomDetails.bedType}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span>Max Capacity: {currentRoomDetails.capacity}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{currentRoomDetails.smoking}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{currentRoomDetails.size}</span>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Facilities & Services
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentRoomDetails.facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 rounded-lg p-3"
                      >
                        <div className="mr-3 bg-white p-2 rounded-lg shadow-sm">
                          {facility.icon}
                        </div>
                        <span className="font-medium text-gray-800">
                          {facility.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Amenities Extras
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentRoomDetails.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 rounded-lg p-3"
                      >
                        <div className="mr-3 bg-white p-2 rounded-lg shadow-sm">
                          {amenity.icon}
                        </div>
                        <span className="font-medium text-gray-800">
                          {amenity.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowRoomDetailsModal(false)}
                  className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Description Modal */}
        {showDescModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Property Description
                </h2>
                <button
                  onClick={() => setShowDescModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between mb-6 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white p-4 rounded-lg">
                  <div>
                    <p className="text-sm">Number of Rooms</p>
                    <p className="text-2xl font-bold">101</p>
                  </div>
                  <div>
                    <p className="text-sm">Number of Floors</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    Hotel Agrabad with its 4 star guest facilities is the best
                    business and leisure hotel in Chittagong. Hosting their
                    guests in the 101 rooms and suites designed specifically
                    with the world&apos;s luxury and comfort in mind.
                  </p>
                  <p className="leading-relaxed">
                    The hotel houses four different multi-cuisine restaurants to
                    ensure the satisfaction of the taste-buds of guests from all
                    around the world. For leisure and entertainment, guests can
                    take advantage of the fully equipped fitness centre, the six
                    lane swimming pool and rejuvenate at the authentic Thai spa.
                  </p>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowDescModal(false)}
                  className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Facilities Modal */}
        {showFacilitiesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Facilities & Services
                </h2>
                <button
                  onClick={() => setShowFacilitiesModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-8">
                  <FacilityCategory
                    title="General"
                    items={[
                      {
                        icon: (
                          <MdElevator className="text-[#5A53A7]" size={18} />
                        ),
                        name: "Elevator",
                      },
                      {
                        icon: (
                          <MdRestaurant className="text-[#5A53A7]" size={18} />
                        ),
                        name: "Restaurant",
                      },
                      {
                        icon: (
                          <FaWheelchair className="text-[#5A53A7]" size={16} />
                        ),
                        name: "Disability Friendly",
                      },
                      {
                        icon: <FaWifi className="text-[#5A53A7]" size={16} />,
                        name: "Wi-Fi",
                      },
                      {
                        icon: (
                          <MdLocalCafe className="text-[#5A53A7]" size={18} />
                        ),
                        name: "Cafe",
                      },
                    ]}
                  />

                  <FacilityCategory
                    title="Fitness & Wellness"
                    items={[
                      {
                        icon: (
                          <FaSwimmingPool
                            className="text-[#5A53A7]"
                            size={16}
                          />
                        ),
                        name: "Swimming Pool",
                      },
                      {
                        icon: (
                          <FaDumbbell className="text-[#5A53A7]" size={16} />
                        ),
                        name: "Gym",
                      },
                    ]}
                  />

                  <FacilityCategory
                    title="Security & Safety"
                    items={[
                      {
                        icon: (
                          <FaShieldAlt className="text-[#5A53A7]" size={16} />
                        ),
                        name: "24 Hour Security",
                      },
                      {
                        icon: (
                          <FaFireExtinguisher
                            className="text-[#5A53A7]"
                            size={16}
                          />
                        ),
                        name: "Fire Safety",
                      },
                      {
                        icon: (
                          <MdSmokeFree className="text-[#5A53A7]" size={18} />
                        ),
                        name: "Smoke Detector",
                      },
                    ]}
                  />

                  <FacilityCategory
                    title="Business Facilities"
                    items={[
                      {
                        icon: <FaPrint className="text-[#5A53A7]" size={16} />,
                        name: "Printer",
                      },
                      {
                        icon: <FaLaptop className="text-[#5A53A7]" size={16} />,
                        name: "Computer",
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowFacilitiesModal(false)}
                  className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Location
                </h2>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="h-96 rounded-lg overflow-hidden mb-6 border border-gray-200">
                  <Map location={hotel.location} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {hotel.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{hotel.location}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">Airport</p>
                      <p className="font-medium">16.2 km</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">Railway</p>
                      <p className="font-medium">2.6 km</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Facility Category Component
function FacilityCategory({ title, items }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3 text-gray-900 pb-2 border-b border-gray-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-50 rounded-lg p-3 hover:bg-[#5A53A7]/5 transition-colors"
          >
            <div className="mr-3 bg-white p-2 rounded-lg shadow-sm">
              {item.icon}
            </div>
            <span className="font-medium text-gray-800">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}