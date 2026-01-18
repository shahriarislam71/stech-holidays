"use client";

import {
  FiArrowLeft,
  FiCheck,
  FiMapPin,
  FiStar,
  FiUser,
  FiPhone,
  FiMail,
  FiInfo,
  FiClock,
  FiCreditCard,
  FiShield,
  FiFileText,
} from "react-icons/fi";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import useAuth from "@/app/hooks/useAuth";
import { useExchangeRates } from "@/app/hooks/useExchangeRates";

// Business information - UPDATE THESE WITH YOUR ACTUAL DETAILS
const BUSINESS_INFO = {
  name: "Stech Holidays",
  address: "2nd floor, House- 31 Road No. 17, Dhaka 1213",
  customerService: {
    phone: "01811-271271",
    email: "info@stechholidays.com",
    hours: "9:00 AM - 6:00 PM (GMT+6)",
    whatsapp: "01811-271271",
  },
  termsUrl: "/terms",
  privacyUrl: "/privacy-policy",
  cancellationPolicyUrl: "/terms",
};

export default function BookingConfirmationPage({ params }) {
  const { formatPrice } = useExchangeRates();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hotelId = params.hotelId;
  const rateId = searchParams.get("rateId");

  const formatPriceForDisplay = (price, currency = "USD") => {
    return formatPrice(`${currency} ${price}`, "hotel", true);
  };

  // Use the auth hook for authentication and profile data
  const { user, isLoading: authLoading } = useAuth({ redirectToLogin: true });

  // Country code data with +880 as default
  const countryCodes = [
    { code: "+880", country: "Bangladesh" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+92", country: "Pakistan" },
    { code: "+971", country: "UAE" },
    { code: "+966", country: "Saudi Arabia" },
    { code: "+65", country: "Singapore" },
    { code: "+60", country: "Malaysia" },
    { code: "+61", country: "Australia" },
    { code: "+64", country: "New Zealand" },
    { code: "+33", country: "France" },
    { code: "+49", country: "Germany" },
    { code: "+81", country: "Japan" },
    { code: "+82", country: "South Korea" },
  ];

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
  const [phoneCountryCode, setPhoneCountryCode] = useState("+880");
  const [bookingConfirmedDate] = useState(new Date().toLocaleString());

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

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
          
          // Also fetch cancellation timeline
          await fetchCancellationPolicy(data.quote.id);
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

    if (!authLoading) {
      fetchQuoteData();
    }
  }, [rateId, authLoading]);

  // Fetch cancellation policy
  const fetchCancellationPolicy = async (quoteId) => {
    try {
      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/hotels/cancellation-policy/${quoteId}/`
      );
      if (response.ok) {
        const data = await response.json();
        // Store cancellation policy data
        // You might want to add this to state
      }
    } catch (error) {
      console.error("Error fetching cancellation policy:", error);
    }
  };

  // Autofill from profile when user data is available
  useEffect(() => {
    if (user && !authLoading) {
      autofillFromProfile();
    }
  }, [user, authLoading]);

  // Function to autofill from profile
  const autofillFromProfile = () => {
    if (!user) return;

    setFormData(prev => ({
      ...prev,
      firstName: user.first_name || prev.firstName,
      lastName: user.last_name || prev.lastName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
    }));

    // Set country code from profile or default to +880
    if (user.phone_country_code) {
      setPhoneCountryCode(user.phone_country_code);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle phone country code change
  const handleCountryCodeChange = (e) => {
    setPhoneCountryCode(e.target.value);
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

  // Get cancellation policy text
  const getCancellationPolicy = () => {
    if (!quoteData?.rate_conditions) return "Non-refundable";
    
    const cancellationCondition = quoteData.rate_conditions.find(
      condition => condition.title.toLowerCase().includes('cancellation')
    );
    
    return cancellationCondition?.description || 
           "Free cancellation available up to 24 hours before check-in. Please check hotel policy for details.";
  };

  // Get refundability status
  const getRefundability = () => {
    if (!quoteData?.rate_conditions) return { isRefundable: false, text: "Non-refundable" };
    
    const hasFreeCancellation = quoteData.rate_conditions.some(
      condition => condition.description.toLowerCase().includes('free cancellation')
    );
    
    return {
      isRefundable: hasFreeCancellation,
      text: hasFreeCancellation ? "Refundable" : "Non-refundable"
    };
  };

  // Handle payment initiation
  const handleContinueToPayment = async () => {
    if (!isFormValid) return;

    // Check authentication
    if (!user) {
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
        cus_phone: `${phoneCountryCode} ${formData.phone}`,
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
        hotel_id: hotelId,
        room_type: roomType,
        check_in_date: quoteData.check_in_date,
        check_out_date: quoteData.check_out_date,
        board_type: boardType,
        special_requests: formData.specialRequests,
      };

      console.log("🔄 Initiating payment with payload:", paymentPayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/payments/initiate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      const data = await response.json();
      console.log("📥 Payment initiation response:", data);

      if (data.success && data.payment_url) {
        // Send booking confirmation email
        await sendBookingConfirmation(paymentPayload, data.reference_number);
        
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

  // Send booking confirmation
  const sendBookingConfirmation = async (bookingData, referenceNumber) => {
    try {
      const emailData = {
        reference_number: referenceNumber,
        confirmed_date: bookingConfirmedDate,
        hotel_name: quoteData?.accommodation?.name || "Hotel",
        hotel_address: getHotelAddress(),
        check_in_date: formatDisplayDate(quoteData?.check_in_date),
        check_out_date: formatDisplayDate(quoteData?.check_out_date),
        check_in_time: quoteData?.accommodation?.check_in_info?.check_in_after_time || "2:00 PM",
        check_out_time: quoteData?.accommodation?.check_in_info?.check_out_before_time || "12:00 PM",
        guests_count: countGuests().adults + countGuests().children,
        rooms_count: quoteData?.rooms || 1,
        total_paid: formatPriceForDisplay(
          parseFloat(price) +
          (parseFloat(quoteData?.tax_amount) || 0) +
          (parseFloat(quoteData?.fee_amount) || 0),
          currency
        ),
        tax_amount: formatPriceForDisplay(parseFloat(quoteData?.tax_amount) || 0, quoteData?.tax_currency),
        fee_amount: formatPriceForDisplay(parseFloat(quoteData?.fee_amount) || 0, quoteData?.fee_currency),
        due_at_accommodation: formatPriceForDisplay(
          parseFloat(quoteData?.rate?.due_at_accommodation_amount) || 0,
          quoteData?.rate?.due_at_accommodation_currency
        ),
        cancellation_policy: getCancellationPolicy(),
        refundable: getRefundability().isRefundable,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: `${phoneCountryCode} ${formData.phone}`,
      };

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/hotels/bookings/send-confirmation-email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      if (response.ok) {
        console.log("📧 Booking confirmation email sent");
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  };

  // Get hotel address
  const getHotelAddress = () => {
    if (!quoteData?.accommodation?.location?.address) {
      return "Address not available";
    }
    
    const addr = quoteData.accommodation.location.address;
    return `${addr.line_one || ''}, ${addr.city_name || ''}, ${addr.postal_code || ''}, ${addr.country_code || ''}`;
  };

  // Get check-in information
  const getCheckInInfo = () => {
    if (!quoteData?.accommodation?.check_in_info) {
      return "Please check with hotel reception upon arrival";
    }
    
    const info = quoteData.accommodation.check_in_info;
    let result = `Check-in after ${info.check_in_after_time || '2:00 PM'}, `;
    result += `Check-out before ${info.check_out_before_time || '12:00 PM'}`;
    
    if (info.key_collection) {
      result += `. ${info.key_collection}`;
    }
    
    return result;
  };

  if (authLoading || loading) {
    return (
      <div className="px-4 md:px-[190px] py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7]"></div>
        </div>
      </div>
    );
  }

  if (!user && !authLoading) {
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
  const refundability = getRefundability();

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

        {/* Booking Information Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Booking</h1>
              <p className="text-gray-600">Please review all details before proceeding to payment</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Booking will be confirmed on</p>
              <p className="font-medium">{bookingConfirmedDate}</p>
            </div>
          </div>
        </div>

        {/* Profile Autofill Button */}
        {user && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={autofillFromProfile}
              className="inline-flex items-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4488] transition"
            >
              <FiUser className="h-5 w-5 mr-2" />
              Fill from Profile
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Booking details and form */}
          <div className="lg:w-2/3">
            {/* Hotel summary card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="relative rounded-xl overflow-hidden h-48">
                    <img
                      src={hotel.photos?.[0]?.url || "/hotel-placeholder.jpg"}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/hotel-placeholder.jpg";
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
                            {getHotelAddress()}
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
                        {hotel.check_in_info?.check_in_after_time ||
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
                        {hotel.check_in_info?.check_out_before_time ||
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
                      <span className={`${refundability.isRefundable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-xs px-3 py-1 rounded-full flex items-center`}>
                        <FiShield className="mr-1" size={12} />
                        {refundability.text}
                      </span>
                      <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full flex items-center">
                        <FiCheck className="mr-1" size={12} />
                        {getBoardTypeDisplay(rate?.board_type || boardType)}
                      </span>
                      {rate?.payment_type === "pay_now" && (
                        <span className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full flex items-center">
                          <FiCreditCard className="mr-1" size={12} />
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
                    </div>
                  </div>

                  {/* Check-in Information */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FiClock className="mr-2 text-[#5A53A7]" />
                      Check-in Information
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {getCheckInInfo()}
                    </p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Booking confirmation will be sent to this email
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number*
                    </label>
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <select
                          value={phoneCountryCode}
                          onChange={handleCountryCodeChange}
                          className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.code} ({country.country})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                          required
                          placeholder="1712345678"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: Country code + phone number
                    </p>
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

            {/* Business Information Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiInfo className="mr-2 text-[#5A53A7]" />
                Our Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Business Details</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">{BUSINESS_INFO.name}</p>
                    <p className="text-gray-600 text-sm">{BUSINESS_INFO.address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Customer Service</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm flex items-center">
                      <FiPhone className="mr-2" size={14} />
                      {BUSINESS_INFO.customerService.phone}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <FiMail className="mr-2" size={14} />
                      {BUSINESS_INFO.customerService.email}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Hours: {BUSINESS_INFO.customerService.hours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FiFileText className="mr-2 text-[#5A53A7]" />
                  Terms & Policies
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    By completing this booking, you agree to our{" "}
                    <a href={BUSINESS_INFO.termsUrl} className="text-[#5A53A7] underline" target="_blank" rel="noopener noreferrer">
                      Terms and Conditions
                    </a>
                    {" "}and{" "}
                    <a href={BUSINESS_INFO.privacyUrl} className="text-[#5A53A7] underline" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <p>
                    For cancellation policy, please refer to{" "}
                    <a href={BUSINESS_INFO.cancellationPolicyUrl} className="text-[#5A53A7] underline" target="_blank" rel="noopener noreferrer">
                      our cancellation policy page
                    </a>
                    .
                  </p>
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
                    {formatPriceForDisplay(parseFloat(price), currency)}
                  </span>
                </div>

                {quoteData.tax_amount &&
                  parseFloat(quoteData.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & VAT</span>
                      <span className="font-medium">
                        {formatPriceForDisplay(
                          parseFloat(quoteData.tax_amount),
                          quoteData.tax_currency
                        )}
                      </span>
                    </div>
                  )}

                {quoteData.fee_amount &&
                  parseFloat(quoteData.fee_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fees</span>
                      <span className="font-medium">
                        {formatPriceForDisplay(
                          parseFloat(quoteData.fee_amount),
                          quoteData.fee_currency
                        )}
                      </span>
                    </div>
                  )}
              </div>

              {/* Due at accommodation */}
              {rate?.due_at_accommodation_amount &&
                parseFloat(rate.due_at_accommodation_amount) > 0 && (
                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-600 font-medium">Due at Accommodation</span>
                        <p className="text-xs text-gray-500">Pay directly to hotel</p>
                      </div>
                      <span className="text-[#5A53A7] font-medium">
                        {formatPriceForDisplay(
                          parseFloat(rate.due_at_accommodation_amount),
                          rate.due_at_accommodation_currency
                        )}
                      </span>
                    </div>
                  </div>
                )}

              <div className="border-t border-gray-200 pt-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold text-lg">
                    Grand Total
                  </span>
                  <span className="text-[#5A53A7] font-bold text-lg">
                    {formatPriceForDisplay(
                      parseFloat(price) +
                        (parseFloat(quoteData.tax_amount) || 0) +
                        (parseFloat(quoteData.fee_amount) || 0),
                      currency
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Includes all taxes and service fees
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
                          {formatPriceForDisplay(
                            parseFloat(rate.due_at_accommodation_amount),
                            rate.due_at_accommodation_currency
                          )}
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FiShield className="mr-2" />
                  Cancellation Policy
                </h4>
                <div className="text-sm text-gray-600">
                  <p>{getCancellationPolicy()}</p>
                  <div className={`mt-2 px-2 py-1 rounded text-xs font-medium inline-block ${refundability.isRefundable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {refundability.text}
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                disabled={!isFormValid || paymentProcessing}
                className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium shadow-sm transition ${
                  isFormValid && !paymentProcessing
                    ? "bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment <span className="ml-2">→</span>
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                By clicking "Continue to Payment", you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}