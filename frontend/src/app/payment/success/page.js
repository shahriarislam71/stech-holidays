// app/payment/success/page.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FiCheckCircle, 
  FiCalendar, 
  FiMapPin, 
  FiUsers, 
  FiHome, 
  FiDollarSign,
  FiClock,
  FiShield,
  FiFileText,
  FiPhone,
  FiMail,
  FiNavigation,
  FiCreditCard,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { FaPlane, FaHotel, FaCar } from 'react-icons/fa';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('');
  const [error, setError] = useState(null);
  
  const tranId = searchParams.get('tran_id');
  const orderId = searchParams.get('order_id');
  const bookingId = searchParams.get('booking_id');
  const bookingReference = searchParams.get('booking_reference');
  const confirmationNumber = searchParams.get('confirmation_number');
  const bookingTypeParam = searchParams.get('booking_type');

  useEffect(() => {
    setBookingType(bookingTypeParam || 'unknown');
    
    if (tranId && bookingTypeParam === 'hotel') {
      fetchHotelBookingByTranId();
    } else if (tranId && bookingTypeParam === 'flight') {
      fetchFlightBookingByTranId();
    } else if (orderId) {
      fetchFlightBookingByOrderId();
    } else if (bookingReference) {
      fetchHotelBookingByReference();
    } else {
      setError('Missing booking parameters');
      setLoading(false);
    }
  }, [tranId, orderId, bookingReference, bookingTypeParam]);

  const fetchHotelBookingByTranId = async () => {
    try {
      // Call payment success endpoint which will handle the Duffel booking and return redirect
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/payments/success/?tran_id=${tranId}`,
        { 
          redirect: 'manual', // Don't follow redirect
          credentials: 'include'
        }
      );
      
      // The endpoint should redirect with booking reference in query params
      if (response.status === 302 || response.status === 0) {
        // Extract booking reference from redirect URL
        const redirectUrl = response.headers.get('Location');
        if (redirectUrl) {
          const url = new URL(redirectUrl);
          const bookingRef = url.searchParams.get('booking_reference');
          if (bookingRef) {
            // Now fetch booking details with the reference
            await fetchHotelBookingByReference(bookingRef);
            return;
          }
        }
      }
      
      setError('Failed to process hotel booking');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
      setError('Network error fetching booking');
      setLoading(false);
    }
  };

  const fetchFlightBookingByTranId = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/payments/success/?tran_id=${tranId}`,
        { 
          redirect: 'manual',
          credentials: 'include'
        }
      );
      
      if (response.status === 302 || response.status === 0) {
        const redirectUrl = response.headers.get('Location');
        if (redirectUrl) {
          const url = new URL(redirectUrl);
          const orderId = url.searchParams.get('order_id');
          if (orderId) {
            await fetchFlightBookingByOrderId(orderId);
            return;
          }
        }
      }
      
      setError('Failed to process flight booking');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flight booking:', error);
      setError('Network error fetching booking');
      setLoading(false);
    }
  };

  const fetchHotelBookingByReference = async (reference = bookingReference) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/bookings/details/${reference}/`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
        setBookingType('hotel');
      } else {
        setError('Hotel booking not found');
      }
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
      setError('Network error fetching booking');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlightBookingByOrderId = async (id = orderId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/my-flights/${id}/`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
        setBookingType('flight');
      } else {
        setError('Flight booking not found');
      }
    } catch (error) {
      console.error('Error fetching flight booking:', error);
      setError('Network error fetching booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'Unable to load booking details'}
            </p>
            <Link
              href="/"
              className="inline-block bg-[#5A53A7] text-white px-6 py-3 rounded-lg hover:bg-[#4a4490] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const booking = bookingData?.booking || bookingData;

  // Helper function to safely parse dates
  const safeDateFormat = (dateStr, formatStr = 'EEE, MMM dd, yyyy') => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), formatStr);
    } catch {
      return dateStr;
    }
  };

  const BusinessInfoSection = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
        <FiNavigation className="mr-2" />
        Our Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-blue-800">{booking.business_name || 'Stech Holidays'}</p>
          <p className="text-blue-700 text-sm mt-1">
            {booking.business_address || '2nd floor, House-31 Road No. 17, Dhaka 1213'}
          </p>
        </div>
        <div>
          <p className="text-blue-600 text-sm flex items-center mb-1">
            <FiPhone className="mr-2" size={14} />
            {booking.customer_service_phone || '01811-271271'}
          </p>
          <p className="text-blue-600 text-sm flex items-center">
            <FiMail className="mr-2" size={14} />
            {booking.customer_service_email || 'info@stechholidays.com'}
          </p>
        </div>
      </div>
    </div>
  );

  const PriceBreakdownSection = () => {
    const totalAmountPaid = parseFloat(booking.total_amount_paid || 0);
    const taxAmount = parseFloat(booking.tax_amount || 0);
    const feeAmount = parseFloat(booking.fee_amount || 0);
    const dueAtAccommodation = parseFloat(booking.due_at_accommodation_amount || 0);
    const roomRate = parseFloat(booking.room_rate || totalAmountPaid - taxAmount - feeAmount);
    const currency = booking.currency || 'USD';
    const nights = booking.nights || 1;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FiCreditCard className="mr-2" />
          Price Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Room Rate ({nights} night{nights > 1 ? 's' : ''})</span>
            <span>{currency} {roomRate.toFixed(2)}</span>
          </div>
          {taxAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Taxes & VAT</span>
              <span>{currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {feeAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Service Fees</span>
              <span>{currency} {feeAmount.toFixed(2)}</span>
            </div>
          )}
          {dueAtAccommodation > 0 && (
            <div className="flex justify-between text-blue-700 border-t border-gray-300 pt-3">
              <div>
                <span className="font-medium">Due at Accommodation</span>
                <p className="text-xs text-gray-500">Pay directly to hotel</p>
              </div>
              <span className="font-medium">
                {currency} {dueAtAccommodation.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-3">
            <span>Total Paid</span>
            <span className="text-[#5A53A7]">
              {currency} {totalAmountPaid.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const PolicySection = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <FiShield className="mr-2" />
        Policies & Conditions
      </h3>
      
      <div className="space-y-4">
        <div className={`p-3 rounded-lg ${booking.refundability ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center mb-2">
            {booking.refundability ? (
              <FiCheck className="text-green-600 mr-2" />
            ) : (
              <FiX className="text-red-600 mr-2" />
            )}
            <span className={`font-medium ${booking.refundability ? 'text-green-800' : 'text-red-800'}`}>
              {booking.refundability ? 'Refundable' : 'Non-refundable'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{booking.cancellation_policy || 'Please check hotel policy for cancellation details'}</p>
        </div>
        
        {booking.rate_conditions && booking.rate_conditions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Rate Conditions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {Array.isArray(booking.rate_conditions) ? (
                booking.rate_conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))
              ) : (
                <li>Standard conditions apply</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Terms & Conditions</h4>
          <p className="text-sm text-gray-600 mb-2">
            By completing this booking, you agree to our{' '}
            <a href={booking.terms_url || 'https://stechholidays.com/terms'} className="text-[#5A53A7] underline" target="_blank" rel="noopener noreferrer">
              Terms and Conditions
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your {bookingType === 'hotel' ? 'hotel stay' : 'flight'} has been successfully booked
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center mb-2">
                {bookingType === 'hotel' ? (
                  <FaHotel className="text-[#5A53A7] mr-2" />
                ) : (
                  <FaPlane className="text-[#5A53A7] mr-2" />
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {bookingType === 'hotel' ? 'Hotel Booking' : 'Flight Booking'} Details
                </h2>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiCalendar className="mr-1" />
                  <span>Booked on: {safeDateFormat(booking.booking_confirmed_date || booking.created_at, 'MMM dd, yyyy hh:mm a')}</span>
                </div>
                <div className="flex items-center">
                  <FiFileText className="mr-1" />
                  <span>Ref: {booking.booking_reference || bookingReference}</span>
                </div>
                {booking.confirmation_number && (
                  <div className="flex items-center">
                    <FiCheck className="mr-1" />
                    <span>Conf: {booking.confirmation_number}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {booking.status === 'confirmed' ? 'Confirmed' : booking.status || 'Confirmed'}
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {bookingType === 'hotel' ? (
                <>
                  {/* Hotel Information */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-[#445494] mb-4 flex items-center">
                      <FaHotel className="mr-2" />
                      Accommodation Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {booking.hotel_name || 'Hotel Name'}
                        </h4>
                        <div className="flex items-center text-gray-600">
                          <FiMapPin className="mr-2" />
                          <span>{booking.hotel_address || 'Address not available'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                          <div className="flex items-center mb-3">
                            <FiCalendar className="text-[#5A53A7] mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">Check-in</p>
                              <p className="text-gray-600">
                                {safeDateFormat(booking.check_in_date)}
                              </p>
                              <p className="text-sm text-gray-500">After {booking.check_in_time || '2:00 PM'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <FiClock className="text-[#5A53A7] mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">Check-out</p>
                              <p className="text-gray-600">
                                {safeDateFormat(booking.check_out_date)}
                              </p>
                              <p className="text-sm text-gray-500">Before {booking.check_out_time || '12:00 PM'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-3">
                            <FiUsers className="text-[#5A53A7] mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">Guests</p>
                              <p className="text-gray-600">
                                {booking.adults || 1} Adult{booking.adults > 1 ? 's' : ''}
                                {booking.children > 0 ? `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <FiHome className="text-[#5A53A7] mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">Rooms</p>
                              <p className="text-gray-600">{booking.rooms || 1} Room{booking.rooms > 1 ? 's' : ''}</p>
                              <p className="text-sm text-gray-500">
                                {booking.room_type || 'Standard Room'} • {booking.board_type || 'Room Only'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {booking.key_collection && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                          <h4 className="font-medium text-blue-900 mb-1">Key Collection Information</h4>
                          <p className="text-blue-700 text-sm">{booking.key_collection}</p>
                        </div>
                      )}
                      
                      {booking.special_requests && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                          <h4 className="font-medium text-yellow-900 mb-1">Special Requests</h4>
                          <p className="text-yellow-700 text-sm">{booking.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Guest Information */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-[#445494] mb-4">
                      Guest Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-semibold">{booking.guest_name || 'Guest User'}</p>
                          <p className="text-sm text-gray-600">{booking.guest_email || 'guest@example.com'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{booking.guest_phone || 'N/A'}</p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Primary Guest
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Flight Information */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-[#445494] mb-4 flex items-center">
                      <FaPlane className="mr-2" />
                      Flight Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {booking.airline || 'Airline'}
                        </h4>
                        <p className="text-gray-600">Flight: {booking.flight_number || 'N/A'}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                          <div className="flex items-center mb-3">
                            <FiMapPin className="text-[#5A53A7] mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">Departure</p>
                              <p className="text-gray-600">
                                {booking.departure?.airport || booking.departure || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.departure_city || 'N/A'} • {booking.departure?.code || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {safeDateFormat(booking.departure_time, 'MMM dd, yyyy hh:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-3">
                            <FiMapPin className="text-[#5A53A7] mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">Arrival</p>
                              <p className="text-gray-600">
                                {booking.arrival?.airport || booking.arrival || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.arrival_city || 'N/A'} • {booking.arrival?.code || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {safeDateFormat(booking.arrival_time, 'MMM dd, yyyy hh:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">Duration</p>
                          <p className="text-gray-600">{booking.duration || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Cabin Class</p>
                          <p className="text-gray-600">{booking.cabin_class || 'Economy'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Passengers</p>
                          <p className="text-gray-600">{booking.number_of_passengers || booking.passengers?.length || 1}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Trip Type</p>
                          <p className="text-gray-600">{booking.trip_type || 'One Way'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passenger Information */}
                  {booking.passengers && booking.passengers.length > 0 && (
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-[#445494] mb-4">
                        Passenger Information
                      </h3>
                      <div className="space-y-3">
                        {booking.passengers.map((passenger, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <p className="font-semibold">
                                {passenger.given_name || ''} {passenger.family_name || ''}
                              </p>
                              <p className="text-sm text-gray-600">{passenger.email || ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Type: {passenger.type || 'adult'}</p>
                              {index === 0 && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Policies Section */}
              <PolicySection />
              
              {/* Business Information */}
              <BusinessInfoSection />
            </div>
            
            {/* Right Column - Price & Actions */}
            <div className="space-y-6">
              {/* Price Breakdown */}
              <PriceBreakdownSection />
              
              {/* Download & Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      // Generate PDF download
                      const link = document.createElement('a');
                      link.href = bookingType === 'hotel' 
                        ? `${process.env.NEXT_PUBLIC_API_URL}/hotels/voucher/${booking.booking_id || bookingReference}/pdf/`
                        : `${process.env.NEXT_PUBLIC_API_URL}/flights/itinerary/${orderId}/pdf/`;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      link.click();
                    }}
                    className="w-full bg-[#5A53A7] text-white py-3 px-4 rounded-lg hover:bg-[#4a4490] transition-colors font-medium"
                  >
                    Download Booking Confirmation
                  </button>
                  <button 
                    onClick={() => {
                      // Add to calendar functionality
                      if (bookingType === 'hotel' && booking.check_in_date) {
                        const startDate = new Date(booking.check_in_date);
                        const endDate = new Date(booking.check_out_date || booking.check_in_date);
                        
                        const calendarEvent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Hotel Booking - ${booking.hotel_name}
DTSTART:${startDate.toISOString().replace(/-|:|\.\d+/g, '')}
DTEND:${endDate.toISOString().replace(/-|:|\.\d+/g, '')}
DESCRIPTION:${booking.hotel_address}\\nConfirmation: ${booking.booking_reference}
LOCATION:${booking.hotel_address}
END:VEVENT
END:VCALENDAR`;
                        
                        const blob = new Blob([calendarEvent], { type: 'text/calendar' });
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = `booking-${booking.booking_reference}.ics`;
                        link.click();
                      }
                    }}
                    className="w-full border border-[#5A53A7] text-[#5A53A7] py-3 px-4 rounded-lg hover:bg-[#5A53A7] hover:text-white transition-colors font-medium"
                  >
                    Add to Calendar
                  </button>
                  <Link 
                    href="/profile/my-bookings"
                    className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    View All Bookings
                  </Link>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this booking?')) {
                        // Implement cancellation logic
                        fetch(
                          bookingType === 'hotel'
                            ? `${process.env.NEXT_PUBLIC_API_URL}/hotels/bookings/${booking.booking_id || bookingReference}/cancel/`
                            : `${process.env.NEXT_PUBLIC_API_URL}/flights/orders/${orderId}/cancel/`,
                          { method: 'POST' }
                        ).then(response => {
                          if (response.ok) {
                            alert('Booking cancelled successfully');
                            router.push('/profile/my-bookings');
                          } else {
                            alert('Failed to cancel booking');
                          }
                        });
                      }
                    }}
                    className="w-full border border-red-300 text-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
              
              {/* Important Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-900 mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start">
                    <FiCheck className="mr-2 mt-1 flex-shrink-0" />
                    <span>Please present this confirmation and a valid ID at check-in</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="mr-2 mt-1 flex-shrink-0" />
                    <span>Check-in time is after {booking.check_in_time || '2:00 PM'}</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="mr-2 mt-1 flex-shrink-0" />
                    <span>Check-out time is before {booking.check_out_time || '12:00 PM'}</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="mr-2 mt-1 flex-shrink-0" />
                    <span>For modifications or cancellations, contact our customer service</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>A confirmation email has been sent to {booking.guest_email || booking.email}</p>
          <p className="mt-1">
            Need help? Contact us at {booking.customer_service_phone || '01811-271271'} or {booking.customer_service_email || 'info@stechholidays.com'}
          </p>
        </div>
      </div>
    </div>
  );
}