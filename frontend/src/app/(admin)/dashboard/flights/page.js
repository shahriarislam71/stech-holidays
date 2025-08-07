// (admin)/flights/page.js
"use client";
import { useState } from 'react';

export default function FlightManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [flights, setFlights] = useState([
    {
      id: 1,
      airline: 'US Bangla Airlines',
      flightNumber: 'BS101',
      departure: 'DAC',
      arrival: 'CGP',
      departureTime: '2023-06-15T07:30:00',
      arrivalTime: '2023-06-15T08:35:00',
      status: 'active',
      bookings: [
        {
          id: 'BK101',
          passenger: 'John Doe',
          class: 'Economy',
          price: 6699,
          paymentStatus: 'Paid',
          date: '2023-06-10'
        },
        {
          id: 'BK102',
          passenger: 'Jane Smith',
          class: 'Business',
          price: 12999,
          paymentStatus: 'Pending',
          date: '2023-06-11'
        }
      ],
      pricing: {
        economy: 6699,
        premiumEconomy: 8999,
        business: 12999,
        firstClass: 18999
      }
    },
    {
      id: 2,
      airline: 'Biman Bangladesh',
      flightNumber: 'BG201',
      departure: 'DAC',
      arrival: 'JFK',
      departureTime: '2023-06-15T22:15:00',
      arrivalTime: '2023-06-16T12:30:00',
      status: 'active',
      bookings: [
        {
          id: 'BK201',
          passenger: 'Michael Johnson',
          class: 'Business',
          price: 78900,
          paymentStatus: 'Paid',
          date: '2023-06-05'
        }
      ],
      pricing: {
        economy: 58900,
        premiumEconomy: 68900,
        business: 78900,
        firstClass: 98900
      }
    }
  ]);

  const [newFlight, setNewFlight] = useState({
    airline: '',
    flightNumber: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    status: 'active',
    pricing: {
      economy: 0,
      premiumEconomy: 0,
      business: 0,
      firstClass: 0
    }
  });

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [viewBookingsFor, setViewBookingsFor] = useState(null);

  const filteredFlights = flights.filter(flight => {
    if (activeTab === 'all') return true;
    return flight.status === activeTab;
  });

  const handleAddFlight = () => {
    if (!newFlight.airline || !newFlight.flightNumber || !newFlight.departure || !newFlight.arrival) {
      alert('Please fill in all required fields');
      return;
    }

    const flightToAdd = {
      ...newFlight,
      id: flights.length + 1,
      bookings: []
    };

    setFlights([...flights, flightToAdd]);
    setIsAddModalOpen(false);
    setNewFlight({
      airline: '',
      flightNumber: '',
      departure: '',
      arrival: '',
      departureTime: '',
      arrivalTime: '',
      status: 'active',
      pricing: {
        economy: 0,
        premiumEconomy: 0,
        business: 0,
        firstClass: 0
      }
    });
  };

  const handleEditFlight = (flight) => {
    setSelectedFlight(flight);
    setNewFlight({
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departure: flight.departure,
      arrival: flight.arrival,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      status: flight.status,
      pricing: flight.pricing
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteFlight = (id) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      setFlights(flights.filter(flight => flight.id !== id));
    }
  };

  const handleUpdateFlight = () => {
    const updatedFlights = flights.map(flight => 
      flight.id === selectedFlight.id ? { ...flight, ...newFlight } : flight
    );
    setFlights(updatedFlights);
    setIsAddModalOpen(false);
    setSelectedFlight(null);
    setNewFlight({
      airline: '',
      flightNumber: '',
      departure: '',
      arrival: '',
      departureTime: '',
      arrivalTime: '',
      status: 'active',
      pricing: {
        economy: 0,
        premiumEconomy: 0,
        business: 0,
        firstClass: 0
      }
    });
  };

  const handlePriceChange = (type, value) => {
    setNewFlight({
      ...newFlight,
      pricing: {
        ...newFlight.pricing,
        [type]: parseInt(value) || 0
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Flight Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#445494]">Flight Management</h1>
          <p className="text-gray-600">Manage all flights and bookings</p>
        </div>
        <button 
          onClick={() => {
            setSelectedFlight(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white rounded-lg shadow-md hover:opacity-90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Flight
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'all' ? 'text-[#5A53A7] border-b-2 border-[#5A53A7]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          All Flights
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'active' ? 'text-[#5A53A7] border-b-2 border-[#5A53A7]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'inactive' ? 'text-[#5A53A7] border-b-2 border-[#5A53A7]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Inactive
        </button>
      </div>

      {/* Flight Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Airline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flight No.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFlights.map((flight) => (
                <tr key={flight.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {flight.airline.split(' ').map(word => word[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{flight.airline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{flight.flightNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{flight.departure}</div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm font-medium text-gray-900">{flight.arrival}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(flight.departureTime).toLocaleDateString()} <br />
                      {new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setViewBookingsFor(viewBookingsFor === flight.id ? null : flight.id)}
                      className="text-[#5A53A7] hover:underline"
                    >
                      {flight.bookings.length} bookings
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      flight.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {flight.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditFlight(flight)}
                      className="text-[#5A53A7] hover:text-[#55C3A9] mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteFlight(flight.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings Modal */}
      {viewBookingsFor && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#445494]">
                Bookings for {flights.find(f => f.id === viewBookingsFor)?.airline} {flights.find(f => f.id === viewBookingsFor)?.flightNumber}
              </h3>
              <button 
                onClick={() => setViewBookingsFor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passenger
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flights.find(f => f.id === viewBookingsFor)?.bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.passenger}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.class === 'Economy' ? 'bg-blue-100 text-blue-800' :
                            booking.class === 'Premium Economy' ? 'bg-purple-100 text-purple-800' :
                            booking.class === 'Business' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.class}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          BDT {booking.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Flight Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#445494]">
                {selectedFlight ? 'Edit Flight' : 'Add New Flight'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedFlight(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Airline*</label>
                    <select 
                      value={newFlight.airline}
                      onChange={(e) => setNewFlight({...newFlight, airline: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                    >
                      <option value="">Select Airline</option>
                      <option>US Bangla Airlines</option>
                      <option>Biman Bangladesh</option>
                      <option>Novo Air</option>
                      <option>Air Astra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number*</label>
                    <input 
                      type="text" 
                      value={newFlight.flightNumber}
                      onChange={(e) => setNewFlight({...newFlight, flightNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport*</label>
                    <select 
                      value={newFlight.departure}
                      onChange={(e) => setNewFlight({...newFlight, departure: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                    >
                      <option value="">Select Airport</option>
                      <option>DAC - Hazrat Shahjalal International</option>
                      <option>CGP - Shah Amanat International</option>
                      <option>JFK - John F. Kennedy International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport*</label>
                    <select 
                      value={newFlight.arrival}
                      onChange={(e) => setNewFlight({...newFlight, arrival: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                    >
                      <option value="">Select Airport</option>
                      <option>DAC - Hazrat Shahjalal International</option>
                      <option>CGP - Shah Amanat International</option>
                      <option>JFK - John F. Kennedy International</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time*</label>
                    <input 
                      type="datetime-local" 
                      value={newFlight.departureTime}
                      onChange={(e) => setNewFlight({...newFlight, departureTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time*</label>
                    <input 
                      type="datetime-local" 
                      value={newFlight.arrivalTime}
                      onChange={(e) => setNewFlight({...newFlight, arrivalTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#445494] mb-4">Pricing (BDT)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Economy Class</label>
                      <input 
                        type="number" 
                        value={newFlight.pricing.economy}
                        onChange={(e) => handlePriceChange('economy', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Premium Economy</label>
                      <input 
                        type="number" 
                        value={newFlight.pricing.premiumEconomy}
                        onChange={(e) => handlePriceChange('premiumEconomy', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Class</label>
                      <input 
                        type="number" 
                        value={newFlight.pricing.business}
                        onChange={(e) => handlePriceChange('business', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Class</label>
                      <input 
                        type="number" 
                        value={newFlight.pricing.firstClass}
                        onChange={(e) => handlePriceChange('firstClass', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={newFlight.status}
                    onChange={(e) => setNewFlight({...newFlight, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={selectedFlight ? handleUpdateFlight : handleAddFlight}
                    className="w-full bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition shadow-md"
                  >
                    {selectedFlight ? 'Update Flight' : 'Add Flight'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}