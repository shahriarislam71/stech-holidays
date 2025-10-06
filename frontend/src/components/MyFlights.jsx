// components/MyFlights.jsx
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

const MyFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchMyFlights();
  }, []);

  const fetchMyFlights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flights/my-flights/');
      const data = await response.json();
      
      if (data.status === 'success') {
        setFlights(data.flights || []);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/flights/my-flights/${orderId}/`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setSelectedFlight(data.booking);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching flight details:', error);
    }
  };

  const handleCancelBooking = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flights/my-flights/${orderId}/cancel/`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        alert('Booking cancelled successfully');
        fetchMyFlights(); // Refresh the list
      } else {
        alert('Failed to cancel booking: ' + data.message);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Confirmed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#445494]">My Flights</h2>
        <button 
          onClick={fetchMyFlights}
          className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4490] transition-colors"
        >
          Refresh
        </button>
      </div>

      {flights.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No flights found</h3>
          <p className="mt-2 text-sm text-gray-500">You haven't booked any flights yet.</p>
          <div className="mt-6">
            <a 
              href="/flights" 
              className="px-4 py-2 bg-[#5A53A7] text-white rounded-md hover:bg-[#445494] transition-colors inline-flex items-center text-sm"
            >
              Book a Flight
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {flights.map((flight) => (
            <div key={flight.order_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#445494]">
                          {flight.departure} → {flight.arrival}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {flight.airline} • {flight.flight_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#5A53A7]">
                          {flight.currency} {flight.total_amount}
                        </p>
                        {getStatusBadge(flight.status)}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Departure</p>
                        <p className="mt-1 text-gray-900">
                          {format(parseISO(flight.departure_time), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(flight.departure_time), 'h:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Arrival</p>
                        <p className="mt-1 text-gray-900">
                          {format(parseISO(flight.arrival_time), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(flight.arrival_time), 'h:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Duration</p>
                        <p className="mt-1 text-gray-900">{flight.duration}</p>
                        <p className="text-sm text-gray-600">{flight.trip_type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Passengers</p>
                        <p className="mt-1 text-gray-900">{flight.passengers.length}</p>
                        <p className="text-sm text-gray-600">{flight.cabin_class}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Booking Ref: {flight.booking_reference}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {flight.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    onClick={() => handleViewDetails(flight.order_id)}
                    className="px-4 py-2 border border-[#5A53A7] text-[#5A53A7] rounded-lg hover:bg-[#5A53A7] hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                  
                  {flight.status !== 'Cancelled' && (
                    <button 
                      onClick={() => handleCancelBooking(flight.order_id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  <button className="px-4 py-2 bg-[#55C3A9] text-white rounded-lg hover:bg-[#54ACA4] transition-colors">
                    Download Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedFlight && (
        <FlightDetailModal 
          flight={selectedFlight}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

// Flight Detail Modal Component
const FlightDetailModal = ({ flight, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-[#445494]">Flight Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flight Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#445494] mb-4">Flight Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Airline:</span>
                  <span className="font-medium">{flight.airline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight Number:</span>
                  <span className="font-medium">{flight.flight_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{flight.departure} → {flight.arrival}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure:</span>
                  <span className="font-medium">
                    {format(parseISO(flight.departure_time), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Arrival:</span>
                  <span className="font-medium">
                    {format(parseISO(flight.arrival_time), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{flight.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cabin Class:</span>
                  <span className="font-medium">{flight.cabin_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trip Type:</span>
                  <span className="font-medium">{flight.trip_type}</span>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#445494] mb-4">Booking Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-medium">{flight.booking_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-sm">{flight.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    flight.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : flight.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {flight.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium">{flight.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-[#5A53A7]">
                    {flight.currency} {flight.total_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium">
                    {format(parseISO(flight.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>

              {/* Passengers */}
              <h3 className="text-lg font-semibold text-[#445494] mt-6 mb-4">Passengers</h3>
              <div className="space-y-3">
                {flight.passengers.map((passenger, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium">
                      {passenger.given_name} {passenger.family_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)} • {passenger.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFlights;