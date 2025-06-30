'use client';
import React, { useState } from 'react';
import { FiMapPin, FiCalendar, FiUsers, FiStar, FiChevronDown, FiChevronRight, FiHome, FiChevronLeft, FiCheck } from 'react-icons/fi';
import { FaPhoneAlt, FaPlane } from 'react-icons/fa';
import Link from 'next/link';

const packages = {
  1: {
    id: 1,
    title: 'Blissful Bangkok',
    location: 'Bangkok, Thailand',
    duration: '2 Nights 3 Days',
    suitableFor: ['Family', 'Friends'],
    maxPeople: '2-20',
    availability: "01 Jun' 25 - 31 Jul' 25",
    price: 'BDT 10,340',
    image: '/countries/visa-photo-1.jpg',
    hasFlight: false
  },
  2: {
    id: 2,
    title: 'Golden Horizon: Pattaya Mini Break',
    location: 'Bangkok, Thailand',
    duration: '2 Nights 3 Days',
    suitableFor: ['Family', 'Friends'],
    maxPeople: '2-20',
    availability: "01 Jun' 25 - 31 Jul' 25",
    price: 'BDT 12,320',
    image: '/countries/visa-photo-2.jpg',
    hasFlight: true
  }
};

const Breadcrumb = ({ destination, packageTitle }) => {
  const destinationName = destination.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  
  return (
    <div className="flex items-center text-sm text-gray-600 mb-6">
      <Link href="/" className="flex items-center hover:text-[#5A53A7]">
        <FiHome className="mr-2" />
        <span>Home</span>
      </Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <Link href="/holidays" className="hover:text-[#5A53A7]">Holidays</Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <Link href={`/holidays/${destination}`} className="hover:text-[#5A53A7]">{destinationName}</Link>
      <FiChevronRight className="mx-2 text-gray-400" />
      <span className="font-medium text-gray-800">{packageTitle}</span>
    </div>
  );
};

const ConfirmationModal = ({ onClose, packageData }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
        {/* Banner Image */}
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          <img 
            src={packageData.image} 
            alt={packageData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{packageData.title}</h3>
            <p className="flex items-center">
              <FiMapPin className="mr-1" size={14} />
              {packageData.location}
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Request Submitted!</h3>
            <p className="text-gray-600">
              Your booking request has been received. Our team will contact you shortly to confirm your trip details.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Package:</span>
              <span className="font-medium">{packageData.title}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-[#5A53A7]">{packageData.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{packageData.duration}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link
              href="/profile/my-bookings"
              className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition text-center"
            >
              View My Bookings
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingPage = ({ params }) => {
  const { destination, id } = params;
  const packageData = packages[id];
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: 'MD SHAHRIAR ISLAM RAFI',
    email: 'shahriar.islam.rafi@g.bracu.ac.bd',
    mobile: '',
    travelDate: '',
    travelers: 1,
    customRequest: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowConfirmation(true);
  };

  // Check if required fields are filled
  const isFormValid = formData.fullName && 
                     formData.email && 
                     formData.mobile && 
                     formData.travelDate;

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Package not found</h1>
          <Link href={`/holidays/${destination}`} className="text-[#5A53A7] hover:underline">
            Back to packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-[190px] py-8">
        <Breadcrumb destination={destination} packageTitle={packageData.title} />
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#445494] mb-4">{packageData.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <FiMapPin className="text-[#5A53A7] mr-3" />
                    <span>{packageData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiCalendar className="text-[#5A53A7] mr-3" />
                    <span>{packageData.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiUsers className="text-[#5A53A7] mr-3" />
                    <span>{packageData.suitableFor.join(', ')}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiUsers className="text-[#5A53A7] mr-3" />
                    <span>Group: {packageData.maxPeople}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiStar className="text-[#5A53A7] mr-3" />
                    <span>Availability: {packageData.availability}</span>
                  </div>
                  {packageData.hasFlight && (
                    <div className="flex items-center text-gray-700">
                      <FaPlane className="text-[#5A53A7] mr-3" />
                      <span>Flight Included</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500">Starts from</p>
                      <p className="text-2xl font-bold text-[#5A53A7]">{packageData.price}</p>
                      <p className="text-sm text-gray-500">per person</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <h3 className="text-xl font-bold text-[#445494] mb-6">Help us to reach you</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Select from Passenger List</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7] appearance-none">
                      <option>Select</option>
                      <option>New Passenger</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-4 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Mobile <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <div className="w-24 mr-2">
                      <select className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7]">
                        <option>+880</option>
                        <option>+91</option>
                        <option>+1</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="XXXXXXXXXX"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">When do you plan to leave? <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Number of travellers</label>
                  <div className="relative">
                    <select
                      name="travelers"
                      value={formData.travelers}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7] appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-4 top-4 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">I want to customize this package</label>
                  <textarea
                    name="customRequest"
                    value={formData.customRequest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
                    rows="3"
                    placeholder="Tell us about your customization requests..."
                  ></textarea>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    By submitting a request, I accept Firsttrip's <a href="#" className="text-[#5A53A7] hover:underline">Terms & Conditions</a>, <a href="#" className="text-[#5A53A7] hover:underline">Privacy Policy</a> and <a href="#" className="text-[#5A53A7] hover:underline">Refund Policy</a>.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Link
                    href={`/holidays/${destination}`}
                    className="px-6 py-3 border border-[#5A53A7] text-[#5A53A7] rounded-lg hover:bg-gray-100 transition flex-1 flex items-center justify-center"
                  >
                    <FiChevronLeft className="mr-2" />
                    Back
                  </Link>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg transition flex-1 flex items-center justify-center ${
                      isFormValid ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Submit
                    <FiChevronRight className="ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 sticky top-6">
              <div className="bg-[#5A53A7]/10 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-[#5A53A7] mb-2">Not sure yet? Need suggestions?</h3>
                <p className="text-gray-700 mb-4">Contact our experts to make your plan just right!</p>
                
                <div className="flex items-center">
                  <div className="bg-[#5A53A7] p-3 rounded-full mr-4">
                    <FaPhoneAlt className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Hotline:</p>
                    <p className="text-lg font-semibold text-[#5A53A7]">+8809613131415</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Why Book With Us?</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-[#55C3A9]/10 p-1 rounded-full mr-3 mt-0.5">
                      <FiCheck className="text-[#55C3A9] text-sm" />
                    </div>
                    <span className="text-gray-700">Best price guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#55C3A9]/10 p-1 rounded-full mr-3 mt-0.5">
                      <FiCheck className="text-[#55C3A9] text-sm" />
                    </div>
                    <span className="text-gray-700">No booking fees</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#55C3A9]/10 p-1 rounded-full mr-3 mt-0.5">
                      <FiCheck className="text-[#55C3A9] text-sm" />
                    </div>
                    <span className="text-gray-700">24/7 customer support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#55C3A9]/10 p-1 rounded-full mr-3 mt-0.5">
                      <FiCheck className="text-[#55C3A9] text-sm" />
                    </div>
                    <span className="text-gray-700">Flexible payment options</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationModal onClose={() => setShowConfirmation(false)} packageData={packageData} />
      )}
    </div>
  );
};

export default BookingPage;