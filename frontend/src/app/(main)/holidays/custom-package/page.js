// app/holidays/custom-package/page.js
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';

const HolidaysCustomPackage = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  
  const [formData, setFormData] = useState({
    destination: "",
    departurePlace: "",
    travelDate: new Date(),
    numberOfTravellers: 1,
    requirements: "",
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
      travelDate: formData.travelDate.toISOString()
    };
    localStorage.setItem('pendingCustomRequest', JSON.stringify(formDataToSave));
    localStorage.setItem('loginRedirect', '/holidays/custom-package');
    router.push('/auth/login');
  };

  // Load saved form data if returning from login
  useEffect(() => {
    if (isClient && authToken) {
      const savedFormData = localStorage.getItem('pendingCustomRequest');
      const loginRedirect = localStorage.getItem('loginRedirect');
      
      if (savedFormData && loginRedirect === '/holidays/custom-package') {
        const parsedData = JSON.parse(savedFormData);
        setFormData({
          ...parsedData,
          travelDate: new Date(parsedData.travelDate)
        });
        
        // Clear the saved data
        localStorage.removeItem('pendingCustomRequest');
        localStorage.removeItem('loginRedirect');
        
        Swal.fire({
          title: 'Welcome Back!',
          text: 'Your form data has been restored. You can now submit your request.',
          icon: 'success',
          confirmButtonColor: '#5A53A7'
        });
      }
    }
  }, [isClient, authToken]);

  const resetForm = () => {
    setFormData({
      destination: "",
      departurePlace: "",
      travelDate: new Date(),
      numberOfTravellers: 1,
      requirements: "",
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
        text: 'You need to be logged in to submit a custom holiday request. Please login to continue.',
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

    // Validate requirements field
    if (!formData.requirements.trim()) {
      Swal.fire({
        title: 'Requirements Needed',
        text: 'Please describe your holiday requirements',
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
        destination: formData.destination,
        departure_place: formData.departurePlace,
        travel_date: formData.travelDate.toISOString().split('T')[0],
        number_of_travelers: formData.numberOfTravellers,
        requirements: formData.requirements
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/custom-holiday-requests/`, {
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
          text: 'Thank you for your custom holiday request! Our experts will contact you soon.',
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
      description: "Complete the form with your travel preferences and requirements"
    },
    {
      number: "02",
      title: "Our Experts will contact you ASAP",
      description: "Our travel specialists will reach out to understand your needs"
    },
    {
      number: "03",
      title: "Then Book your dream holiday",
      description: "Finalize your perfect holiday package and start packing!"
    }
  ];

  // Show loading state while checking authentication
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Banner Section - Updated to match reference design */}
      <div className="relative w-full bg-white">
        {/* Background Image */}
        <div className="relative h-[300px] sm:h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/holidays-destination.avif')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
        </div>

        {/* Content - Positioned exactly like reference */}
        <div className="relative flex flex-col items-center justify-center h-[200px] sm:h-[400px] px-4 sm:px-[190px] -mt-[350px] sm:-mt-[450px]">
          <h1 className="text-white text-2xl sm:text-5xl font-bold mb-2 text-center">
            Create Your Dream Holiday
          </h1>
          <p className="text-white text-sm sm:text-xl text-center">
            Tell us what you desire and let our experts craft your perfect journey
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
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Holiday Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Destination */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Where do you want to go? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.destination}
                        onChange={(e) => handleChange('destination', e.target.value)}
                        placeholder="Enter your dream destination"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                      />
                    </div>

                    {/* Departure Place */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Where are you leaving from? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.departurePlace}
                        onChange={(e) => handleChange('departurePlace', e.target.value)}
                        placeholder="Your departure city"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                      />
                    </div>

                    {/* Travel Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        When do you plan to leave? <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.travelDate}
                        onChange={(date) => handleChange('travelDate', date)}
                        minDate={new Date()}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 transition-all duration-300"
                        placeholderText="Select travel date"
                        required
                      />
                    </div>

                    {/* Number of Travellers */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of travellers
                      </label>
                      <div className="relative">
                        <select
                          value={formData.numberOfTravellers}
                          onChange={(e) => handleChange('numberOfTravellers', parseInt(e.target.value))}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#5A53A7] focus:ring-2 focus:ring-[#5A53A7]/20 appearance-none bg-white transition-all duration-300"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Describe your Requirements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => handleChange('requirements', e.target.value)}
                      placeholder="Tell us about your preferences, budget, accommodation type, activities you're interested in, etc."
                      rows="4"
                      required
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
                    {isSubmitting ? 'Submitting...' : !authToken ? 'Login to Submit' : 'Submit Request'}
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
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                  <p className="text-white/80 text-lg">Our travel experts are here to assist you</p>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Hotline</div>
                    <a href="tel:+8809613131415" className="text-2xl font-semibold hover:text-white/90 transition-colors block">
                      +880 9613 131415
                    </a>
                  </div>

                  <div className="text-center pt-6 border-t border-white/20">
                    <p className="text-white/80 mb-4">Prefer to chat?</p>
                    <button className="w-full bg-white text-[#5A53A7] py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                      Live Chat Now
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

export default HolidaysCustomPackage;