"use client";
import { useState, useEffect } from 'react';
import { 
  FiExternalLink, 
  FiDollarSign, 
  FiTrendingUp, 
  FiCalendar,
  Filter,
  FiDownload,
  FiRefreshCw,
  FiHome,
  FiFilter
} from 'react-icons/fi';
import { TbPercentage } from 'react-icons/tb';

export default function HotelManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [markup, setMarkup] = useState(10); // Default 10% markup for hotels
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    topHotels: [],
    recentBookings: []
  });
  const [loading, setLoading] = useState(false);

  // Duffel Dashboard URLs
  const DUFFEL_BASE_URL = process.env.NEXT_PUBLIC_DUFFEL_BASE_URL || 'https://app.duffel.com/stech-holidays';
  const duffelUrls = {
    stays: `${DUFFEL_BASE_URL}/test/stays`,
    bookings: `${DUFFEL_BASE_URL}/test/stays/bookings`,
    testOrders: `${DUFFEL_BASE_URL}/test/orders`
  };

  // Fetch hotel analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/analytics/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);

      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update hotel markup
  const updateMarkup = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/markup/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ percentage: markup })
      });
      
      if (response.ok) {
        alert('Hotel markup updated successfully!');
      }
    } catch (error) {
      console.error('Error updating markup:', error);
    }
  };

  // Generate hotel voucher PDF
  const generateVoucherPDF = async (bookingId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/voucher/${bookingId}/pdf/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hotel-voucher-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating voucher:', error);
    }
  };

  // Send hotel voucher email
  const sendVoucherEmail = async (bookingId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/voucher/${bookingId}/email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        alert('Voucher email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#445494]">Hotel Management</h1>
          <p className="text-gray-600">Monitor hotel bookings and manage markups</p>
        </div>
        <button 
          onClick={() => window.open(duffelUrls.stays, '_blank')}
          className="flex items-center px-4 py-2 bg-[#55C3A9] text-white rounded-lg hover:bg-[#54ACA4] transition"
        >
          <FiExternalLink className="mr-2" />
          Manage in Duffel Dashboard
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-[#445494]">{analytics.totalBookings}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiHome className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-[#445494]">  ৳{Number(analytics.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FiTrendingUp className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-bold text-[#445494]">{analytics.occupancyRate}%</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FiCalendar className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hotel Markup</p>
              <p className="text-2xl font-bold text-[#445494]">{markup}%</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <TbPercentage className="text-orange-500" size={20} />
            </div>
          </div>
               </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Markup & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Markup Configuration */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#445494] mb-4">Hotel Markup Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Markup Percentage
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={markup}
                    onChange={(e) => setMarkup(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-[#5A53A7]">{markup}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
              <button
                onClick={updateMarkup}
                className="w-full bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white py-3 px-4 rounded-lg font-bold hover:opacity-90 transition"
              >
                Update Hotel Markup
              </button>
              <p className="text-sm text-gray-500">
                This markup will be applied to all hotel bookings in BDT
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#445494] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => window.open(duffelUrls.stays, '_blank')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <span>View All Stays</span>
                <FiExternalLink className="text-gray-400" />
              </button>
              <button
                onClick={() => window.open(duffelUrls.bookings, '_blank')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <span>Manage Bookings</span>
                <FiExternalLink className="text-gray-400" />
              </button>
              <button
                onClick={fetchAnalytics}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <span>Refresh Analytics</span>
                <FiRefreshCw className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Analytics & Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Hotels */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#445494]">Top Hotels</h2>
              <FiFilter className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {analytics.topHotels.map((hotel, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{hotel.name}</p>
                      <p className="text-sm text-gray-500">{hotel.city} • {hotel.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#445494]">৳{Number(hotel.revenue || 0).toLocaleString()}</p>
                    <p className="text-sm text-green-600">+{hotel.rating}★</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#445494]">Recent Hotel Bookings</h2>
              <button 
                onClick={() => window.open(duffelUrls.stays, '_blank')}
                className="text-sm text-[#5A53A7] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {analytics.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{booking.hotelName}</p>
                    <p className="text-sm text-gray-500">
                      {booking.city} • {booking.checkIn} - {booking.checkOut} • {booking.guests} guests
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="font-bold">৳{Number(booking.amount || 0).toLocaleString()}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => generateVoucherPDF(booking.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Download Voucher"
                      >
                        <FiDownload className="text-gray-500" size={16} />
                      </button>
                      <button
                        onClick={() => sendVoucherEmail(booking.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Send Voucher"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}