"use client";
import React, { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";

const UserInfoPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [flight, setFlight] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    passport: "",
    nationality: "",
    dob: "",
    passportExpiry: "",
    specialRequests: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setFlight({
        id: params.flightId,
        airline: {
          code: "AK",
          name: "Air Astra",
          logo: "/flight/air-asia.webp",
        },
        flightNumber: `AK${Math.floor(Math.random() * 900) + 100}`,
        departureTime: new Date(searchParams.get("departure")),
        arrivalTime: new Date(new Date(searchParams.get("departure")).setHours(
          new Date().getHours() + 2
        )),
        duration: "1h 5m",
        price: 6199,
        stops: 0,
        departureAirport: searchParams.get("from"),
        arrivalAirport: params.destination,
        selectedPackage: {
          name: "Star Lite",
          cabinBag: "7 KG / Adult",
          checkedIn: "20 KG / Adult",
          cancellation: "As per Airlines Policy",
          dateChange: "As per Airlines Policy",
          meal: "Complementary meal included",
          price: 6199,
        },
      });
    }, 500);
  }, [params.destination, params.flightId, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "Required";
    if (!formData.lastName) newErrors.lastName = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.phone) newErrors.phone = "Required";
    if (!formData.passport) newErrors.passport = "Required";
    if (!formData.nationality) newErrors.nationality = "Required";
    if (!formData.dob) newErrors.dob = "Required";
    if (!formData.passportExpiry) newErrors.passportExpiry = "Required";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      router.push(`/flights/${params.destination}/${params.flightId}/payment`);
    }, 1000);
  };

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#5A53A7] to-[#55C3A9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f0f4f8]">
      {/* Progress Bar - Keep existing design */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#5A53A7] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">1</div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 1</p>
                <p className="text-sm font-medium">Passenger Details</p>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 mx-2">
              <div className="h-1 bg-[#5A53A7]" style={{ width: '33%' }}></div>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 font-bold">2</div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 2</p>
                <p className="text-sm font-medium">Payment</p>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 mx-2">
              <div className="h-1 bg-gray-200" style={{ width: '0%' }}></div>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 font-bold">3</div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 3</p>
                <p className="text-sm font-medium">Confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Summary Card - Keep existing design */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-4">
              <div className="p-6 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white">
                <h2 className="text-xl font-bold mb-1">Flight Summary</h2>
                <p className="text-sm opacity-90">Review your booking details</p>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Image width={50} height={50}
                    src={flight.airline.logo}
                    alt={flight.airline.name}
                    className="rounded object-contain mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {flight.airline.name} - {flight.flightNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(flight.departureTime, "EEE, MMM d")} • {flight.duration}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {format(flight.departureTime, "h:mm a")}
                    </p>
                    <p className="text-sm text-gray-500">{flight.departureAirport}</p>
                  </div>
                  <div className="mx-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#55C3A9]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {format(flight.arrivalTime, "h:mm a")}
                    </p>
                    <p className="text-sm text-gray-500">{flight.arrivalAirport}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Fare Package</span>
                    <span className="font-medium text-[#5A53A7]">{flight.selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Passengers</span>
                    <span className="font-medium">1 Adult</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Price</span>
                    <span className="text-xl font-bold text-[#5A53A7]">BDT {flight.selectedPackage.price}</span>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-[#445494] mb-2">Package Inclusions</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#55C3A9] mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {flight.selectedPackage.cabinBag}
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#55C3A9] mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {flight.selectedPackage.checkedIn}
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#55C3A9] mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {flight.selectedPackage.meal}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Form - Updated with validation and passport expiry */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white">
                <h2 className="text-xl font-bold mb-1">Passenger Details</h2>
                <p className="text-sm opacity-90">Enter traveler information as it appears on passport</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#445494] mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.dob ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality*</label>
                      <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.nationality ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      >
                        <option value="">Select Nationality</option>
                        <option value="Bangladeshi">Bangladeshi</option>
                        <option value="American">American</option>
                        <option value="British">British</option>
                        <option value="Canadian">Canadian</option>
                        <option value="Indian">Indian</option>
                      </select>
                      {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#445494] mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#445494] mb-4">Passport Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number*</label>
                      <input
                        type="text"
                        name="passport"
                        value={formData.passport}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.passport ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.passport && <p className="mt-1 text-sm text-red-600">{errors.passport}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date*</label>
                      <input
                        type="date"
                        name="passportExpiry"
                        value={formData.passportExpiry}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.passportExpiry ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                      />
                      {errors.passportExpiry && <p className="mt-1 text-sm text-red-600">{errors.passportExpiry}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#445494] mb-4">Special Requests</h3>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                    placeholder="Any special requests or requirements?"
                  ></textarea>
                </div>

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 text-[#55C3A9] focus:ring-[#55C3A9] border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-[#5A53A7] hover:underline">Terms & Conditions</a> and <a href="#" className="text-[#5A53A7] hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-bold shadow-md transition ${
                    isSubmitting 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] hover:opacity-90 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;