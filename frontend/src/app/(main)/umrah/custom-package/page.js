// app/umrah/custom-package/page.js
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';

const UmrahCustomPackage = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  
  const [formData, setFormData] = useState({
    packageType: "standard",
    departureDate: new Date(),
    duration: "7",
    numberOfPilgrims: 1,
    accommodationType: "3-star",
    specialRequirements: "",
    fullName: "",
    email: "",
    mobile: "+880 ",
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check for auth token on client side only
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoginRedirect = () => {
    // Save form data to localStorage before redirecting to login
    const formDataToSave = {
      ...formData,
      departureDate: formData.departureDate.toISOString()
    };
    localStorage.setItem('pendingUmrahRequest', JSON.stringify(formDataToSave));
    localStorage.setItem('loginRedirect', '/umrah/custom-package');
    router.push('/login');
  };

  // Load saved form data if returning from login
  useEffect(() => {
    if (isClient && authToken) {
      const savedFormData = localStorage.getItem('pendingUmrahRequest');
      const loginRedirect = localStorage.getItem('loginRedirect');
      
      if (savedFormData && loginRedirect === '/umrah/custom-package') {
        const parsedData = JSON.parse(savedFormData);
        setFormData({
          ...parsedData,
          departureDate: new Date(parsedData.departureDate)
        });
        
        // Clear the saved data
        localStorage.removeItem('pendingUmrahRequest');
        localStorage.removeItem('loginRedirect');
        
        Swal.fire({
          title: 'Welcome Back!',
          text: 'Your Umrah request data has been restored. You can now submit your request.',
          icon: 'success',
          confirmButtonColor: '#5A53A7'
        });
      }
    }
  }, [isClient, authToken]);

  const resetForm = () => {
    setFormData({
      packageType: "standard",
      departureDate: new Date(),
      duration: "7",
      numberOfPilgrims: 1,
      accommodationType: "3-star",
      specialRequirements: "",
      fullName: "",
      email: "",
      mobile: "+880 ",
      agreeToTerms: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!authToken) {
      Swal.fire({
        title: 'Login Required',
        text: 'You need to be logged in to submit a custom Umrah request. Please login to continue.',
        icon: 'warning',
        confirmButtonColor: '#5A53A7'
      }).then((result) => {
        if (result.isConfirmed) {
          handleLoginRedirect();
        }
      });
      return;
    }

    // Validate required fields
    if (!formData.agreeToTerms) {
      Swal.fire({
        title: 'Terms Required',
        text: 'Please accept the terms and conditions',
        icon: 'warning',
        confirmButtonColor: '#5A53A7'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const customRequestData = {
        contact_name: formData.fullName,
        email: formData.email,
        phone: formData.mobile.replace('+880 ', ''),
        package_type: formData.packageType,
        departure_date: formData.departureDate.toISOString().split('T')[0],
        duration: formData.duration,
        number_of_pilgrims: formData.numberOfPilgrims,
        accommodation_type: formData.accommodationType,
        special_requirements: formData.specialRequirements
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/custom-umrah-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify(customRequestData),
      });

      if (response.ok) {
        const result = await response.json();
        await Swal.fire({
          title: 'Request Submitted Successfully!',
          text: 'Thank you for your custom Umrah request! Our experts will contact you soon.',
          icon: 'success',
          confirmButtonColor: '#5A53A7'
        });
        
        // Reset form and redirect to home
        resetForm();
        router.push("/");
      } else {
        const errorData = await response.json();
        let errorMessage = 'Failed to submit request';
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          // Handle field validation errors
          const fieldErrors = Object.values(errorData).flat();
          errorMessage = fieldErrors.join(', ');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Submission error:', error);
      await Swal.fire({
        title: 'Submission Failed',
        text: error.message || 'Failed to submit request. Please try again.',
        icon: 'error',
        confirmButtonColor: '#5A53A7'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      number: "01",
      title: "Fill the form and tell us what you desire",
      description: "Complete the form with your spiritual journey preferences"
    },
    {
      number: "02",
      title: "Our Experts will contact you ASAP",
      description: "Our Umrah specialists will reach out to understand your needs"
    },
    {
      number: "03",
      title: "Then Book your dream Umrah",
      description: "Finalize your perfect spiritual journey and prepare for Hajj"
    }
  ];

  // Show loading state while checking authentication
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Banner Section - Updated to match reference design */}
      <div className="relative w-full bg-white">
        {/* Background Image */}
        <div className="relative h-[300px] sm:h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/umrah-destination.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
        </div>

        {/* Content - Positioned exactly like reference */}
        <div className="relative flex flex-col items-center justify-center h-[200px] sm:h-[400px] px-4 sm:px-[190px] -mt-[350px] sm:-mt-[450px]">
          <h1 className="text-white text-2xl sm:text-5xl font-bold mb-2 text-center">
            Custom Umrah Package
          </h1>
          <p className="text-white text-sm sm:text-xl text-center">
            Begin your spiritual journey with a personalized Umrah experience
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Process & Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              {/* Authentication Status */}
              {!authToken && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-800 text-sm">
                      You need to be logged in to submit a custom Umrah request.{" "}
                      <button 
                        onClick={handleLoginRedirect}
                        className="font-semibold underline hover:text-yellow-900"
                      >
                        Login here
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Process Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {steps.map((step, index) => (
                  <div key={index} className="text-center group">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                        {step.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-10 left-1/2 w-full h-1 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] transform translate-x-1/2 -z-10"></div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Information Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-gradient-to-r from-[#5A53A7]/5 to-[#55C3A9]/5 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Umrah Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Package Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Package Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.packageType}
                        onChange={(e) => handleChange('packageType', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 appearance-none bg-white transition-all duration-300"
                      >
                        <option value="standard">Standard Umrah</option>
                        <option value="premium">Premium Umrah</option>
                        <option value="deluxe">Deluxe Umrah</option>
                        <option value="family">Family Package</option>
                        <option value="group">Group Package</option>
                      </select>
                    </div>

                    {/* Departure Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preferred Departure Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.departureDate}
                        onChange={(date) => handleChange('departureDate', date)}
                        minDate={new Date()}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                        placeholderText="Select departure date"
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (Days) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 appearance-none bg-white transition-all duration-300"
                      >
                        <option value="7">7 Days</option>
                        <option value="10">10 Days</option>
                        <option value="14">14 Days</option>
                        <option value="21">21 Days</option>
                        <option value="custom">Custom Duration</option>
                      </select>
                    </div>

                    {/* Number of Pilgrims */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Pilgrims <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.numberOfPilgrims}
                        onChange={(e) => handleChange('numberOfPilgrims', parseInt(e.target.value))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 appearance-none bg-white transition-all duration-300"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num} Pilgrim{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Accommodation Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preferred Accommodation <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.accommodationType}
                        onChange={(e) => handleChange('accommodationType', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 appearance-none bg-white transition-all duration-300"
                      >
                        <option value="3-star">3 Star Hotel</option>
                        <option value="4-star">4 Star Hotel</option>
                        <option value="5-star">5 Star Hotel</option>
                        <option value="premium">Premium Hotel</option>
                        <option value="walking-distance">Walking Distance to Haram</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Requirements & Preferences
                    </label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) => handleChange('specialRequirements', e.target.value)}
                      placeholder="Tell us about any special needs, dietary requirements, preferred locations, budget constraints, etc."
                      rows="4"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300 resize-none"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-r from-[#5A53A7]/5 to-[#55C3A9]/5 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder="Your full name"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <div className="w-24 p-4 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 flex items-center justify-center text-gray-600">
                          +880
                        </div>
                        <input
                          type="tel"
                          required
                          value={formData.mobile.replace('+880 ', '')}
                          onChange={(e) => handleChange('mobile', '+880 ' + e.target.value)}
                          placeholder="XXXXXXXXXX"
                          pattern="[0-9]{10}"
                          className="flex-1 p-4 border-2 border-gray-200 rounded-r-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                      className="w-5 h-5 text-[#5A53A7] border-2 border-gray-300 rounded focus:ring-[#5A53A7]"
                    />
                    <span className="text-gray-700 text-sm">
                      By submitting a request, I accept Firsttrip's{' '}
                      <a href="/terms" className="text-[#5A53A7] hover:underline font-semibold">
                        Terms & Conditions
                      </a>
                      ,{' '}
                      <a href="/privacy" className="text-[#5A53A7] hover:underline font-semibold">
                        Privacy Policy
                      </a>{' '}
                      and{' '}
                      <a href="/refund" className="text-[#5A53A7] hover:underline font-semibold">
                        Refund Policy
                      </a>
                      .
                    </span>
                  </label>

                  <button
                    type={authToken ? "submit" : "button"}
                    onClick={!authToken ? handleLoginRedirect : undefined}
                    disabled={isSubmitting}
                    className={`px-12 py-4 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 min-w-[200px] ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : !authToken ? 'Login to Submit' : 'Request Umrah Package'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Fixed Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-[#5A53A7] to-[#55C3A9] rounded-2xl p-8 text-white shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Umrah Assistance</h3>
                  <p className="text-white/80 text-lg">Our Umrah experts are here to guide you</p>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Hotline</div>
                    <a href="tel:+8809613131415" className="text-2xl font-semibold hover:text-white/90 transition-colors block">
                      +880 9613 131415
                    </a>
                  </div>

                  <div className="text-center pt-6 border-t border-white/20">
                    <p className="text-white/80 mb-4">24/7 Umrah Support</p>
                    <button className="w-full bg-white text-[#5A53A7] py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                      Get Instant Help
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UmrahCustomPackage;