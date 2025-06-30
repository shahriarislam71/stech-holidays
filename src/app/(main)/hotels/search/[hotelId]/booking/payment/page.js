// app/hotels/search/[hotelId]/booking/payment/page.js
'use client';

import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PaymentPage({ params }) {
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

  const [couponCode, setCouponCode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    // Handle coupon submission
  };

  return (
    <div className="px-4 md:px-[190px] py-8 bg-gradient-to-b from-[#f7f7ff] to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link 
          href={`/hotels/search/${hotelId}/booking`}
          className="flex items-center text-[#5A53A7] mb-6 hover:underline font-medium"
        >
          <FiArrowLeft className="mr-2" size={18} />
          Back to guest details
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
          <div className="h-1 flex-1 bg-[#5A53A7] mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#5A53A7] text-white flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-sm text-[#5A53A7] font-medium">Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Payment methods */}
          <div className="lg:w-2/3">
            {/* Coupon section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon, Offers and Discounts</h2>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-3">Already have a coupon code?</p>
                <form onSubmit={handleCouponSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter a Coupon Code"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/50 transition"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a438f] transition"
                  >
                    Apply Coupon
                  </button>
                </form>
              </div>
            </div>

            {/* Payment methods */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {['VISA', 'Mastercard', 'American Express', 'PayPal', 'Google Pay', 'Apple Pay', 'Bank Transfer', 'Cash on Arrival'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition ${
                      selectedPayment === method
                        ? 'border-[#5A53A7] bg-[#5A53A7]/10'
                        : 'border-gray-200 hover:border-[#5A53A7]/50'
                    }`}
                  >
                    <div className="w-12 h-8 mb-2 bg-gray-100 rounded flex items-center justify-center">
                      {method === 'VISA' && <span className="text-blue-600 font-bold">VISA</span>}
                      {method === 'Mastercard' && <span className="text-red-500 font-bold">MC</span>}
                      {method === 'American Express' && <span className="text-blue-800 font-bold">AMEX</span>}
                      {method === 'PayPal' && <span className="text-blue-500 font-bold">PP</span>}
                      {method === 'Google Pay' && <span className="text-green-500 font-bold">G</span>}
                      {method === 'Apple Pay' && <span className="text-black font-bold">A</span>}
                      {method === 'Bank Transfer' && <span className="text-green-600 font-bold">BT</span>}
                      {method === 'Cash on Arrival' && <span className="text-gray-600 font-bold">$</span>}
                    </div>
                    <span className="text-sm font-medium">{method}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Booking summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel Agrabad</h2>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Check In</p>
                  <p className="font-medium">{checkIn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check Out</p>
                  <p className="font-medium">{checkOut}</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">You selected</p>
                  <p className="font-medium">1 room, {adults} guest, {nights} night</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
                
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
                    <span className="text-gray-600">Taxes & Fees (1 Room)</span>
                    <span className="font-medium">BDT 3,467</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Sub Total</span>
                    <span className="font-medium">BDT 16,800</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-bold text-lg">Grand Total</span>
                    <span className="text-[#5A53A7] font-bold text-lg">BDT 16,800</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="mt-1 mr-2 rounded text-[#5A53A7] focus:ring-[#5A53A7]" 
                      required 
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>

                <button
                  disabled={!selectedPayment}
                  className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium shadow-sm transition ${
                    selectedPayment
                      ? 'bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to payment <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}