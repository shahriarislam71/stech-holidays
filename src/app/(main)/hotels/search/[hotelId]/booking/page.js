// app/hotels/search/[hotelId]/booking/page.js
'use client';

import { FiArrowLeft, FiCheck, FiMapPin, FiStar, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function BookingConfirmationPage({ params }) {
  const searchParams = useSearchParams();
  const hotelId = params.hotelId;
  
  // Get booking details from URL params
  const roomType = searchParams.get('roomType') || 'Junior Suite';
  const checkIn = searchParams.get('checkIn') || 'Sun, Jun 29, 2025';
  const checkOut = searchParams.get('checkOut') || 'Mon, Jun 30, 2025';
  const nights = searchParams.get('nights') || '1';
  const adults = searchParams.get('adults') || '1';
  const children = searchParams.get('children') || '0';
  const price = searchParams.get('price') || '16139';
  const taxes = searchParams.get('taxes') || '3467';
  const total = searchParams.get('total') || '16800';

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mock hotel data
  const hotel = {
    name: "Hotel Agrabad",
    rating: "4.5",
    location: "Chattogram, Bangladesh",
    image: "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    amenities: ["Swimming Pool", "Free WiFi", "Restaurant", "Spa"],
    roomDetails: {
      type: "Junior Suite",
      bedType: "King",
      capacity: "3",
      size: "450 sq.ft",
      smoking: "Non-Smoking",
      breakfast: "Included",
      refundable: true
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone;

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
            <span className="text-sm text-[#5A53A7] font-medium">Your Stay</span>
          </div>
          <div className="h-1 flex-1 bg-[#5A53A7] mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#5A53A7] text-white flex items-center justify-center mb-1">
              2
            </div>
            <span className="text-sm text-[#5A53A7] font-medium">Your Details</span>
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
                    <img 
                      src={hotel.image} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full mr-3">
                          <span className="text-blue-800 font-medium text-sm mr-1">{hotel.rating}</span>
                          <FiStar className="text-yellow-500 fill-yellow-500 text-sm" />
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <FiMapPin className="mr-1 text-[#5A53A7]" size={14} />
                          <span>{hotel.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking dates */}
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Check-In</p>
                      <p className="font-medium">{checkIn}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">Nights</p>
                      <p className="font-medium">{nights}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-medium">Check-Out</p>
                      <p className="font-medium">{checkOut}</p>
                    </div>
                  </div>

                  {/* Room details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.roomDetails.type}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full flex items-center">
                        <FiCheck className="mr-1" size={12} />
                        {hotel.roomDetails.breakfast}
                      </span>
                      {hotel.roomDetails.refundable && (
                        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full flex items-center">
                          <FiCheck className="mr-1" size={12} />
                          Refundable
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Bed:</span>
                        <span>{hotel.roomDetails.bedType}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Capacity:</span>
                        <span>{hotel.roomDetails.capacity}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Size:</span>
                        <span>{hotel.roomDetails.size}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Smoking:</span>
                        <span>{hotel.roomDetails.smoking}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest information form */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Guest Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Price Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rack Rate (1 Room)</span>
                  <span className="font-medium">BDT 27,473</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-gray-600">Hotel Offer 51%</span>
                  <span className="font-medium">-BDT 13,334</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">BDT {taxes}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Sub Total</span>
                  <span className="font-medium">BDT {price}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold text-lg">Grand Total</span>
                  <span className="text-[#5A53A7] font-bold text-lg">BDT {total}</span>
                </div>
              </div>

              <Link 
                href={{
                  pathname: `/hotels/search/${hotelId}/booking/payment`,
                  query: {
                    ...Object.fromEntries(searchParams),
                    ...formData
                  }
                }}
                className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium shadow-sm transition ${
                  isFormValid 
                    ? 'bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white hover:opacity-90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Payment <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}