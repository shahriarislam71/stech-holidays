"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MyBookings() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('current');
  const [activeCategory, setActiveCategory] = useState('flight');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample booking data
  const bookings = {
    flight: [
      { 
        id: 1, 
        bookingNumber: 'FL123456', 
        date: '2023-11-15', 
        destination: 'New York', 
        departure: 'London', 
        airline: 'British Airways',
        flightNumber: 'BA123',
        departureTime: '09:30 AM',
        arrivalTime: '02:45 PM',
        status: 'Confirmed',
        price: '$1,250',
        passenger: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      },
    ],
    hotel: [
      { 
        id: 1, 
        bookingNumber: 'HT789012', 
        date: '2023-11-15', 
        checkIn: '2023-11-15',
        checkOut: '2023-11-20',
        hotel: 'Grand Hyatt', 
        location: 'New York',
        roomType: 'Deluxe King',
        guests: 2,
        status: 'Confirmed',
        price: '$1,800',
        passenger: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      },
    ],
    holidays: [],
    visa: [
      {
        id: 1,
        bookingNumber: 'VS456789',
        date: '2023-10-10',
        type: 'Tourist Visa',
        country: 'United States',
        status: 'Approved',
        expiry: '2024-10-10',
        passenger: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      }
    ]
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDownload = (bookingId) => {
    // Create a PDF or document for download
    const content = `Booking Details\n\n` +
      `Booking Number: ${bookings[activeCategory].find(b => b.id === bookingId).bookingNumber}\n` +
      `Passenger: ${bookings[activeCategory].find(b => b.id === bookingId).passenger}\n` +
      `Date: ${bookings[activeCategory].find(b => b.id === bookingId).date}\n` +
      `Price: ${bookings[activeCategory].find(b => b.id === bookingId).price}\n` +
      `Status: ${bookings[activeCategory].find(b => b.id === bookingId).status}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-${bookingId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="mb-40 bg-gray-50">
      {/* Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#445494]">Booking Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img 
                      src={selectedBooking.image} 
                      alt={selectedBooking.destination || selectedBooking.hotel || selectedBooking.country}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">
                        {activeCategory === 'flight' && `${selectedBooking.departure} to ${selectedBooking.destination}`}
                        {activeCategory === 'hotel' && selectedBooking.hotel}
                        {activeCategory === 'visa' && `${selectedBooking.type} - ${selectedBooking.country}`}
                      </h3>
                      <p className="text-sm opacity-90">
                        {activeCategory === 'flight' && `${selectedBooking.airline} ${selectedBooking.flightNumber}`}
                        {activeCategory === 'hotel' && selectedBooking.location}
                        {activeCategory === 'visa' && selectedBooking.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#445494] mb-4">Booking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Booking Number</p>
                      <p className="text-gray-900">{selectedBooking.bookingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-gray-900">{selectedBooking.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedBooking.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Price</p>
                      <p className="text-gray-900 font-semibold">{selectedBooking.price}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#445494] mb-4">Passenger Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Passenger Name</p>
                      <p className="text-gray-900">{selectedBooking.passenger}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedBooking.email}</p>
                    </div>
                  </div>

                  {activeCategory === 'flight' && (
                    <>
                      <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Flight Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Airline</p>
                          <p className="text-gray-900">{selectedBooking.airline}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Flight Number</p>
                          <p className="text-gray-900">{selectedBooking.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Departure</p>
                          <p className="text-gray-900">{selectedBooking.departureTime}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Arrival</p>
                          <p className="text-gray-900">{selectedBooking.arrivalTime}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'hotel' && (
                    <>
                      <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Hotel Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-gray-900">{selectedBooking.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Room Type</p>
                          <p className="text-gray-900">{selectedBooking.roomType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-in</p>
                          <p className="text-gray-900">{selectedBooking.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-out</p>
                          <p className="text-gray-900">{selectedBooking.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Guests</p>
                          <p className="text-gray-900">{selectedBooking.guests}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'visa' && (
                    <>
                      <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Visa Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Visa Type</p>
                          <p className="text-gray-900">{selectedBooking.type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Country</p>
                          <p className="text-gray-900">{selectedBooking.country}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                          <p className="text-gray-900">{selectedBooking.expiry}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  onClick={() => handleDownload(selectedBooking.id)}
                  className="px-4 py-2 bg-[#55C3A9] text-white rounded-md hover:bg-[#54ACA4] transition-colors"
                >
                  Download Booking
                </button>
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex mx-[190px]">
        {/* Sidebar */}
        <div className="w-72 mt-8 mr-6 bg-white shadow-sm rounded-xl border border-gray-200">
          <nav className="p-4">
            <Link
              href="/profile"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </Link>
            <Link
              href="/profile/travellers"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/travellers' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Travellers
            </Link>
            <Link
              href="/profile/my-bookings"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/my-bookings' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              My Bookings
            </Link>
            <Link
              href="/profile/loyalty"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/loyalty' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              Loyalty Club
            </Link>
            <Link
              href="/profile/change-password"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/change-password' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Change Password
            </Link>
            <Link
              href="/profile/support"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/support' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Support
            </Link>
            <button
              className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 mt-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Current Bookings
                </button>
                <button
                  onClick={() => setActiveTab('previous')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'previous' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Previous Bookings
                </button>
              </nav>
            </div>

            {/* Category Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveCategory('flight')}
                  className={`flex-1 py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'flight' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Flight
                </button>
                <button
                  onClick={() => setActiveCategory('hotel')}
                  className={`flex-1 py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'hotel' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Hotel
                </button>
                <button
                  onClick={() => setActiveCategory('holidays')}
                  className={`flex-1 py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'holidays' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Holidays
                </button>
                <button
                  onClick={() => setActiveCategory('visa')}
                  className={`flex-1 py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'visa' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Visa
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'current' ? (
                bookings[activeCategory]?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {bookings[activeCategory].map(booking => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="p-5">
                          <div className="flex items-start">
                            {/* Image */}
                            <div className="w-30 h-42 flex-shrink-0 mr-4 rounded-lg overflow-hidden">
                              <img 
                                src={booking.image} 
                                alt={booking.destination || booking.hotel || booking.country}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-bold text-[#445494]">
                                    {activeCategory === 'flight' && `${booking.departure} to ${booking.destination}`}
                                    {activeCategory === 'hotel' && booking.hotel}
                                    {activeCategory === 'visa' && `${booking.type} - ${booking.country}`}
                                  </h3>
                                  <p className="text-gray-600 text-sm mt-1">
                                    <span className="font-medium">Booking #:</span> {booking.bookingNumber}
                                    <span className="mx-2">•</span>
                                    <span className="font-medium">Date:</span> {booking.date}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-[#5A53A7]">{booking.price}</p>
                                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    booking.status === 'Confirmed' || booking.status === 'Approved'
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Passenger</h4>
                                  <p className="mt-1 text-gray-900">{booking.passenger}</p>
                                </div>
                                {activeCategory === 'flight' && (
                                  <>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flight</h4>
                                      <p className="mt-1 text-gray-900">{booking.airline} {booking.flightNumber}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure</h4>
                                      <p className="mt-1 text-gray-900">{booking.departureTime}</p>
                                    </div>
                                  </>
                                )}
                                {activeCategory === 'hotel' && (
                                  <>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h4>
                                      <p className="mt-1 text-gray-900">{booking.location}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Type</h4>
                                      <p className="mt-1 text-gray-900">{booking.roomType}</p>
                                    </div>
                                  </>
                                )}
                                {activeCategory === 'visa' && (
                                  <>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</h4>
                                      <p className="mt-1 text-gray-900">{booking.type}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</h4>
                                      <p className="mt-1 text-gray-900">{booking.expiry}</p>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="mt-4 flex justify-end space-x-3">
                                <button 
                                  onClick={() => handleViewDetails(booking)}
                                  className="px-4 py-2 border border-[#5A53A7] text-[#5A53A7] rounded-lg hover:bg-[#5A53A7] hover:text-white transition-colors"
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={() => handleDownload(booking.id)}
                                  className="px-4 py-2 bg-[#55C3A9] text-white rounded-lg hover:bg-[#54ACA4] transition-colors"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No {activeCategory} bookings found</h3>
                    <p className="mt-2 text-sm text-gray-500">You don't have any current {activeCategory} bookings.</p>
                    <div className="mt-6">
                      <Link 
                        href={`/#${activeCategory === 'holidays' ? 'holidays' : activeCategory}`} 
                        className="px-4 py-2 bg-[#5A53A7] text-white rounded-md hover:bg-[#445494] transition-colors inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Book {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-lg font-medium text-[#445494]">Journey Date</h4>
                    <p className="text-gray-500 mt-2">Your previous bookings will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}