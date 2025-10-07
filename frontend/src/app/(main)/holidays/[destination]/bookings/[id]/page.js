'use client';
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiUsers, FiX, FiCheck, FiHome, FiChevronRight, FiArrowRight, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';
import { toast } from 'react-toastify';

const Breadcrumb = ({ destination }) => {
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
      <span className="font-medium text-gray-800">{destinationName}</span>
    </div>
  );
};

const BookingForm = ({ packageData, onClose, destination }) => {
  const { user, initGoogleLogin } = useAuth({ redirectToLogin: false });
  const [departureDate, setDepartureDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customRequest, setCustomRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setContactName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!user) {
    setShowSignInPrompt(true);
    return;
  }

  setIsSubmitting(true);
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        package: packageData.id,
        contact_name: contactName,
        email,
        phone,
        departure_date: departureDate,
        travelers,
        custom_request: customRequest
      })
    });

    if (response.ok) {
      const data = await response.json();
      
   
      // Show success toast
      toast.success('Your holiday package has been booked successfully!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Close the booking form
      onClose();
      
      // Redirect to profile bookings page with holiday tab active
      router.push('/profile/my-bookings?tab=holidays');
    } else {
      const error = await response.json();
      throw new Error(error.detail || 'Booking failed');
    }
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Authentication')) {
      toast.error('Please sign in to continue');
      setShowSignInPrompt(true);
      logout();
    } else {
      toast.error(error.message || 'Booking failed. Please try again.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};


  const calculateTotalPrice = () => {
    return packageData.price * travelers;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-[#445494]">Book {packageData.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FiX className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Package Summary */}
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-[#445494] mb-4">Package Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{packageData.nights} Nights / {packageData.days} Days</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per person:</span>
                  <span className="font-medium">BDT {packageData.price.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Travelers:</span>
                  <span className="font-medium">{travelers}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold text-[#5A53A7]">
                    <span>Total Price:</span>
                    <span>BDT {calculateTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {packageData.tags && packageData.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-[#445494] mb-2">Includes</h4>
                  <div className="flex flex-wrap gap-2">
                    {packageData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-xs">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                      />
                      <FiCalendar className="absolute right-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Travelers</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={packageData.max_people}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                        value={travelers}
                        onChange={(e) => setTravelers(parseInt(e.target.value))}
                        required
                      />
                      <FiUsers className="absolute right-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>Confirm Booking</span>
                        <FiArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sign In Prompt */}
      {showSignInPrompt && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-[#445494]">Sign In Required</h3>
        <button 
          onClick={() => setShowSignInPrompt(false)}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <FiX className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">
        You need to sign in to complete your booking. Your booking details will be saved.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={() => {
            initGoogleLogin();
            // Store booking data temporarily
            localStorage.setItem('pendingBooking', JSON.stringify({
              packageId: packageData.id,
              contactName,
              email,
              phone,
              departureDate,
              travelers,
              customRequest
            }));
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <Link
          href={{
            pathname: '/login',
            query: { 
              redirect: `/holidays/${destination}/${packageData.id}/book`,
              packageId: packageData.id 
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#5A53A7] text-white rounded-lg hover:opacity-90 transition"
        >
          <FiLogIn className="text-lg" />
          <span>Sign in with Email</span>
        </Link>
        
        <div className="text-center text-sm text-gray-500 pt-2">
          <p>Don't have an account? <Link href="/register" className="text-[#5A53A7] hover:underline">Register</Link></p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

const PackageDetailsSection = ({ packageData }) => {
  if (!packageData) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-[#445494] mb-4">Package Details</h3>
      
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-[#5A53A7] mb-3">What's Included</h4>
        {packageData.tags && packageData.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {packageData.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-[#55C3A9]/10 text-[#55C3A9] rounded-full text-sm">
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No inclusions specified</p>
        )}
      </div>

      {packageData.details && packageData.details.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#5A53A7] mb-3">Travel Plan</h4>
          <div className="space-y-6">
            {packageData.details.map((day, index) => (
              <div key={index} className="border-l-2 border-[#5A53A7] pl-6 py-2 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#5A53A7] rounded-full"></div>
                <h5 className="text-md font-semibold text-[#5A53A7] mb-2">Day {day.day}: {day.title}</h5>
                <ul className="space-y-2">
                  {day.activities.map((activity, i) => (
                    <li key={i} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-[#55C3A9] rounded-full mt-2 mr-2"></span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BookingPage = () => {
  const params = useParams();
  const { destination, id } = params || {};
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('Package ID is missing');
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/holiday-packages/${id}/`;
        console.log('Fetching package from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to fetch package');
        }
        
        const data = await response.json();
        setPackageData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackage();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Link 
            href={`/holidays/${destination}`}
            className="px-4 py-2 bg-[#5A53A7] text-white rounded"
          >
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Package not found</div>
          <Link 
            href={`/holidays/${destination}`}
            className="px-4 py-2 bg-[#5A53A7] text-white rounded"
          >
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb destination={destination} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="h-64 md:h-80 bg-gray-200 relative">
                {packageData.featured_image && (
                  <Image
                    src={packageData.featured_image}
                    alt={packageData.title}
                    fill
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-[#445494]">{packageData.title}</h1>
                  <div className="text-xl font-bold text-[#5A53A7]">
                    BDT {packageData.price.toLocaleString()}
                    {packageData.discount_price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        BDT {packageData.discount_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="mr-2 text-[#5A53A7]" />
                    {packageData.nights} Night(s) {packageData.days} Day(s)
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="mr-2 text-[#5A53A7]" />
                    Max {packageData.max_people} people
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">{packageData.description}</p>
                
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center"
                >
                  Book Now
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
            
            <PackageDetailsSection packageData={packageData} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold text-[#445494] mb-4">Quick Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{packageData.destination}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{packageData.nights} Nights / {packageData.days} Days</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium">
                    {new Date(packageData.availability_start).toLocaleDateString()} -{' '}
                    {new Date(packageData.availability_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full py-3 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
              >
                Book Now
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm 
          packageData={packageData} 
          onClose={() => setShowBookingForm(false)}
          destination={destination}
        />
      )}
    </div>
  );
};

export default BookingPage;