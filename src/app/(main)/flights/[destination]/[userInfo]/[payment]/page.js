"use client";
import React, { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";

const PaymentPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [flight, setFlight] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment methods data
  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#5A53A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: "Pay with Visa, Mastercard, or American Express"
    },
    {
      id: "bKash",
      name: "bKash",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D81F26]" viewBox="0 0 48 48">
          <path fill="#D81F26" d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z"/>
          <path fill="#FFF" d="M30.6 16.5h-2.8c-1.2 0-2.2 1-2.2 2.2v10.6c0 1.2 1 2.2 2.2 2.2h2.8c1.2 0 2.2-1 2.2-2.2V18.7c0-1.2-1-2.2-2.2-2.2zM18.7 16.5h-2.8c-1.2 0-2.2 1-2.2 2.2v10.6c0 1.2 1 2.2 2.2 2.2h2.8c1.2 0 2.2-1 2.2-2.2V18.7c0-1.2-1-2.2-2.2-2.2z"/>
        </svg>
      ),
      description: "Pay with your bKash mobile wallet"
    },
    {
      id: "nagad",
      name: "Nagad",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#E31E25]" viewBox="0 0 48 48">
          <path fill="#E31E25" d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z"/>
          <path fill="#FFF" d="M24 14c5.52 0 10 4.48 10 10s-4.48 10-10 10-10-4.48-10-10 4.48-10 10-10zm0 16c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"/>
        </svg>
      ),
      description: "Pay with your Nagad mobile wallet"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#55C3A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      description: "Direct bank transfer"
    }
  ];

  // Load flight and user data
  React.useEffect(() => {
    // In a real app, you would fetch this data from your backend or context
    const mockFlight = {
      id: params.flightId,
      airline: {
        code: "AK",
        name: "Air Astra",
        logo: "/air-astra-logo.png",
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
    };

    const mockUserInfo = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+8801712345678",
      passport: "AB1234567",
      nationality: "Bangladeshi",
      dob: "1990-01-01",
    };

    setFlight(mockFlight);
    setUserInfo(mockUserInfo);
  }, [params.destination, params.flightId, searchParams]);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push(`/flights/${params.destination}/${params.flightId}/confirmation`);
    }, 2000);
  };

  if (!flight || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#5A53A7] to-[#55C3A9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f0f4f8]">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 font-bold">1</div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 1</p>
                <p className="text-sm font-medium">Passenger Details</p>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 mx-2">
              <div className="h-1 bg-[#5A53A7]" style={{ width: '100%' }}></div>
            </div>
            <div className="flex items-center">
              <div className="bg-[#5A53A7] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">2</div>
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
          {/* Booking Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-4">
              <div className="p-6 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white">
                <h2 className="text-xl font-bold mb-1">Booking Summary</h2>
                <p className="text-sm opacity-90">Review your booking details</p>
              </div>

              <div className="p-6">
                {/* Flight Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#445494] mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#5A53A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Flight Details
                  </h3>
                  <div className="flex items-center mb-3">
                    <img
                      src={flight.airline.logo}
                      alt={flight.airline.name}
                      className="h-10 w-10 object-contain mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-800">{flight.airline.name} {flight.flightNumber}</h4>
                      <p className="text-sm text-gray-600">{format(flight.departureTime, "EEE, MMM d")}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">{format(flight.departureTime, "h:mm a")}</p>
                      <p className="text-xs text-gray-500">{flight.departureAirport}</p>
                    </div>
                    <div className="mx-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#55C3A9]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{format(flight.arrivalTime, "h:mm a")}</p>
                      <p className="text-xs text-gray-500">{flight.arrivalAirport}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{flight.duration} • {flight.stops > 0 ? `${flight.stops} stop(s)` : 'Non-stop'}</p>
                </div>

                {/* Passenger Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#445494] mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#5A53A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Passenger
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-800">{userInfo.firstName} {userInfo.lastName}</p>
                    <p className="text-sm text-gray-600">{userInfo.email}</p>
                    <p className="text-sm text-gray-600 mt-1">{userInfo.phone}</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Passport: {userInfo.passport}</p>
                      <p className="text-xs text-gray-500">Nationality: {userInfo.nationality}</p>
                    </div>
                  </div>
                </div>

                {/* Fare Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-[#445494] mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#5A53A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fare Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Fare (1 Adult)</span>
                      <span className="font-medium">BDT {flight.selectedPackage.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">BDT 1,200</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-800 font-medium">Total Amount</span>
                      <span className="text-xl font-bold text-[#5A53A7]">BDT {flight.selectedPackage.price + 1200}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white">
                <h2 className="text-xl font-bold mb-1">Payment Method</h2>
                <p className="text-sm opacity-90">Select your preferred payment option</p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6">
                {/* Payment Methods */}
                <div className="mb-8 space-y-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedPayment === method.id ? 'border-[#5A53A7] bg-[#5A53A7]/10' : 'border-gray-200 hover:border-[#55C3A9]'}`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-4 ${selectedPayment === method.id ? 'bg-[#5A53A7] text-white' : 'bg-gray-100'}`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? 'border-[#5A53A7] bg-[#5A53A7]' : 'border-gray-300'}`}>
                          {selectedPayment === method.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Details (shown when card is selected) */}
                {selectedPayment === "card" && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#445494] mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="h-4 w-4 text-[#55C3A9] focus:ring-[#55C3A9] border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-[#5A53A7] hover:underline">Terms & Conditions</a> and authorize the payment of BDT {flight.selectedPackage.price + 1200} according to the <a href="#" className="text-[#5A53A7] hover:underline">Payment Terms</a>.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedPayment || isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition shadow-md flex items-center justify-center ${!selectedPayment ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] hover:opacity-90 text-white'}`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    `Pay BDT ${flight.selectedPackage.price + 1200}`
                  )}
                </button>

                {/* Security Info */}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#55C3A9]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Your payment is secure and encrypted
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;