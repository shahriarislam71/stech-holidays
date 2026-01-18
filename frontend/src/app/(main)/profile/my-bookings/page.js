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
    searchParams.get('tab') || 'flight'
  );
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState({
    flight: [],
    hotel: [],
    holidays: [],
    visa: [],
    umrah: [],
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch all flight bookings
const fetchAllFlights = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/flights/my-flights/`,
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      // Check if data is an array or has a flights property
      const flightsArray = Array.isArray(data) ? data : data.flights || [];
      
      return flightsArray.map(booking => ({
        id: booking.order_id || booking.id,
        bookingNumber: booking.booking_reference || `FL${(booking.order_id || booking.id).toString().slice(-6)}`,
        date: new Date(booking.created_at || new Date()).toLocaleDateString(),
        departure: booking.departure || booking.origin || booking.data?.slices?.[0]?.origin?.iata_code || 'N/A',
        destination: booking.arrival || booking.destination || booking.data?.slices?.[0]?.destination?.iata_code || 'N/A',
        departure_time: booking.departure_time || booking.departure_date || booking.data?.slices?.[0]?.segments?.[0]?.departing_at,
        arrival_time: booking.arrival_time || booking.arrival_date || booking.data?.slices?.[0]?.segments?.[0]?.arriving_at,
        airline: booking.airline || booking.data?.slices?.[0]?.segments?.[0]?.operating_carrier?.name || 'Unknown Airline',
        flightNumber: booking.flight_number || booking.data?.slices?.[0]?.segments?.[0]?.marketing_carrier_flight_number || 'N/A',
        status: booking.status || 'Confirmed',
        price: `${booking.currency || 'USD'} ${booking.total_amount || (booking.data?.total_amount ? booking.data.total_amount : '0')}`,
        passenger: booking.passengers?.[0] ? `${booking.passengers[0].given_name} ${booking.passengers[0].family_name}` : 'N/A',
        email: booking.passengers?.[0]?.email || booking.email || 'N/A',
        image: '/flight-booking.jpg',
        passengers: booking.passengers || booking.data?.passengers || [],
        cabin_class: booking.cabin_class || booking.data?.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class || 'Economy',
        slices: booking.data?.slices || [],
        conditions: booking.data?.conditions,
        payment_status: booking.payment_status || booking.data?.payment_status,
        departure_city: booking.departure_city || 'N/A',
        arrival_city: booking.arrival_city || 'N/A',
        duration: booking.duration || 'N/A',
        trip_type: booking.trip_type || 'One Way'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching all flights:', error);
    return [];
  }
};

  // Fetch flight booking details
  const fetchFlightBooking = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const flightData = await response.json();
        return {
          id: flightData.data?.id || orderId,
          bookingNumber: flightData.data?.booking_reference || `FL${orderId.slice(-6)}`,
          date: new Date(flightData.data?.created_at || new Date()).toLocaleDateString(),
          departure: flightData.data?.slices?.[0]?.origin?.iata_code || 'N/A',
          destination: flightData.data?.slices?.[0]?.destination?.iata_code || 'N/A',
          departure_time: flightData.data?.slices?.[0]?.segments?.[0]?.departing_at,
          arrival_time: flightData.data?.slices?.[0]?.segments?.[0]?.arriving_at,
          airline: flightData.data?.slices?.[0]?.segments?.[0]?.operating_carrier?.name || 'Unknown Airline',
          flightNumber: flightData.data?.slices?.[0]?.segments?.[0]?.marketing_carrier_flight_number || 'N/A',
          status: 'Confirmed',
          price: `${flightData.data?.total_currency || 'GBP'} ${flightData.data?.total_amount || '0'}`,
          passenger: flightData.data?.passengers?.[0]?.given_name + ' ' + flightData.data?.passengers?.[0]?.family_name,
          email: flightData.data?.passengers?.[0]?.email || 'N/A',
          image: '/flight-booking.jpg',
          passengers: flightData.data?.passengers || [],
          cabin_class: flightData.data?.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class || 'Economy',
          slices: flightData.data?.slices || [],
          conditions: flightData.data?.conditions,
          payment_status: flightData.data?.payment_status
        };
      }
      throw new Error('Failed to fetch flight booking');
    } catch (error) {
      console.error('Error fetching flight booking:', error);
      return null;
    }
  };

  // Fetch hotel booking details
  const fetchHotelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const hotelData = await response.json();
        return {
          id: hotelData.id || bookingId,
          bookingNumber: hotelData.reference || `HT${bookingId.slice(-6)}`,
          date: new Date(hotelData.confirmed_at || hotelData.created_at || new Date()).toLocaleDateString(),
          hotel: hotelData.accommodation?.name || 'Unknown Hotel',
          location: hotelData.accommodation?.location?.address ? 
            `${hotelData.accommodation.location.address.city_name}, ${hotelData.accommodation.location.address.country_code}` : 
            'N/A',
          check_in: hotelData.check_in_date,
          check_out: hotelData.check_out_date,
          status: hotelData.status || 'Confirmed',
          price: `GBP ${hotelData.total_amount || '0'}`,
          passenger: hotelData.guests?.[0] ? `${hotelData.guests[0].given_name} ${hotelData.guests[0].family_name}` : 'N/A',
          email: hotelData.email || 'N/A',
          image: hotelData.accommodation?.photos?.[0]?.url || '/hotel-booking.jpg',
          rooms: hotelData.rooms || 1,
          guests: hotelData.guests?.length || 1,
          accommodation: hotelData.accommodation,
          guest_types: hotelData.guest_types
        };
      }
      throw new Error('Failed to fetch hotel booking');
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
      return null;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const token = localStorage.getItem('authToken');
        let endpoint = '';
        
        if (activeCategory === 'holidays') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-bookings/${bookingId}/cancel/`;
        } else if (activeCategory === 'umrah') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-bookings/${bookingId}/cancel/`;
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

      const specificBookingId = searchParams.get('booking_id');
      const specificCategory = searchParams.get('tab') || activeCategory;

      if (specificBookingId && specificCategory === 'flight') {
        const flightBooking = await fetchFlightBooking(specificBookingId);
        if (flightBooking) {
          setBookings(prev => ({
            ...prev,
            flight: [flightBooking]
          }));
        }
      } else if (specificBookingId && specificCategory === 'hotel') {
        const hotelBooking = await fetchHotelBooking(specificBookingId);
        if (hotelBooking) {
          setBookings(prev => ({
            ...prev,
            hotel: [hotelBooking]
          }));
        }
      } else {
        if (activeCategory === 'flight') {
          const allFlights = await fetchAllFlights();
          const sortedFlights = allFlights.sort((a, b) => new Date(b.date) - new Date(a.date));
          setBookings(prev => ({
            ...prev,
            flight: sortedFlights
          }));
        }
      }

      // Fetch hotel bookings - FIXED HERE
      if (activeCategory === 'hotel') {
        const hotelResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hotels/Allbookings/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        
        if (hotelResponse.ok) {
          const hotelData = await hotelResponse.json(); 
          
          // Check if response has bookings array
          const hotelBookingsArray = hotelData.bookings || (Array.isArray(hotelData) ? hotelData : []);
          
          const sortedHotels = hotelBookingsArray
            .map(booking => ({
              ...booking,
              id: booking.id,
              bookingNumber: booking.reference || `HT${booking.id.toString().padStart(6, '0')}`,
              date: new Date(booking.confirmed_at || booking.created_at || new Date()).toLocaleDateString(),
              hotel: booking.accommodation?.name || 'Unknown Hotel',
              location: booking.accommodation?.location?.address ? 
                `${booking.accommodation.location.address.city_name}, ${booking.accommodation.location.address.country_code}` : 
                'N/A',
              check_in: booking.check_in_date,
              check_out: booking.check_out_date,
              status: booking.status || 'Confirmed',
              price: `GBP ${booking.total_amount || '0'}`,
              passenger: booking.guests?.[0] ? `${booking.guests[0].given_name} ${booking.guests[0].family_name}` : 'N/A',
              email: booking.email || 'N/A',
              image: booking.accommodation?.photos?.[0]?.url || '/hotel-booking.jpg',
              photos: booking.accommodation?.photos || [{ url: '/hotel-booking.jpg' }],
              rooms: booking.rooms || 1,
              guests: booking.guests?.length || 1,
              accommodation: booking.accommodation,
              guest_types: booking.guest_types
            }))
            .sort((a, b) => new Date(b.confirmed_at || b.created_at) - new Date(a.confirmed_at || a.created_at));
          
          setBookings(prev => ({
            ...prev,
            hotel: sortedHotels
          }));
        }
      }

      // Fetch holiday bookings
      if (activeCategory === 'holidays') {
        const holidayResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/user/holiday-bookings/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        if (holidayResponse.ok) {
          const holidayData = await holidayResponse.json();
          const sortedHolidays = holidayData
            .map(booking => ({
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
              photos: booking.package?.featured_image ? [{ url: booking.package.featured_image }] : [{ url: '/default-holiday.jpg' }],
              packageDetails: booking.package || {},
              travelers: booking.travelers,
              custom_request: booking.custom_request
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          setBookings(prev => ({
            ...prev,
            holidays: sortedHolidays
          }));
        }
      }

      // Fetch visa applications
      if (activeCategory === 'visa') {
        const visaResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/user/visa-applications/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        if (visaResponse.ok) {
          const visaData = await visaResponse.json();
          const sortedVisa = visaData
            .map(application => ({
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
              photos: application.country.cover_image ? [{ url: application.country.cover_image }] : [{ url: '/default-visa.jpg' }],
              travelers: application.travelers,
              passport_number: application.passport_number,
              passport_expiry: application.passport_expiry,
              processing_time: application.visa_type?.processing_time || application.country.processing_time,
              validity: application.visa_type?.validity || application.country.validity,
              requirements: application.country.requirements,
              documents: application.documents || [],
              payment_status: application.payment_status || 'unknown'
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          setBookings(prev => ({
            ...prev,
            visa: sortedVisa
          }));
        }
      }

      // Fetch Umrah bookings
      if (activeCategory === 'umrah') {
        const umrahResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/user/umrah-bookings/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        if (umrahResponse.ok) {
          const umrahData = await umrahResponse.json();
          const sortedUmrah = umrahData
            .map(booking => ({
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
              photos: booking.package?.featured_image ? [{ url: booking.package.featured_image }] : [{ url: '/default-umrah.jpg' }],
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
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          setBookings(prev => ({
            ...prev,
            umrah: sortedUmrah
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

  useEffect(() => {
    const bookingId = searchParams.get('booking_id');
    const tab = searchParams.get('tab');
    
    if (tab) {
      setActiveCategory(tab);
    }
    
    if (bookingId) {
      fetchBookings();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [activeCategory]);

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
    } else if (activeCategory === 'flight') {
      setSelectedBooking({
        ...booking,
        flightDetails: {
          airline: booking.airline,
          flightNumber: booking.flightNumber,
          departure: booking.departure,
          destination: booking.destination,
          departureTime: booking.departure_time,
          arrivalTime: booking.arrival_time,
          cabinClass: booking.cabin_class,
          passengers: booking.passengers,
          slices: booking.slices,
          conditions: booking.conditions,
          payment_status: booking.payment_status
        }
      });
    } else if (activeCategory === 'hotel') {
      setSelectedBooking({
        ...booking,
        hotelDetails: {
          hotel: booking.hotel,
          location: booking.location,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          rooms: booking.rooms,
          guests: booking.guests,
          accommodation: booking.accommodation,
          guest_types: booking.guest_types
        }
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

    if (activeCategory === 'flight') {
      content += `\nFlight Details:\n`;
      content += `Airline: ${booking.airline}\n`;
      content += `Flight: ${booking.flightNumber}\n`;
      content += `Route: ${booking.departure} to ${booking.destination}\n`;
      content += `Departure: ${new Date(booking.departure_time).toLocaleString()}\n`;
      content += `Arrival: ${new Date(booking.arrival_time).toLocaleString()}\n`;
      content += `Cabin Class: ${booking.cabin_class}\n`;
      
      if (booking.slices && booking.slices.length > 0) {
        content += `\nJourney Details:\n`;
        booking.slices.forEach((slice, index) => {
          content += `Segment ${index + 1}:\n`;
          content += `  From: ${slice.origin?.iata_code} (${slice.origin?.name})\n`;
          content += `  To: ${slice.destination?.iata_code} (${slice.destination?.name})\n`;
          content += `  Departure: ${new Date(slice.segments?.[0]?.departing_at).toLocaleString()}\n`;
          content += `  Arrival: ${new Date(slice.segments?.[0]?.arriving_at).toLocaleString()}\n`;
        });
      }
    } else if (activeCategory === 'hotel') {
      content += `\nHotel Details:\n`;
      content += `Hotel: ${booking.hotel}\n`;
      content += `Location: ${booking.location}\n`;
      content += `Check-in: ${new Date(booking.check_in).toLocaleDateString()}\n`;
      content += `Check-out: ${new Date(booking.check_out).toLocaleDateString()}\n`;
      content += `Rooms: ${booking.rooms}\n`;
      content += `Guests: ${booking.guests}\n`;
      
      if (booking.accommodation) {
        content += `Address: ${booking.accommodation.location?.address?.line_one}, ${booking.accommodation.location?.address?.city_name}, ${booking.accommodation.location?.address?.postal_code}\n`;
        content += `Rating: ${booking.accommodation.rating}/5\n`;
      }
    } else if (activeCategory === 'holidays') {
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
                        {activeCategory === 'flight' && `${selectedBooking.departure} to ${selectedBooking.destination}`}
                        {activeCategory === 'hotel' && selectedBooking.hotel}
                        {activeCategory === 'holidays' && selectedBooking.destination}
                        {activeCategory === 'visa' && `${selectedBooking.type} - ${selectedBooking.country}`}
                        {activeCategory === 'umrah' && selectedBooking.destination}
                      </h3>
                      <p className="text-sm opacity-90">
                        {activeCategory === 'flight' && `${selectedBooking.airline} ${selectedBooking.flightNumber}`}
                        {activeCategory === 'hotel' && selectedBooking.location}
                        {activeCategory === 'holidays' && 'Holiday Package'}
                        {activeCategory === 'visa' && selectedBooking.type}
                        {activeCategory === 'umrah' && 'Umrah Package'}
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
                        selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved' || selectedBooking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800' 
                          : selectedBooking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
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

                  {/* Flight Details */}
                  {activeCategory === 'flight' && selectedBooking.flightDetails && (
                    <>
                      <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Flight Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Airline</p>
                          <p className="text-gray-900">{selectedBooking.flightDetails.airline}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Flight Number</p>
                          <p className="text-gray-900">{selectedBooking.flightDetails.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Route</p>
                          <p className="text-gray-900">{selectedBooking.flightDetails.departure} → {selectedBooking.flightDetails.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Departure</p>
                          <p className="text-gray-900">
                            {new Date(selectedBooking.flightDetails.departureTime).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Arrival</p>
                          <p className="text-gray-900">
                            {new Date(selectedBooking.flightDetails.arrivalTime).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Cabin Class</p>
                          <p className="text-gray-900 capitalize">{selectedBooking.flightDetails.cabinClass}</p>
                        </div>
                        {selectedBooking.flightDetails.slices && selectedBooking.flightDetails.slices.length > 1 && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Journey Type</p>
                            <p className="text-gray-900">Round Trip</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Hotel Details */}
                  {activeCategory === 'hotel' && selectedBooking.hotelDetails && (
                    <>
                      <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Hotel Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Hotel</p>
                          <p className="text-gray-900">{selectedBooking.hotelDetails.hotel}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-gray-900">{selectedBooking.hotelDetails.location}</p>
                        </div>
                        {selectedBooking.hotelDetails.accommodation?.location?.address && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-gray-900">
                              {selectedBooking.hotelDetails.accommodation.location.address.line_one},<br />
                              {selectedBooking.hotelDetails.accommodation.location.address.city_name},<br />
                              {selectedBooking.hotelDetails.accommodation.location.address.postal_code}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-in</p>
                          <p className="text-gray-900">
                            {new Date(selectedBooking.hotelDetails.checkIn).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-out</p>
                          <p className="text-gray-900">
                            {new Date(selectedBooking.hotelDetails.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rooms</p>
                          <p className="text-gray-900">{selectedBooking.hotelDetails.rooms}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Guests</p>
                          <p className="text-gray-900">{selectedBooking.hotelDetails.guests}</p>
                        </div>
                        {selectedBooking.hotelDetails.accommodation?.rating && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Hotel Rating</p>
                            <p className="text-gray-900">{selectedBooking.hotelDetails.accommodation.rating}/5</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Holiday Details */}
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

                  {/* Umrah Details */}
                  {activeCategory === 'umrah' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Umrah Details</h3>
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
                              <div className="w-full md:w-48 h-32 md:mr-4 rounded-lg overflow-hidden mb-4 md:mb-0 flex-shrink-0">
                                <Image 
                                  src={booking.photos?.[0]?.url || booking.image} 
                                  alt={booking.destination || booking.hotel || booking.country}
                                  width={192}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                  <div className="mb-3 md:mb-0">
                                    <h3 className="text-lg font-bold text-[#445494]">
                                      {activeCategory === 'flight' && `${booking.departure} to ${booking.destination}`}
                                      {activeCategory === 'hotel' && booking.hotel}
                                      {activeCategory === 'holidays' && booking.destination}
                                      {activeCategory === 'visa' && `${booking.type} - ${booking.country}`}
                                      {activeCategory === 'umrah' && booking.destination}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                      <span className="font-medium">Booking #:</span> {booking.bookingNumber}
                                      <span className="mx-2 hidden md:inline">•</span>
                                      <br className="md:hidden" />
                                      <span className="font-medium">Date:</span> {booking.date}
                                    </p>
                                    {activeCategory === 'flight' && (
                                      <p className="text-gray-600 text-sm mt-1">
                                        <span className="font-medium">Airline:</span> {booking.airline} {booking.flightNumber}
                                      </p>
                                    )}
                                    {activeCategory === 'hotel' && (
                                      <p className="text-gray-600 text-sm mt-1">
                                        <span className="font-medium">Location:</span> {booking.location}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-left md:text-right">
                                    <p className="text-xl font-bold text-[#5A53A7]">{booking.price}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      booking.status === 'confirmed' || booking.status === 'Confirmed'
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
                                  {activeCategory === 'flight' && (
                                    <>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure</h4>
                                        <p className="mt-1 text-gray-900">
                                          {new Date(booking.departure_time).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cabin Class</h4>
                                        <p className="mt-1 text-gray-900 capitalize">{booking.cabin_class}</p>
                                      </div>
                                    </>
                                  )}
                                  {activeCategory === 'hotel' && (
                                    <>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</h4>
                                        <p className="mt-1 text-gray-900">
                                          {new Date(booking.check_in).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rooms</h4>
                                        <p className="mt-1 text-gray-900">{booking.rooms}</p>
                                      </div>
                                    </>
                                  )}
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
                              
                                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (activeCategory === 'holidays' || activeCategory === 'umrah') && (
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