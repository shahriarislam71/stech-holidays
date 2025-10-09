// app/hotels/search/[hotelId]/page.js
"use client";

import { use, useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
  FiUsers,
  FiCoffee,
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
  FaConciergeBell,
  FaParking,
  FaSpa,
} from "react-icons/fa";
import {
  MdElevator,
  MdRestaurant,
  MdSmokeFree,
  MdLocalCafe,
  MdRoomService,
} from "react-icons/md";
import Link from "next/link";
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

// Amenity icons mapping
const amenityIcons = {
  "Laundry Service": <FaConciergeBell className="text-[#5A53A7]" size={16} />,
  "Wi-Fi": <FaWifi className="text-[#5A53A7]" size={16} />,
  Parking: <FaParking className="text-[#5A53A7]" size={16} />,
  "Business Centre": <FaLaptop className="text-[#5A53A7]" size={16} />,
  Gym: <FaDumbbell className="text-[#5A53A7]" size={16} />,
  "Wheelchair Access": <FaWheelchair className="text-[#5A53A7]" size={16} />,
  Spa: <FaSpa className="text-[#5A53A7]" size={16} />,
  "24-Hour Front Desk": <FaShieldAlt className="text-[#5A53A7]" size={16} />,
  "Cash Machine": <FaPrint className="text-[#5A53A7]" size={16} />,
  Concierge: <FaConciergeBell className="text-[#5A53A7]" size={16} />,
  "Room Service": <MdRoomService className="text-[#5A53A7]" size={18} />,
  "Childcare Services": <FiUsers className="text-[#5A53A7]" size={16} />,
  Lounge: <MdLocalCafe className="text-[#5A53A7]" size={18} />,
  "Swimming Pool": <FaSwimmingPool className="text-[#5A53A7]" size={16} />,
  Restaurant: <MdRestaurant className="text-[#5A53A7]" size={18} />,
  "Hearing Impaired Services": (
    <FaWheelchair className="text-[#5A53A7]" size={16} />
  ),
};

// Exchange rates (approximate, you may want to fetch from an API)
const EXCHANGE_RATES = {
  USD: 110,
  GBP: 140,
  EUR: 120,
  BDT: 1,
};

export default function HotelDetailsPage({ params }) {
  const { hotelId } = use(params);

  const [showDescModal, setShowDescModal] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [currentRoomDetails, setCurrentRoomDetails] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hotel, setHotel] = useState(null);
  const [roomOffers, setRoomOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const roomsSectionRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Fetch hotel data from API
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hotels/search/${hotelId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch hotel data: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          setHotel(data.hotel);
          // Filter out rooms with quantity_available = 0
          const availableRooms = (data.room_offers || []).filter(
            (room) => room.quantity_available && room.quantity_available > 0
          );
          setRoomOffers(availableRooms);
        } else {
          throw new Error(data.message || "Failed to fetch hotel data");
        }
      } catch (err) {
        console.error("Error fetching hotel data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotelData();
    }
  }, [hotelId]);

  // Convert price to BDT
  const convertToBDT = (price, currency = "GBP") => {
    const numPrice = parseFloat(price);
    const rate = EXCHANGE_RATES[currency] || EXCHANGE_RATES["GBP"];
    return numPrice * rate;
  };

  // Format price in BDT
  const formatPrice = (price, currency = "GBP") => {
    const bdtPrice = convertToBDT(price, currency);
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(bdtPrice);
  };

  // Get bed type display
  const getBedDisplay = (beds) => {
    if (!beds || beds.length === 0) return "Bed information not available";

    return beds
      .map((bed) => `${bed.count} ${bed.type} bed${bed.count > 1 ? "s" : ""}`)
      .join(", ");
  };

  // Get board type display
  const getBoardTypeDisplay = (boardType) => {
    const boardTypes = {
      room_only: "Room Only",
      breakfast: "Breakfast Included",
      half_board: "Half Board",
      full_board: "Full Board",
      all_inclusive: "All Inclusive",
    };
    return boardTypes[boardType] || boardType;
  };

  // Get room image - cycle through available photos
  const getRoomImage = (roomIndex) => {
    if (!hotel?.photos || hotel.photos.length === 0) {
      return "/hotel-placeholder.jpg";
    }

    // Use different photos for different rooms, cycling through available photos
    const photoIndex = (roomIndex + 1) % hotel.photos.length;
    return hotel.photos[photoIndex]?.url || "/hotel-placeholder.jpg";
  };

  // Group room offers by room type
  const groupedRoomOffers = roomOffers.reduce((groups, offer) => {
    const roomName = offer.room_name;
    if (!groups[roomName]) {
      groups[roomName] = [];
    }
    groups[roomName].push(offer);
    return groups;
  }, {});

  // Scroll to rooms section
  const scrollToRooms = () => {
    roomsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleRoomSelect = (roomOffer) => {
    setSelectedRoom(roomOffer);
    setSelectedPrice(roomOffer.total_amount);
  };

  const openRoomDetails = (roomOffers) => {
    setCurrentRoomDetails(roomOffers);
    setShowRoomDetailsModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !hotel) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Hotel
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
        <div className="bg-white rounded-xl shadow-lg px-6 py-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {hotel.name}
              </h1>
              <div className="flex items-center mt-2 text-gray-600">
                <FiMapPin className="mr-1 text-[#5A53A7]" />
                <p className="text-sm md:text-base">
                  {hotel.location?.address
                    ? `${hotel.location.address.line_one}, ${hotel.location.address.city_name}, ${hotel.location.address.country_code}`
                    : "Location not available"}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-blue-800 font-medium mr-1">
                {hotel.rating}
              </span>
              <FiStar className="text-yellow-500 fill-yellow-500" />
              <span className="text-blue-800 text-sm ml-2">
                ({hotel.review_count} reviews)
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] bg-clip-text text-transparent">
              <p className="text-gray-500 text-sm md:text-base">
                Starting from
              </p>
              <p className="text-2xl md:text-3xl font-bold">
                {formatPrice(
                  roomOffers[0]?.total_amount || 0,
                  roomOffers[0]?.currency
                )}
              </p>
              <p className="text-xs text-gray-500">per night</p>
            </div>
            <button
              onClick={scrollToRooms}
              className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-lg hover:opacity-90 transition font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform w-full md:w-auto"
            >
              Select Rooms
            </button>
          </div>
        </div>

        {/* Hotel image and details */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-2/3">
            <div className="relative rounded-xl shadow-lg overflow-hidden h-64 md:h-96">
              <Image
                src={hotel.photos?.[0]?.url || "/hotel-placeholder.jpg"}
                alt={hotel.name}
                width={500} // adjust as needed based on layout
                height={300} // adjust as needed
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/hotel-placeholder.jpg";
                }}
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
                <span className="text-gray-600">Rating:</span>
                <span className="text-gray-900 font-medium">
                  {hotel.rating}/5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reviews:</span>
                <span className="text-gray-900 font-medium">
                  {hotel.review_count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="text-gray-900 font-medium">
                  {hotel.review_score}/10
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 text-sm line-clamp-3">
                {hotel.description}
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
                {hotel.amenities?.slice(0, 3).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-50 rounded-lg p-2"
                  >
                    <div className="text-[#5A53A7] mr-3 bg-white p-2 rounded-lg shadow-sm">
                      {amenityIcons[amenity.description] || (
                        <FiCoffee size={16} />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {amenity.description}
                    </span>
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
                    From {hotel.check_in_info?.check_in_after_time || "2:00 PM"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="text-gray-900 font-medium">
                    Before{" "}
                    {hotel.check_in_info?.check_out_before_time || "12:00 PM"}
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
                <h2 className="font-semibold text-gray-900">
                  Location Details
                </h2>
              </div>
              {expandedSection === "nearby" ? (
                <FiChevronUp className="text-[#5A53A7]" />
              ) : (
                <FiChevronDown className="text-[#5A53A7]" />
              )}
            </button>
            {expandedSection === "nearby" && (
              <div className="px-4 pb-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600 block mb-2">Address:</span>
                  <span className="text-gray-900 font-medium">
                    {hotel.location?.address
                      ? `${hotel.location.address.line_one}, ${hotel.location.address.city_name}, ${hotel.location.address.postal_code}, ${hotel.location.address.country_code}`
                      : "Address not available"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600 block mb-2">Coordinates:</span>
                  <span className="text-gray-900 font-medium">
                    {hotel.location?.geographic_coordinates
                      ? `${hotel.location.geographic_coordinates.latitude.toFixed(
                          6
                        )}, ${hotel.location.geographic_coordinates.longitude.toFixed(
                          6
                        )}`
                      : "Coordinates not available"}
                  </span>
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
        <div
          ref={roomsSectionRef}
          className="flex flex-col lg:flex-row gap-6 mb-8"
        >
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Available Rooms
              </h2>

              {Object.entries(groupedRoomOffers).map(
                ([roomName, offers], roomIndex) => (
                  <div
                    key={roomName}
                    className="mb-8 last:mb-0 border-b border-gray-100 pb-8 last:border-b-0"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Room Image */}
                      <div className="md:w-1/3">
                        <div className="relative rounded-lg overflow-hidden h-48">
                          <Image
                            src={
                              getRoomImage(roomIndex) ||
                              "/hotel-placeholder.jpg"
                            }
                            alt={roomName}
                            width={500} // adjust based on layout
                            height={300} // adjust based on layout
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/hotel-placeholder.jpg";
                            }}
                          />
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="md:w-2/3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {roomName}
                        </h3>

                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {getBedDisplay(offers[0]?.beds)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span>
                              Board:{" "}
                              {getBoardTypeDisplay(offers[0]?.board_type)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span>
                              Available:{" "}
                              {offers[0]?.quantity_available || "N/A"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openRoomDetails(offers)}
                          className="mt-3 text-[#5A53A7] hover:underline text-sm font-medium flex items-center"
                        >
                          View Room Details <FiChevronDown className="ml-1" />
                        </button>

                        {/* Price Selection */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Select Rate:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {offers.map((offer, index) => (
                              <button
                                key={offer.rate_id}
                                onClick={() => handleRoomSelect(offer)}
                                className={`px-4 py-2 rounded-lg border ${
                                  selectedRoom?.rate_id === offer.rate_id
                                    ? "border-[#5A53A7] bg-[#5A53A7]/10 text-[#5A53A7]"
                                    : "border-gray-300 hover:border-[#5A53A7]"
                                }`}
                              >
                                <div className="text-left">
                                  <div className="font-medium">
                                    {formatPrice(
                                      offer.total_amount,
                                      offer.currency
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {getBoardTypeDisplay(offer.board_type)}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Pricing Summary Sidebar - Desktop Only */}
          {!isMobile && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Pricing Summary
                </h2>

                {selectedRoom ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-medium text-right">
                          {selectedRoom.room_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Board Type:</span>
                        <span className="font-medium">
                          {getBoardTypeDisplay(selectedRoom.board_type)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bed Type:</span>
                        <span className="font-medium text-right">
                          {getBedDisplay(selectedRoom.beds)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                          {formatPrice(
                            selectedRoom.total_amount,
                            selectedRoom.currency
                          )}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>
                            {formatPrice(
                              selectedRoom.total_amount,
                              selectedRoom.currency
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={{
                        pathname: `/hotels/search/${hotelId}/booking`,
                        query: {
                          roomType: selectedRoom.room_name,
                          rateId: selectedRoom.rate_id, // Make sure this is included
                          price: convertToBDT(
                            selectedRoom.total_amount,
                            selectedRoom.currency
                          ),
                          currency: "BDT",
                          boardType: selectedRoom.board_type,
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
                    <p>Select a room to see summary</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Booking Button - Fixed at bottom */}
        {isMobile && selectedRoom && (
          <div className="fixed bottom-4 right-4 z-40">
            <Link
              href={{
                pathname: `/hotels/search/${hotelId}/booking`,
                query: {
                  roomType: selectedRoom.room_name,
                  rateId: selectedRoom.rate_id, // Make sure this is included
                  price: convertToBDT(
                    selectedRoom.total_amount,
                    selectedRoom.currency
                  ),
                  currency: "BDT",
                  boardType: selectedRoom.board_type,
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
                  Room Details - {currentRoomDetails[0]?.room_name}
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
                  <Image
                    src={
                      getRoomImage(
                        Object.keys(groupedRoomOffers).indexOf(
                          currentRoomDetails[0]?.room_name
                        )
                      ) || "/hotel-placeholder.jpg"
                    }
                    alt={currentRoomDetails[0]?.room_name || "Room Image"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/hotel-placeholder.jpg";
                    }}
                  />
                </div>

                {/* Room Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {currentRoomDetails[0]?.room_name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {getBedDisplay(currentRoomDetails[0]?.beds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available Rates */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Available Rates
                  </h4>
                  <div className="space-y-3">
                    {currentRoomDetails.map((offer, index) => (
                      <div
                        key={offer.rate_id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-[#5A53A7] transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {getBoardTypeDisplay(offer.board_type)}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getBedDisplay(offer.beds)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#5A53A7]">
                              {formatPrice(offer.total_amount, offer.currency)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Available: {offer.quantity_available}
                            </p>
                          </div>
                        </div>

                        {/* Conditions */}
                        {offer.conditions && offer.conditions.length > 0 && (
                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <h6 className="text-sm font-semibold text-gray-900 mb-2">
                              Terms & Conditions
                            </h6>
                            <div className="space-y-2">
                              {offer.conditions.map((condition, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-gray-600"
                                >
                                  <p className="font-medium text-gray-800">
                                    {condition.title}
                                  </p>
                                  <p className="mt-1">
                                    {condition.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            handleRoomSelect(offer);
                            setShowRoomDetailsModal(false);
                          }}
                          className="w-full mt-3 px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors text-sm"
                        >
                          Select This Rate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payment Information
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Payment Type:{" "}
                      {currentRoomDetails[0]?.payment_type === "pay_now"
                        ? "Pay Now"
                        : "Pay Later"}
                    </p>
                    <p>
                      Due at Property:{" "}
                      {formatPrice(
                        currentRoomDetails[0]?.due_at_accommodation_amount || 0,
                        currentRoomDetails[0]?.currency
                      )}
                    </p>
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
                    <p className="text-sm">Rating</p>
                    <p className="text-2xl font-bold">{hotel.rating}/5</p>
                  </div>
                  <div>
                    <p className="text-sm">Review Score</p>
                    <p className="text-2xl font-bold">
                      {hotel.review_score}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Reviews</p>
                    <p className="text-2xl font-bold">{hotel.review_count}</p>
                  </div>
                </div>
                <div className="space-y-4 text-gray-700">
                  {hotel.description?.split("\n").map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
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
                  {hotel.amenities && (
                    <FacilityCategory
                      title="Hotel Amenities"
                      items={hotel.amenities.map((amenity) => ({
                        icon: amenityIcons[amenity.description] || (
                          <FiCoffee size={16} />
                        ),
                        name: amenity.description,
                      }))}
                    />
                  )}
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
                  {hotel.location?.geographic_coordinates ? (
                    <Map
                      location={
                        hotel.location.address
                          ? `${hotel.location.address.city_name}, ${hotel.location.address.country_code}`
                          : "Hotel Location"
                      }
                      coordinates={hotel.location.geographic_coordinates}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Map not available
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {hotel.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {hotel.location?.address
                      ? `${hotel.location.address.line_one}, ${hotel.location.address.city_name}, ${hotel.location.address.postal_code}, ${hotel.location.address.country_code}`
                      : "Address not available"}
                  </p>
                  {hotel.location?.geographic_coordinates && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500">Latitude</p>
                        <p className="font-medium">
                          {hotel.location.geographic_coordinates.latitude.toFixed(
                            6
                          )}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500">Longitude</p>
                        <p className="font-medium">
                          {hotel.location.geographic_coordinates.longitude.toFixed(
                            6
                          )}
                        </p>
                      </div>
                    </div>
                  )}
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
