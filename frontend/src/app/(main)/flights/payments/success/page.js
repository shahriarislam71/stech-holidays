// app/flights/payment/success/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfirmation = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/payment/success/?order_id=${orderId}`);
        const data = await response.json();
        
        if (response.ok) {
          setConfirmation(data);
        } else {
          throw new Error(data.error || 'Failed to load confirmation');
        }
      } catch (error) {
        console.error('Error fetching confirmation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchConfirmation();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmation Not Found</h2>
          <Link href="/profile/my-bookings" className="text-[#5A53A7] hover:underline">
            View your bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f0f4f8]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your flight has been successfully booked</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-[#445494] mb-4">Booking Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking Reference</p>
                  <p className="font-semibold">{confirmation.order.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold">{confirmation.order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-semibold text-[#5A53A7]">
                    {confirmation.order.total_currency} {confirmation.order.total_amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="font-semibold">
                    {new Date(confirmation.order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-[#445494] mb-4">Flight Details</h2>
              {confirmation.flights.map((flight, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{flight.airline} {flight.flight_number}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{flight.departure.time ? new Date(flight.departure.time).toLocaleTimeString() : 'N/A'}</p>
                      <p className="text-sm text-gray-600">{flight.departure.airport} ({flight.departure.iata_code})</p>
                    </div>
                    <div className="mx-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{flight.arrival.time ? new Date(flight.arrival.time).toLocaleTimeString() : 'N/A'}</p>
                      <p className="text-sm text-gray-600">{flight.arrival.airport} ({flight.arrival.iata_code})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Passenger Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-[#445494] mb-4">Passenger Details</h2>
              <div className="space-y-4">
                {confirmation.passengers.map((passenger, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-semibold">{passenger.title} {passenger.given_name} {passenger.family_name}</p>
                      <p className="text-sm text-gray-600">{passenger.email}</p>
                    </div>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-[#445494] mb-4">Next Steps</h3>
              <div className="space-y-3">
                <button className="w-full bg-[#5A53A7] text-white py-2 px-4 rounded-lg hover:bg-[#4a4490] transition-colors">
                  Download E-Ticket
                </button>
                <button className="w-full border border-[#5A53A7] text-[#5A53A7] py-2 px-4 rounded-lg hover:bg-[#5A53A7] hover:text-white transition-colors">
                  Add to Calendar
                </button>
                <Link 
                  href="/profile/my-bookings"
                  className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View All Bookings
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Contact our support team for any questions about your booking.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-blue-600">📞 +1 (555) 123-4567</p>
                <p className="text-blue-600">✉️ support@travelapp.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;