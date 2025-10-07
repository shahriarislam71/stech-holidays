'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheck, FiDownload, FiMail, FiCalendar, FiMapPin, FiUser } from 'react-icons/fi';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);

  const tran_id = searchParams.get('tran_id');
  const order_id = searchParams.get('order_id');
  const booking_type = searchParams.get('booking_type'); // 'flight', 'hotel', 'holiday', 'visa', 'umrah'

  useEffect(() => {
    // Simulate loading booking details
    const timer = setTimeout(() => {
      setBookingDetails({
        tran_id,
        order_id,
        booking_type,
        status: 'confirmed'
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [tran_id, order_id, booking_type]);

  const handleViewBookings = () => {
    // Redirect to profile/my-bookings with the specific tab based on booking type
    const tab = booking_type || 'flight'; // Default to flight if not specified
    router.push(`/profile/my-bookings?tab=${tab}&booking_id=${order_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7f7ff] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5A53A7] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Processing your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white py-12 px-4 md:px-[190px]">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <FiCheck className="text-green-600 text-5xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your {booking_type || 'flight'} booking has been confirmed
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Confirmation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-blue-50 p-2 rounded-lg mr-3">
                  <FiCalendar className="text-[#5A53A7] text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{tran_id}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-50 p-2 rounded-lg mr-3">
                  <FiCheck className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Booking Status</p>
                  <p className="font-semibold text-green-600">Confirmed</p>
                </div>
              </div>
              {order_id && (
                <div className="flex items-start">
                  <div className="bg-green-50 p-2 rounded-lg mr-3">
                    <FiUser className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Booking ID</p>
                    <p className="font-semibold text-gray-900">{order_id}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <div className="bg-orange-50 p-2 rounded-lg mr-3">
                  <FiMapPin className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Booking Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{booking_type || 'flight'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <FiMail className="text-green-600 text-xl mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Confirmation Email Sent
                </h3>
                <p className="text-sm text-green-800">
                  We've sent your booking confirmation and receipt to your email address. 
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-[#5A53A7] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check your email</p>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with all booking details and voucher
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#5A53A7] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">View your booking</p>
                  <p className="text-sm text-gray-600">
                    Access your booking details and download tickets from your account
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#5A53A7] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Prepare for your trip</p>
                  <p className="text-sm text-gray-600">
                    Review your itinerary and important travel information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleViewBookings}
            className="flex-1 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:opacity-90 transition text-center"
          >
            View My Bookings
          </button>
          <Link
            href="/"
            className="flex-1 bg-white text-[#5A53A7] px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition border-2 border-[#5A53A7] text-center"
          >
            Back to Home
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-2">
            Need help with your booking?
          </p>
          <Link
            href="/support"
            className="text-[#5A53A7] font-medium hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}