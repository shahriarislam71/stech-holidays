"use client"
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserMinus, FaUserPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { MdOutlineClose } from 'react-icons/md';
import Image from 'next/image';
import useAuth from '@/app/hooks/useAuth';

const VisaSubmissionPage = () => {
  const { country, id } = useParams();
  const router = useRouter();
  const { user, initGoogleLogin } = useAuth({ redirectToLogin: false });
  const [visaDetails, setVisaDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [formData, setFormData] = useState({
    contactName: '',
    mobileNumber: '',
    email: '',
    departureDate: '',
    travelers: 1,
    passportNumber: '',
    passportExpiry: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const fetchVisaDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch country details
        const countryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/visa-countries/${country}/`
        );
        if (!countryResponse.ok) throw new Error('Failed to load country details');
        const countryData = await countryResponse.json();
        
        // Fetch visa types
        const visaTypesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/visa-countries/${country}/visa-types/`
        );
        if (!visaTypesResponse.ok) throw new Error('Failed to load visa types');
        const visaTypesData = await visaTypesResponse.json();
        
        // Find selected visa type
        const selectedVisaType = visaTypesData.find(visa => visa.id.toString() === id);
        if (!selectedVisaType) throw new Error('Visa type not found');
        
        // Store with clear structure
        setVisaDetails({
          country: countryData,  // Contains country ID (23)
          visaType: selectedVisaType  // Contains visa type ID (12)
        });
        
      } catch (err) {
        console.error('Error fetching visa details:', err);
        setError(err.message || 'Failed to load visa details');
      } finally {
        setLoading(false);
      }
    };

    fetchVisaDetails();
  }, [country, id]);

  useEffect(() => {
    const isValid = 
      formData.contactName.trim() !== '' &&
      formData.mobileNumber.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.departureDate !== '' &&
      formData.travelers >= 1 &&
      formData.passportNumber.trim() !== '' &&
      formData.passportExpiry !== '';
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTravelerChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      travelers: Math.max(1, prev.travelers + (increment ? 1 : -1))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visaDetails) return;
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/visa-applications/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            visa_type: id,  // Visa type ID from URL (12)
            country_id: visaDetails.country.id,  // Country ID (23)
            contact_name: formData.contactName,
            email: formData.email,
            phone: formData.mobileNumber,
            departure_date: formData.departureDate,
            travelers: formData.travelers,
            passport_number: formData.passportNumber,
            passport_expiry: formData.passportExpiry,
            additional_info: formData.message
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Application failed');
      }
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit application');
      
      if (err.message.includes('Authentication')) {
        setShowLoginPrompt(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    router.push('/profile/my-bookings');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg max-w-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>;
  }

  if (!visaDetails) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">No Visa Details Found</h2>
        <p className="text-gray-600 mt-2">The requested visa information could not be loaded.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{visaDetails.visaType.type} Visa Application</h1>
        <p className="text-lg text-gray-600">Complete the form below to apply for your {visaDetails.country.name} {visaDetails.visaType.type}</p>
      </div>
      
      {/* Visa Details Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="relative h-48 w-full rounded-xl overflow-hidden">
              <Image
                src={visaDetails.country.cover_image}
                alt={visaDetails.country.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{visaDetails.country.name} {visaDetails.visaType.type} Details</h2>
            <p className="text-gray-600 mb-4">{visaDetails.visaType.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Processing Time</p>
                <p className="font-medium text-gray-800">{visaDetails.visaType.processing_time}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Validity</p>
                <p className="font-medium text-gray-800">{visaDetails.visaType.validity}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Entry Type</p>
                <p className="font-medium text-gray-800">{visaDetails.visaType.entry_type}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Visa Fee</p>
                <p className="font-medium text-gray-800">{visaDetails.visaType.fee} BDT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Visa Form */}
        <div className="">
            <div className="">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Contact Information
              </h2>
              <p className="text-gray-500 mb-6">Please provide your contact details</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                  <div className="flex">
                    <div className="relative w-24 mr-3">
                      <select className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white">
                        <option>+880</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="1XXXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travellers</label>
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 w-fit">
                    <button
                      type="button"
                      onClick={() => handleTravelerChange(false)}
                      disabled={formData.travelers <= 1}
                      className={`p-3 rounded-lg ${formData.travelers <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FaUserMinus size={18} />
                    </button>
                    <span className="mx-4 text-lg font-medium w-8 text-center">{formData.travelers}</span>
                    <button
                      type="button"
                      onClick={() => handleTravelerChange(true)}
                      className="p-3 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                      <FaUserPlus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                  Passport Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number *</label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Expiry Date *</label>
                    <input
                      type="date"
                      name="passportExpiry"
                      value={formData.passportExpiry}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="4"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>

            <div className="flex items-start mb-8">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 mr-3 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-purple-600 hover:underline font-medium">Terms & Conditions</a>, <a href="#" className="text-purple-600 hover:underline font-medium">Privacy Policy</a> and <a href="#" className="text-purple-600 hover:underline font-medium">Refund Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting || !user}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                isFormValid && user 
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {!user ? 'Sign In to Apply' : isSubmitting ? 'Processing...' : 'Submit Visa Request'}
            </button>
          </form>
        </div>
        </div>
        
        {/* Right Side - Price Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Price Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Visa Fee × {formData.travelers}</span>
                <span className="font-medium">
                  {(parseFloat(visaDetails.visaType.fee || 0) * formData.travelers).toFixed(2)} BDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee × {formData.travelers}</span>
                <span className="font-medium">
                  {(parseFloat(visaDetails.country.fee || 0) * formData.travelers).toFixed(2)} BDT
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">Total Payable</span>
                  <span className="font-bold text-xl text-purple-600">
                    {(
                      parseFloat(visaDetails.visaType.fee || 0) + 
                      parseFloat(visaDetails.country.fee || 0)
                    ) * formData.travelers} BDT
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-700">
                    Final price may vary based on individual traveler requirements and additional services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all max-w-2xl w-full">
            <div className="relative">
              {/* Banner Image */}
              <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <Image 
                  src={visaDetails.country.cover_image} 
                  alt={visaDetails.country.name} 
                  width={800}
                  height={400}
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
              
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <MdOutlineClose className="text-gray-600 text-xl" />
              </button>
            </div>
            
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <FaCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visa Request Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your {visaDetails.country.name} {visaDetails.visaType.type} application has been received. We'll process your request and notify you via email within 24-48 hours.
              </p>
              <div className="mt-8">
                <button
                  onClick={closeModal}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Go to My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to submit your visa application. You can continue with Google:
            </p>
            
            <div id="google-btn" className="flex justify-center mb-4"></div>
            
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full py-3 px-6 rounded-xl font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisaSubmissionPage;