'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import useAuth from '@/app/hooks/useAuth';

export default function MyBookings() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth({ redirectToLogin: false });
  const [activeTab, setActiveTab] = useState('current');
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('tab') || 'holidays'
  );
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState({
    flight: [],
    hotel: [],
    holidays: [],
    visa: [],
    umrah: [] ,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const token = localStorage.getItem('authToken');
        let endpoint = '';
        
        if (activeCategory === 'holidays') {
          endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/holiday-bookings/${bookingId}/cancel/`;
        } else if (activeCategory === 'umrah') {
          endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/umrah-bookings/${bookingId}/cancel/`;
        } else {
          throw new Error('Cancellation not supported for this booking type');
        }

        const response = await fetch(
          endpoint,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          toast.success('Booking cancelled successfully');
          // Refresh bookings
          fetchBookings();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cancel booking');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Fetch holiday bookings
      if (activeCategory === 'holidays') {
        const holidayResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/user/holiday-bookings/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        if (holidayResponse.ok) {
          const holidayData = await holidayResponse.json();
          setBookings(prev => ({
            ...prev,
            holidays: holidayData.map(booking => ({
              ...booking,
              id: booking.id,
              bookingNumber: `HL${booking.id.toString().padStart(6, '0')}`,
              date: new Date(booking.created_at).toLocaleDateString(),
              departure_date: booking.departure_date,
              destination: booking.package?.destination || 'Unknown Destination',
              status: booking.status,
              price: `BDT ${booking.package?.price?.toLocaleString() || '0'}`,
              passenger: booking.contact_name,
              email: booking.email,
              image: booking.package?.featured_image || '/default-holiday.jpg',
              packageDetails: booking.package || {},
              travelers: booking.travelers,
              custom_request: booking.custom_request
            }))
          }));
        }
      }

      // Fetch visa applications
      if (activeCategory === 'visa') {
        const visaResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/user/visa-applications/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        if (visaResponse.ok) {
          const visaData = await visaResponse.json();
          setBookings(prev => ({
            ...prev,
            visa: visaData.map(application => ({
              ...application,
              id: application.id,
              bookingNumber: application.reference_number,
              date: new Date(application.created_at).toLocaleDateString(),
              departure_date: application.departure_date,
              country: application.country.name,
              type: application.visa_type?.type || 'Visa',
              status: application.status.charAt(0).toUpperCase() + application.status.slice(1),
              price: `BDT ${application.visa_type?.fee?.toLocaleString() || application.country.fee?.toLocaleString() || '0'}`,
              passenger: application.contact_name,
              email: application.email,
              image: application.country.cover_image || '/default-visa.jpg',
              travelers: application.travelers,
              passport_number: application.passport_number,
              passport_expiry: application.passport_expiry,
              processing_time: application.visa_type?.processing_time || application.country.processing_time,
              validity: application.visa_type?.validity || application.country.validity,
              requirements: application.country.requirements,
              documents: application.documents || [],
              payment_status: application.payment_status || 'unknown'
            }))
          }));
        }
      }

      // Fetch Umrah bookings
      if (activeCategory === 'umrah') {
        const umrahResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/user/umrah-bookings/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        if (umrahResponse.ok) {
          const umrahData = await umrahResponse.json();
          setBookings(prev => ({
            ...prev,
            umrah: umrahData.map(booking => ({
              ...booking,
              id: booking.id,
              bookingNumber: `UM${booking.id.toString().padStart(6, '0')}`,
              date: new Date(booking.created_at).toLocaleDateString(),
              departure_date: booking.departure_date,
              destination: 'Umrah Package',
              status: booking.status,
              price: `BDT ${booking.package?.price?.toLocaleString() || '0'}`,
              passenger: booking.contact_name,
              email: booking.email,
              image: booking.package?.featured_image || '/default-umrah.jpg',
              packageDetails: booking.package || {},
              travelers: booking.travelers,
              custom_request: booking.custom_request,
              nights: booking.package?.nights || 0,
              days: booking.package?.days || 0,
              includes_flight: booking.package?.includes_flight || false,
              includes_hotel: booking.package?.includes_hotel || false,
              includes_transport: booking.package?.includes_transport || false,
              includes_visa: booking.package?.includes_visa || false
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real bookings data
  useEffect(() => {
    fetchBookings();
  }, [activeCategory]);

  // Check for booking success message
  useEffect(() => {
    if (searchParams.get('booking_success')) {
      toast.success('Your booking was successful!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Clean up the URL
      window.history.replaceState({}, '', '/profile/my-bookings?tab=holidays');
    }
  }, [searchParams]);

  const handleViewDetails = (booking) => {
    if (activeCategory === 'holidays') {
      setSelectedBooking({
        ...booking,
        nights: booking.packageDetails?.nights,
        days: booking.packageDetails?.days,
        includes: booking.packageDetails?.tags?.map(tag => tag.name) || []
      });
    } else if (activeCategory === 'umrah') {
      setSelectedBooking({
        ...booking,
        includes: [
          booking.includes_flight && 'Flight',
          booking.includes_hotel && 'Hotel',
          booking.includes_transport && 'Transport',
          booking.includes_visa && 'Visa'
        ].filter(Boolean)
      });
    } else {
      setSelectedBooking(booking);
    }
    setIsModalOpen(true);
  };

  const handleDownload = (bookingId) => {
    const booking = bookings[activeCategory].find(b => b.id === bookingId);
    if (!booking) return;

    let content = `Booking Details\n\n`;
    content += `Booking Number: ${booking.bookingNumber}\n`;
    content += `Passenger: ${booking.passenger}\n`;
    content += `Date: ${booking.date}\n`;
    content += `Price: ${booking.price}\n`;
    content += `Status: ${booking.status}\n`;

    if (activeCategory === 'holidays') {
      content += `\nHoliday Details:\n`;
      content += `Destination: ${booking.destination}\n`;
      content += `Duration: ${booking.nights} Nights / ${booking.days} Days\n`;
      content += `Departure Date: ${new Date(booking.departure_date).toLocaleDateString()}\n`;
      content += `Travelers: ${booking.travelers}\n`;
      if (booking.custom_request) {
        content += `Special Requests: ${booking.custom_request}\n`;
      }
    }

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Please sign in to view your bookings</h2>
          <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4490] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[#445494]">Profile Menu</h2>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="space-y-2">
            <Link
              href="/profile"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile' ? 'bg-[#55C3A9] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </Link>
            <Link
              href="/profile/travellers"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/travellers' ? 'bg-[#55C3A9] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Travellers
            </Link>
            <Link
              href="/profile/my-bookings"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/my-bookings' ? 'bg-[#55C3A9] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              My Bookings
            </Link>
            <Link
              href="/profile/loyalty"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/profile/loyalty' ? 'bg-[#55C3A9] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              Loyalty Club
            </Link>
            {user?.is_admin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/admin/dashboard' ? 'bg-[#55C3A9] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    <Image 
                      src={selectedBooking.image} 
                      alt={selectedBooking.destination || selectedBooking.hotel || selectedBooking.country}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">
                        {activeCategory === 'holidays' && selectedBooking.destination}
                        {activeCategory === 'flight' && `${selectedBooking.departure} to ${selectedBooking.destination}`}
                        {activeCategory === 'hotel' && selectedBooking.hotel}
                        {activeCategory === 'visa' && `${selectedBooking.type} - ${selectedBooking.country}`}
                      </h3>
                      <p className="text-sm opacity-90">
                        {activeCategory === 'holidays' && 'Holiday Package'}
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

                  {activeCategory === 'holidays' && (
                    <>
                      <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Holiday Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Destination</p>
                          <p className="text-gray-900">{selectedBooking.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Duration</p>
                          <p className="text-gray-900">
                            {selectedBooking.nights} Nights / {selectedBooking.days} Days
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Departure Date</p>
                          <p className="text-gray-900">
                            {new Date(selectedBooking.departure_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Travelers</p>
                          <p className="text-gray-900">{selectedBooking.travelers}</p>
                        </div>
                        {selectedBooking.includes?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Includes</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedBooking.includes.map((item, index) => (
                                <span key={index} className="px-2 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedBooking.custom_request && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Special Requests</p>
                            <p className="text-gray-900">{selectedBooking.custom_request}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeCategory === 'umrah' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-[#445494] mb-4">Umrah Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Duration</p>
                            <p className="text-gray-900">
                              {selectedBooking.nights} Nights / {selectedBooking.days} Days
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Includes</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedBooking.includes?.map((item, index) => (
                                <span key={index} className="px-2 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
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

      <div className="px-4 md:px-[190px] py-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#445494]">My Bookings</h1>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-[#5A53A7] text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 sticky top-6">
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
                {user?.is_admin && (
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/admin/dashboard' ? 'bg-[#55C3A9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-4 text-center border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Current Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab('previous')}
                    className={`flex-1 py-4 text-center border-b-2 font-medium text-sm ${activeTab === 'previous' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Previous Bookings
                  </button>
                </nav>
              </div>

              {/* Category Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  <button
                    onClick={() => setActiveCategory('flight')}
                    className={`flex-1 min-w-[100px] py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'flight' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    <span className="hidden sm:inline">Flight</span>
                  </button>
                  <button
                    onClick={() => setActiveCategory('hotel')}
                    className={`flex-1 min-w-[100px] py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'hotel' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span className="hidden sm:inline">Hotel</span>
                  </button>
                  <button
                    onClick={() => setActiveCategory('holidays')}
                    className={`flex-1 min-w-[100px] py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'holidays' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="hidden sm:inline">Holidays</span>
                  </button>
                  <button
                    onClick={() => setActiveCategory('visa')}
                    className={`flex-1 min-w-[100px] py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'visa' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="hidden sm:inline">Visa</span>
                  </button>
                  <button
                    onClick={() => setActiveCategory('umrah')}
                    className={`flex-1 min-w-[100px] py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeCategory === 'umrah' ? 'border-[#54ACA4] text-[#54ACA4]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span className="hidden sm:inline">Umrah</span>
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7]"></div>
                  </div>
                ) : activeTab === 'current' ? (
                  bookings[activeCategory]?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {bookings[activeCategory].map(booking => (
                        <div key={booking.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start">
                              {/* Image */}
                              <div className="w-full md:w-30 h-42 md:mr-4 rounded-lg overflow-hidden mb-4 md:mb-0">
                                <Image 
                                  src={booking.image} 
                                  alt={booking.destination || booking.hotel || booking.country}
                                  width={400}
                                  height={192}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                  <div className="mb-3 md:mb-0">
                                    <h3 className="text-lg font-bold text-[#445494]">
                                      {activeCategory === 'holidays' && booking.destination}
                                      {activeCategory === 'flight' && `${booking.departure} to ${booking.destination}`}
                                      {activeCategory === 'hotel' && booking.hotel}
                                      {activeCategory === 'visa' && `${booking.type} - ${booking.country}`}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                      <span className="font-medium">Booking #:</span> {booking.bookingNumber}
                                      <span className="mx-2 hidden md:inline">•</span>
                                      <br className="md:hidden" />
                                      <span className="font-medium">Date:</span> {booking.date}
                                    </p>
                                  </div>
                                  <div className="text-left md:text-right">
                                    <p className="text-xl font-bold text-[#5A53A7]">{booking.price}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      booking.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-800'
                                        : booking.status === 'cancelled'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Passenger</h4>
                                    <p className="mt-1 text-gray-900">{booking.passenger}</p>
                                  </div>
                                  {activeCategory === 'holidays' && (
                                    <>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure</h4>
                                        <p className="mt-1 text-gray-900">
                                          {new Date(booking.departure_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Travelers</h4>
                                        <p className="mt-1 text-gray-900">{booking.travelers}</p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                  <button 
                                    onClick={() => handleViewDetails(booking)}
                                    className="px-4 py-2 border border-[#5A53A7] text-[#5A53A7] rounded-lg hover:bg-[#5A53A7] hover:text-white transition-colors text-sm"
                                  >
                                    View Details
                                  </button>
                              
                                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                    <button 
                                      onClick={() => handleCancelBooking(booking.id)}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                      Cancel Booking
                                    </button>
                                  )}
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
                      <p className="mt-2 text-sm text-gray-500">You don&apos;t have any current {activeCategory} bookings.</p>
                      <div className="mt-6">
                        <Link 
                          href={`/${activeCategory === 'holidays' ? 'holidays' : activeCategory === 'umrah' ? 'umrah' : activeCategory}`} 
                          className="px-4 py-2 bg-[#5A53A7] text-white rounded-md hover:bg-[#445494] transition-colors inline-flex items-center text-sm"
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
                      <h4 className="text-lg font-medium text-[#445494]">Previous Bookings</h4>
                      <p className="text-gray-500 mt-2">Your previous bookings will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}