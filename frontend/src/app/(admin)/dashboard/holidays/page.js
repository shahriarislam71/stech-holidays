// app/(admin)/holidays/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  FiPackage,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

export default function HolidaysAdminPage() {
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const router = useRouter();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    duration: '',
    nights: 0,
    days: 0,
    max_people: '',
    price: 0,
    discount_price: '',
    availability_start: '',
    availability_end: '',
    includes_flight: false,
    featured_image: null,
    tags: []
  });

  // Fetch packages and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Fetch packages
        const packagesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-packages/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        const packagesData = await packagesRes.json();
        setPackages(packagesData);

        // Fetch bookings
        const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-bookings/`, {
  headers: {
    'Authorization': `Token ${token}`
  }
});

if (!bookingsRes.ok) {
  throw new Error('Failed to fetch bookings');
}

        const bookingsData = await bookingsRes.json();
        if (Array.isArray(bookingsData)) {
  setBookings(bookingsData);
} else {
  console.error('Bookings data is not an array:', bookingsData);
  setBookings([]); // Set to empty array as fallback
}

      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-packages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newPackage = await response.json();
        setPackages([...packages, newPackage]);
        setShowCreateModal(false);
        toast.success('Package created successfully');
        setFormData({
          title: '',
          destination: '',
          description: '',
          duration: '',
          nights: 0,
          days: 0,
          max_people: '',
          price: 0,
          discount_price: '',
          availability_start: '',
          availability_end: '',
          includes_flight: false,
          featured_image: null,
          tags: []
        });
      } else {
        throw new Error('Failed to create package');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditPackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-packages/${currentPackage.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedPackage = await response.json();
        setPackages(packages.map(pkg => pkg.id === updatedPackage.id ? updatedPackage : pkg));
        setShowEditModal(false);
        toast.success('Package updated successfully');
      } else {
        throw new Error('Failed to update package');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-packages/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          setPackages(packages.filter(pkg => pkg.id !== id));
          toast.success('Package deleted successfully');
        } else {
          throw new Error('Failed to delete package');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-bookings/${bookingId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(bookings.map(booking => 
          booking.id === updatedBooking.id ? updatedBooking : booking
        ));
        toast.success('Booking status updated');
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking =>
  booking.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  booking.package?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  booking.package?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#445494]">Holidays Management</h1>
        <p className="text-gray-600">Manage holiday packages and bookings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'packages' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Packages
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'bookings' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Bookings
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#5A53A7] focus:border-[#5A53A7] sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {activeTab === 'packages' && (
          <button
            onClick={() => {
              setCurrentPackage(null);
              setShowCreateModal(true);
              setFormData({
                title: '',
                destination: '',
                description: '',
                duration: '',
                nights: 0,
                days: 0,
                max_people: '',
                price: 0,
                discount_price: '',
                availability_start: '',
                availability_end: '',
                includes_flight: false,
                featured_image: null,
                tags: []
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5A53A7] hover:bg-[#445494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7]"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Package
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7]"></div>
        </div>
      ) : activeTab === 'packages' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {pkg.featured_image && (
                              <img className="h-10 w-10 rounded-full object-cover" src={pkg.featured_image} alt={pkg.title} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.destination}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.nights} Nights / {pkg.days} Days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">BDT {pkg.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(pkg.availability_start).toLocaleDateString()} - {new Date(pkg.availability_end).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentPackage(pkg);
                            setFormData({
                              title: pkg.title,
                              destination: pkg.destination,
                              description: pkg.description,
                              duration: pkg.duration,
                              nights: pkg.nights,
                              days: pkg.days,
                              max_people: pkg.max_people,
                              price: pkg.price,
                              discount_price: pkg.discount_price || '',
                              availability_start: pkg.availability_start,
                              availability_end: pkg.availability_end,
                              includes_flight: pkg.includes_flight,
                              featured_image: pkg.featured_image,
                              tags: pkg.tags || []
                            });
                            setShowEditModal(true);
                          }}
                          className="text-[#5A53A7] hover:text-[#445494] mr-4"
                        >
                          <FiEdit2 className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No packages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travelers
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.package?.title || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.package?.destination || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.contact_name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.departure_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.travelers}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#5A53A7] focus:border-[#5A53A7] sm:text-sm rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
{showCreateModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
    {/* Backdrop - lower z-index than modal content */}
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
    
    {/* Modal container */}
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      {/* This element is to trick the browser into centering the modal contents */}
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      {/* Modal content - higher z-index than backdrop */}
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
            Create New Holiday Package
          </h3>
          <form onSubmit={handleCreatePackage}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Package Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700"
                >
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  id="destination"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  id="duration"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="nights"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nights
                </label>
                <input
                  type="number"
                  name="nights"
                  id="nights"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.nights}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nights: e.target.value === '' ? 0 : parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="days"
                  className="block text-sm font-medium text-gray-700"
                >
                  Days
                </label>
                <input
                  type="number"
                  name="days"
                  id="days"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      days: e.target.value === '' ? 0 : parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="max_people"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max People
                </label>
                <input
                  type="text"
                  name="max_people"
                  id="max_people"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.max_people}
                  onChange={(e) =>
                    setFormData({ ...formData, max_people: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value === '' ? 0 : parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="discount_price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount Price (optional)
                </label>
                <input
                  type="number"
                  name="discount_price"
                  id="discount_price"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.discount_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_price:
                        e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="availability_start"
                  className="block text-sm font-medium text-gray-700"
                >
                  Availability Start
                </label>
                <input
                  type="date"
                  name="availability_start"
                  id="availability_start"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.availability_start}
                  onChange={(e) =>
                    setFormData({ ...formData, availability_start: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="availability_end"
                  className="block text-sm font-medium text-gray-700"
                >
                  Availability End
                </label>
                <input
                  type="date"
                  name="availability_end"
                  id="availability_end"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.availability_end}
                  onChange={(e) =>
                    setFormData({ ...formData, availability_end: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="includes_flight"
                  className="block text-sm font-medium text-gray-700"
                >
                  <input
                    type="checkbox"
                    name="includes_flight"
                    id="includes_flight"
                    className="focus:ring-[#5A53A7] h-4 w-4 text-[#5A53A7] border-gray-300 rounded mr-2"
                    checked={formData.includes_flight}
                    onChange={(e) =>
                      setFormData({ ...formData, includes_flight: e.target.checked })
                    }
                  />
                  Includes Flight
                </label>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.tags.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0),
                    })
                  }
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="featured_image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Featured Image URL
                </label>
                <input
                  type="text"
                  name="featured_image"
                  id="featured_image"
                  className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.featured_image || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, featured_image: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#5A53A7] text-base font-medium text-white hover:bg-[#445494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7] sm:col-start-2 sm:text-sm"
              >
                Create Package
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7] sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Edit Package Modal */}
      {showEditModal && currentPackage && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Holiday Package</h3>
                <form onSubmit={handleEditPackage}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Package Title</label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
                      <input
                        type="text"
                        name="destination"
                        id="destination"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.destination}
                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        id="duration"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="nights" className="block text-sm font-medium text-gray-700">Nights</label>
                      <input
                        type="number"
                        name="nights"
                        id="nights"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.nights}
                        onChange={(e) => setFormData({...formData, nights: parseInt(e.target.value) || 0})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="days" className="block text-sm font-medium text-gray-700">Days</label>
                      <input
                        type="number"
                        name="days"
                        id="days"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.days}
                        onChange={(e) => setFormData({...formData, days: parseInt(e.target.value) || 0})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="max_people" className="block text-sm font-medium text-gray-700">Max People</label>
                      <input
                        type="text"
                        name="max_people"
                        id="max_people"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.max_people}
                        onChange={(e) => setFormData({...formData, max_people: e.target.value})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700">Discount Price (optional)</label>
                      <input
                        type="number"
                        name="discount_price"
                        id="discount_price"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.discount_price}
                        onChange={(e) => setFormData({...formData, discount_price: parseFloat(e.target.value) || ''})}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="availability_start" className="block text-sm font-medium text-gray-700">Availability Start</label>
                      <input
                        type="date"
                        name="availability_start"
                        id="availability_start"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.availability_start}
                        onChange={(e) => setFormData({...formData, availability_start: e.target.value})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="availability_end" className="block text-sm font-medium text-gray-700">Availability End</label>
                      <input
                        type="date"
                        name="availability_end"
                        id="availability_end"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.availability_end}
                        onChange={(e) => setFormData({...formData, availability_end: e.target.value})}
                        required
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="includes_flight" className="block text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="includes_flight"
                          id="includes_flight"
                          className="focus:ring-[#5A53A7] h-4 w-4 text-[#5A53A7] border-gray-300 rounded mr-2"
                          checked={formData.includes_flight}
                          onChange={(e) => setFormData({...formData, includes_flight: e.target.checked})}
                        />
                        Includes Flight
                      </label>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      ></textarea>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                      <input
                        type="text"
                        name="tags"
                        id="tags"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(tag => tag.trim())})}
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">Featured Image URL</label>
                      <input
                        type="text"
                        name="featured_image"
                        id="featured_image"
                        className="mt-1 focus:ring-[#5A53A7] focus:border-[#5A53A7] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.featured_image || ''}
                        onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#5A53A7] text-base font-medium text-white hover:bg-[#445494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7] sm:col-start-2 sm:text-sm"
                    >
                      Update Package
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7] sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}