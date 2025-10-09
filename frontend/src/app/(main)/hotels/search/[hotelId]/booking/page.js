"use client";

import {
  FiArrowLeft,
  FiCheck,
  FiMapPin,
  FiStar,
  FiUser,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function BookingConfirmationPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hotelId = params.hotelId;
  const rateId = searchParams.get("rateId");

  // Get booking details from URL params
  const roomType = searchParams.get("roomType") || "Quadruple Room";
  const price = searchParams.get("price") || "0";
  const boardType = searchParams.get("boardType") || "room_only";
  const currency = searchParams.get("currency") || "BDT";

  // State for quote data
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  // In BookingConfirmationPage component
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("authToken") || "";
      setToken(authToken);
      setIsAuthenticated(!!authToken);
      setLoading(false);

      if (!authToken) {
        // Redirect to login with current URL as redirect parameter
        const currentUrl = window.location.pathname + window.location.search;
        router.push("/login?redirect=" + encodeURIComponent(currentUrl));
      }
    };

    checkAuth();
  }, [router]);

  // Fetch quote data
  useEffect(() => {
    const fetchQuoteData = async () => {
      if (!rateId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hotels/quotes/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rate_id: rateId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch quote data: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          setQuoteData(data.quote);
        } else {
          throw new Error(data.message || "Failed to fetch quote data");
        }
      } catch (err) {
        console.error("Error fetching quote data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchQuoteData();
    }
  }, [rateId, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper functions
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

  const formatPrice = (price, currency = "BDT") => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getBedDisplay = (beds) => {
    if (!beds || beds.length === 0) return "Bed information not available";

    return beds
      .map((bed) => `${bed.count} ${bed.type} bed${bed.count > 1 ? "s" : ""}`)
      .join(", ");
  };

  // Calculate nights from check-in/check-out dates
  const calculateNights = () => {
    if (!quoteData) return 0;

    const checkIn = new Date(quoteData.check_in_date);
    const checkOut = new Date(quoteData.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Count adults and children
  const countGuests = () => {
    if (!quoteData?.guests) return { adults: 0, children: 0 };

    const adults = quoteData.guests.filter(
      (guest) => guest.type === "adult"
    ).length;
    const children = quoteData.guests.filter(
      (guest) => guest.type === "child"
    ).length;

    return { adults, children };
  };

  // Handle payment initiation
  const handleContinueToPayment = async () => {
    if (!isFormValid) return;

    // Check authentication
    if (!isAuthenticated || !token) {
      router.push(
        "/login?redirect=" +
          encodeURIComponent(window.location.pathname + window.location.search)
      );
      return;
    }

    setPaymentProcessing(true);

    try {
      const { adults, children } = countGuests();
      const totalAmount =
        parseFloat(price) +
        (parseFloat(quoteData.tax_amount) || 0) +
        (parseFloat(quoteData.fee_amount) || 0);

      // Build guest info from quoteData
      const guestInfo = quoteData.guests.map((guest) => ({
        type: guest.type,
        age: guest.age || null,
      }));

      const paymentPayload = {
        total_amount: totalAmount,
        currency: currency,
        quote_id: quoteData.id,
        email: formData.email,
        cus_name: `${formData.firstName} ${formData.lastName}`,
        cus_phone: formData.phone,
        cus_add1: "Guest Address", // You can add address fields to form if needed
        cus_add2: "",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1207",
        cus_country: "Bangladesh",
        product_name: "Hotel Booking",
        product_category: "Travel",
        product_profile: "service",
        shipping_method: "NO",
        guest_info: guestInfo,
      };

      console.log("🔄 Initiating payment with payload:", paymentPayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/payments/initiate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      const data = await response.json();
      console.log("📥 Payment initiation response:", data);

      if (data.success && data.payment_url) {
        // Redirect to SSLCommerz payment gateway
        console.log("🔗 Redirecting to payment gateway:", data.payment_url);
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("❌ Payment initiation error:", err);
      alert(`Payment initiation failed: ${err.message}`);
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7]"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to continue with your booking.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`}
            className="inline-flex items-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Booking Details
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href={`/hotels/search/${hotelId}`}
            className="inline-flex items-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to room selection
          </Link>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No booking data found
          </h2>
          <Link
            href={`/hotels/search/${hotelId}`}
            className="inline-flex items-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to room selection
          </Link>
        </div>
      </div>
    );
  }

  const hotel = quoteData.accommodation;
  const nights = calculateNights();
  const { adults, children } = countGuests();
  const room = hotel.rooms?.[0];
  const rate = room?.rates?.[0];

  const isFormValid =
    formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <div className="px-4 md:px-[190px] py-8 bg-gradient-to-b from-[#f7f7ff] to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href={`/hotels/search/${hotelId}`}
          className="flex items-center text-[#5A53A7] mb-6 hover:underline font-medium"
        >
          <FiArrowLeft className="mr-2" size={18} />
          Back to room selection
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#5A53A7] text-white flex items-center justify-center mb-1">
              1
            </div>
            <span className="text-sm text-[#5A53A7] font-medium">
              Your Stay
            </span>
          </div>
          <div className="h-1 flex-1 bg-[#5A53A7] mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#5A53A7] text-white flex items-center justify-center mb-1">
              2
            </div>
            <span className="text-sm text-[#5A53A7] font-medium">
              Your Details
            </span>
          </div>
          <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-sm text-gray-500">Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Booking details and form */}
          <div className="lg:w-2/3">
            {/* Hotel summary card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="relative rounded-xl overflow-hidden h-48">
                    <Image
                      src={imageSrc}
                      alt={hotel.name || "Hotel Image"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/hotel-placeholder.jpg";
                      }}
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {hotel.name}
                      </h1>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full mr-3">
                          <span className="text-blue-800 font-medium text-sm mr-1">
                            {hotel.rating}
                          </span>
                          <FiStar className="text-yellow-500 fill-yellow-500 text-sm" />
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <FiMapPin className="mr-1 text-[#5A53A7]" size={14} />
                          <span>
                            {hotel.location?.address
                              ? `${hotel.location.address.city_name}, ${hotel.location.address.country_code}`
                              : "Location not available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking dates */}
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        Check-In
                      </p>
                      <p className="font-medium">
                        {formatDisplayDate(quoteData.check_in_date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        After{" "}
                        {hotel.check_in_information?.check_in_after_time ||
                          "2:00 PM"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        Nights
                      </p>
                      <p className="font-medium">{nights}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        Check-Out
                      </p>
                      <p className="font-medium">
                        {formatDisplayDate(quoteData.check_out_date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Before{" "}
                        {hotel.check_in_information?.check_out_before_time ||
                          "12:00 PM"}
                      </p>
                    </div>
                  </div>

                  {/* Guest count */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">
                          Guests
                        </p>
                        <p className="font-medium">
                          {adults} Adult{adults > 1 ? "s" : ""}
                          {children > 0
                            ? `, ${children} Child${children > 1 ? "ren" : ""}`
                            : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">
                          Rooms
                        </p>
                        <p className="font-medium text-right">
                          {quoteData.rooms}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Room details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {room?.name || roomType}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full flex items-center">
                        <FiCheck className="mr-1" size={12} />
                        {getBoardTypeDisplay(rate?.board_type || boardType)}
                      </span>
                      {rate?.payment_type === "pay_now" && (
                        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full flex items-center">
                          <FiCheck className="mr-1" size={12} />
                          Pay Now
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Bed:</span>
                        <span>{getBedDisplay(room?.beds)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Guests:</span>
                        <span>{adults + children}</span>
                      </div>
                      {rate?.conditions?.some(
                        (condition) =>
                          condition.title.includes("Pet Policy") &&
                          condition.description.includes("not allowed")
                      ) && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Pets:</span>
                          <span>Not Allowed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest information form */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Guest Information
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="specialRequests"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                    placeholder="Any special requests or notes for the hotel..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Pricing summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Price Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Room Rate ({nights} night{nights > 1 ? "s" : ""})
                  </span>
                  <span className="font-medium">
                    {formatPrice(parseFloat(price), currency)}
                  </span>
                </div>

                {quoteData.tax_amount &&
                  parseFloat(quoteData.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">
                        {formatPrice(
                          parseFloat(quoteData.tax_amount),
                          quoteData.tax_currency
                        )}
                      </span>
                    </div>
                  )}

                {quoteData.fee_amount &&
                  parseFloat(quoteData.fee_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Fees</span>
                      <span className="font-medium">
                        {formatPrice(
                          parseFloat(quoteData.fee_amount),
                          quoteData.fee_currency
                        )}
                      </span>
                    </div>
                  )}
              </div>

              <div className="border-t border-gray-200 pt-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold text-lg">
                    Grand Total
                  </span>
                  <span className="text-[#5A53A7] font-bold text-lg">
                    {formatPrice(
                      parseFloat(price) +
                        (parseFloat(quoteData.tax_amount) || 0) +
                        (parseFloat(quoteData.fee_amount) || 0),
                      currency
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Includes all taxes and fees
                </p>
              </div>

              {/* Payment information */}
              {rate?.payment_type && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Payment Information
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      Payment Type:{" "}
                      {rate.payment_type === "pay_now"
                        ? "Pay Now"
                        : "Pay at Hotel"}
                    </p>
                    {rate.due_at_accommodation_amount &&
                      parseFloat(rate.due_at_accommodation_amount) > 0 && (
                        <p>
                          Due at Hotel:{" "}
                          {formatPrice(
                            parseFloat(rate.due_at_accommodation_amount),
                            rate.due_at_accommodation_currency
                          )}
                        </p>
                      )}
                  </div>
                </div>
              )}

              <button
                onClick={handleContinueToPayment}
                disabled={!isFormValid || paymentProcessing || !isAuthenticated}
                className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium shadow-sm transition ${
                  isFormValid && !paymentProcessing && isAuthenticated
                    ? "bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : !isAuthenticated ? (
                  "Please Login to Continue"
                ) : (
                  <>
                    Continue to Payment <span className="ml-2">→</span>
                  </>
                )}
              </button>

              {/* Cancellation policy */}
              {rate?.conditions?.some((condition) =>
                condition.title.includes("Cancellation")
              ) && (
                <div className="mt-4 text-xs text-gray-500">
                  <p>Free cancellation available as per hotel policy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
