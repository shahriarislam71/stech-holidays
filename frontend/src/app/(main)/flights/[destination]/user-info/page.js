// app/flights/[user-info]/page.js
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import useAuth from "@/app/hooks/useAuth";
import { useExchangeRates } from "@/app/hooks/useExchangeRates";

const UserInfoPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
    const { formatPrice } = useExchangeRates();
  // Use the auth hook for authentication and profile data

    const formatFlightPrice = (price) => {
    return formatPrice(price, "flight", true);
  };
  const { user, isLoading: authLoading } = useAuth({ redirectToLogin: true });
  
  // Country code data with +880 as default
  const countryCodes = [
    { code: "+880", country: "Bangladesh" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+92", country: "Pakistan" },
    { code: "+971", country: "UAE" },
    { code: "+966", country: "Saudi Arabia" },
    { code: "+65", country: "Singapore" },
    { code: "+60", country: "Malaysia" },
    { code: "+61", country: "Australia" },
    { code: "+64", country: "New Zealand" },
    { code: "+33", country: "France" },
    { code: "+49", country: "Germany" },
    { code: "+81", country: "Japan" },
    { code: "+82", country: "South Korea" },
  ];

  // Currency conversion rate (GBP to BDT)


  // Function to extract numeric value and currency
  const parsePrice = (priceString) => {
    if (!priceString) {
      console.error("❌ Price string is empty");
      return { amount: 0, currency: "BDT" };
    }
    
    console.log("💰 Parsing price string:", priceString);
    
    let amount = 0;
    let currency = "BDT";
    
    try {
      if (!isNaN(parseFloat(priceString))) {
        amount = parseFloat(priceString);
        currency = "BDT";
      } else {
        const parts = priceString.trim().split(" ");
        
        if (parts.length >= 2) {
          const possibleCurrency = parts[0].toUpperCase();
          const possibleAmount = parts[1];
          
          if (["GBP", "BDT", "USD", "EUR"].includes(possibleCurrency) && !isNaN(parseFloat(possibleAmount))) {
            currency = possibleCurrency;
            amount = parseFloat(possibleAmount);
          } else {
            const possibleAmount = parts[0];
            const possibleCurrency = parts[1]?.toUpperCase();
            
            if (!isNaN(parseFloat(possibleAmount)) && ["GBP", "BDT", "USD", "EUR"].includes(possibleCurrency)) {
              amount = parseFloat(possibleAmount);
              currency = possibleCurrency;
            }
          }
        } else if (parts.length === 1 && !isNaN(parseFloat(parts[0]))) {
          amount = parseFloat(parts[0]);
          currency = "BDT";
        }
      }
      
      if (currency === "GBP") {
        amount = amount * GBP_TO_BDT_RATE;
        currency = "BDT";
      }
      
      console.log(`✅ Parsed price: ${amount} ${currency}`);
      
    } catch (error) {
      console.error("❌ Error parsing price:", error);
      amount = 0;
      currency = "BDT";
    }
    
    return {
      amount: parseFloat(amount.toFixed(2)),
      currency: currency
    };
  };

  // Extract flight data from URL parameters including passenger_ids
  const flightData = {
    offer_id: searchParams.get("offer_id"),
    fare_name: searchParams.get("fare_name"),
    price: searchParams.get("price"),
    airline: searchParams.get("airline"),
    flight_number: searchParams.get("flight_number"),
    departure: searchParams.get("departure"),
    arrival: searchParams.get("arrival"),
    departure_time: searchParams.get("departure_time"),
    arrival_time: searchParams.get("arrival_time"),
    duration: searchParams.get("duration"),
    cabin_class: searchParams.get("cabin_class"),
    travelers: parseInt(searchParams.get("travelers")) || 1,
    flight_type: searchParams.get("flight_type"),
    adults: parseInt(searchParams.get("adults")) || 1,
    children: parseInt(searchParams.get("children")) || 0,
    infants: parseInt(searchParams.get("infants")) || 0,
    passenger_ids: searchParams.get("passenger_ids") 
      ? searchParams.get("passenger_ids").split(',') 
      : []
  };

  // Calculate total passengers
  const totalPassengers =
    flightData.adults + flightData.children + flightData.infants;

  // Form state for all passengers
  const [passengers, setPassengers] = useState([]);
  // State for phone country codes for each passenger
  const [phoneCountryCodes, setPhoneCountryCodes] = useState([]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+\d\s\-\(\)]{10,20}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s\-\.\']+$/;
    return nameRegex.test(name) && name.length >= 2;
  };

  const validatePassportNumber = (number) => {
    const passportRegex = /^[a-zA-Z0-9\-\s]{3,}$/;
    return passportRegex.test(number);
  };

  const validateDate = (dateString, isFutureAllowed = false) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) return false;
    if (!isFutureAllowed && date > today) return false;

    return true;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validatePassengerByType = (passenger, born_on) => {
    const age = calculateAge(born_on);
    const type = passenger.type;

    switch (type) {
      case "adult":
        return age >= 18;
      case "child":
        return age >= 2 && age < 12;
      case "infant":
        return age < 2;
      default:
        return true;
    }
  };

  // Real-time validation for a field
  const validateField = (passengerIndex, field, value, isDocument = false) => {
    const newErrors = { ...errors };
    if (!newErrors[passengerIndex]) newErrors[passengerIndex] = {};

    const passenger = passengers[passengerIndex];

    switch (field) {
      case "given_name":
      case "family_name":
        if (!value.trim()) {
          newErrors[passengerIndex][field] = "Required";
        } else if (!validateName(value)) {
          newErrors[passengerIndex][field] =
            "Only letters, spaces, hyphens, dots and apostrophes allowed";
        } else {
          delete newErrors[passengerIndex][field];
        }
        break;

      case "born_on":
        if (!value) {
          newErrors[passengerIndex][field] = "Required";
        } else if (!validateDate(value)) {
          newErrors[passengerIndex][field] = "Date cannot be in future";
        } else if (!validatePassengerByType(passenger, value)) {
          const type = passenger.type;
          if (type === "adult") {
            newErrors[passengerIndex][field] = "Must be 18 years or older";
          } else if (type === "child") {
            newErrors[passengerIndex][field] = "Must be between 2 and 11 years";
          } else if (type === "infant") {
            newErrors[passengerIndex][field] = "Must be under 2 years";
          }
        } else {
          delete newErrors[passengerIndex][field];
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors[passengerIndex][field] = "Required";
        } else if (!validateEmail(value)) {
          newErrors[passengerIndex][field] = "Invalid email format";
        } else {
          delete newErrors[passengerIndex][field];
        }
        break;

      case "phone_number":
        if (!value.trim()) {
          newErrors[passengerIndex][field] = "Required";
        } else if (!validatePhone(value)) {
          newErrors[passengerIndex][field] = "Invalid phone number";
        } else {
          delete newErrors[passengerIndex][field];
        }
        break;

      case "number": // Passport number
        if (!value.trim()) {
          newErrors[passengerIndex]["passport_number"] = "Required";
        } else if (!validatePassportNumber(value)) {
          newErrors[passengerIndex]["passport_number"] =
            "Invalid passport number";
        } else {
          delete newErrors[passengerIndex]["passport_number"];
        }
        break;

      case "expires_on":
        if (!value) {
          newErrors[passengerIndex]["passport_expiry"] = "Required";
        } else if (!validateDate(value, true)) {
          newErrors[passengerIndex]["passport_expiry"] = "Invalid date";
        } else if (new Date(value) <= new Date()) {
          newErrors[passengerIndex]["passport_expiry"] =
            "Passport must not be expired";
        } else {
          delete newErrors[passengerIndex]["passport_expiry"];
        }
        break;

      default:
        if (!value) {
          newErrors[passengerIndex][field] = "Required";
        } else {
          delete newErrors[passengerIndex][field];
        }
    }

    setErrors(newErrors);
  };

  // Function to get profile data and autofill first passenger
  const autofillFromProfile = () => {
    if (!user) return;

    setPassengers(prev => {
      if (prev.length === 0) return prev;
      
      const updated = [...prev];
      const firstPassenger = updated[0];
      
      // Fill first passenger with profile data
      updated[0] = {
        ...firstPassenger,
        title: user.title || firstPassenger.title,
        given_name: user.first_name || firstPassenger.given_name,
        family_name: user.last_name || firstPassenger.family_name,
        email: user.email || firstPassenger.email,
        // Parse date if available in profile
        born_on: user.date_of_birth ? format(new Date(user.date_of_birth), 'yyyy-MM-dd') : firstPassenger.born_on,
        gender: user.gender || firstPassenger.gender,
        // Add phone with country code
        phone_number: user.phone ? `${user.phone_country_code || '+880'} ${user.phone}` : firstPassenger.phone_number
      };

      // Update country code for first passenger
      setPhoneCountryCodes(prevCodes => {
        const newCodes = [...prevCodes];
        newCodes[0] = user.phone_country_code || '+880';
        return newCodes;
      });

      // Update passport information if available in profile
      if (user.passport_number && firstPassenger.identity_documents.length > 0) {
        updated[0].identity_documents[0] = {
          ...firstPassenger.identity_documents[0],
          number: user.passport_number,
          issuing_country_code: user.passport_issuing_country || 'BD',
          expires_on: user.passport_expiry ? format(new Date(user.passport_expiry), 'yyyy-MM-dd') : ''
        };
      }

      return updated;
    });
  };

  // Initialize passengers based on traveler counts
  useEffect(() => {
    if (authLoading) return;

    const initialPassengers = [];
    const initialCountryCodes = [];
    let passengerIndex = 0;

    // Add adults
    for (let i = 0; i < flightData.adults; i++) {
      initialPassengers.push({
        id: flightData.passenger_ids[i] || `passenger_${passengerIndex++}`,
        type: "adult",
        title: "",
        given_name: "",
        family_name: "",
        born_on: "",
        gender: "",
        email: "",
        phone_number: "",
        identity_documents: [
          {
            type: "passport",
            number: "",
            issuing_country_code: "BD",
            expires_on: "",
            unique_identifier: "",
          },
        ],
      });
      // Set default country code for each passenger
      initialCountryCodes.push("+880");
    }

    // Add children
    for (let i = 0; i < flightData.children; i++) {
      const childIndex = flightData.adults + i;
      initialPassengers.push({
        id: flightData.passenger_ids[childIndex] || `passenger_${passengerIndex++}`,
        type: "child",
        title: "",
        given_name: "",
        family_name: "",
        born_on: "",
        gender: "",
        email: "",
        phone_number: "",
        identity_documents: [
          {
            type: "passport",
            number: "",
            issuing_country_code: "BD",
            expires_on: "",
            unique_identifier: "",
          },
        ],
      });
      initialCountryCodes.push("+880");
    }

    // Add infants
    for (let i = 0; i < flightData.infants; i++) {
      const infantIndex = flightData.adults + flightData.children + i;
      initialPassengers.push({
        id: flightData.passenger_ids[infantIndex] || `passenger_${passengerIndex++}`,
        type: "infant",
        title: "",
        given_name: "",
        family_name: "",
        born_on: "",
        gender: "",
        email: "",
        phone_number: "",
        identity_documents: [
          {
            type: "passport",
            number: "",
            issuing_country_code: "BD",
            expires_on: "",
            unique_identifier: "",
          },
        ],
      });
      initialCountryCodes.push("+880");
    }

    setPassengers(initialPassengers);
    setPhoneCountryCodes(initialCountryCodes);
    
    // Autofill from profile if user exists
    if (user) {
      // Small delay to ensure state is set before autofilling
      setTimeout(() => {
        autofillFromProfile();
      }, 100);
    }
  }, [user, authLoading]);

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Only validate if field has been touched
    if (touched[`${index}_${field}`]) {
      validateField(index, field, value);
    }
  };

  // Update phone with country code
  const updatePhoneWithCountryCode = (index, countryCode, phoneNumber) => {
    setPhoneCountryCodes(prev => {
      const newCodes = [...prev];
      newCodes[index] = countryCode;
      return newCodes;
    });
    
    // Update the phone number in passengers state
    updatePassenger(index, "phone_number", `${countryCode} ${phoneNumber}`);
  };

  const updatePassengerDocument = (passengerIndex, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      const updatedDocs = [...updated[passengerIndex].identity_documents];
      updatedDocs[0] = { ...updatedDocs[0], [field]: value };
      updated[passengerIndex] = {
        ...updated[passengerIndex],
        identity_documents: updatedDocs
      };
      return updated;
    });

    // Only validate if field has been touched
    if (touched[`${passengerIndex}_doc_${field}`]) {
      validateField(passengerIndex, field, value, true);
    }
  };

  const handleBlur = (passengerIndex, field, isDocument = false) => {
    setTouched((prev) => ({
      ...prev,
      [isDocument
        ? `${passengerIndex}_doc_${field}`
        : `${passengerIndex}_${field}`]: true,
    }));

    const passenger = passengers[passengerIndex];
    const value = isDocument
      ? passenger.identity_documents[0][field]
      : passenger[field];

    validateField(passengerIndex, field, value, isDocument);
  };

  const generateUniqueIdentifier = (passengerIndex) => {
    const passenger = passengers[passengerIndex];
    const document = passenger.identity_documents[0];
    if (document.number && document.type) {
      return `${document.type}_${
        document.number
      }_${Date.now()}_${passengerIndex}`;
    }
    return `passport_${Date.now()}_${passengerIndex}`;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    passengers.forEach((passenger, index) => {
      const passengerErrors = {};

      // Validate basic fields
      const fieldsToValidate = [
        "title",
        "given_name",
        "family_name",
        "born_on",
        "gender",
        "email",
        "phone_number",
      ];

      fieldsToValidate.forEach((field) => {
        if (!passenger[field]) {
          passengerErrors[field] = "Required";
          isValid = false;
        }
      });

      // Validate names
      if (passenger.given_name && !validateName(passenger.given_name)) {
        passengerErrors.given_name = "Invalid name format";
        isValid = false;
      }

      if (passenger.family_name && !validateName(passenger.family_name)) {
        passengerErrors.family_name = "Invalid name format";
        isValid = false;
      }

      // Validate email
      if (passenger.email && !validateEmail(passenger.email)) {
        passengerErrors.email = "Invalid email format";
        isValid = false;
      }

      // Validate phone (remove country code prefix for validation)
      const phoneWithoutCountryCode = passenger.phone_number?.replace(/^\+\d+\s/, '');
      if (phoneWithoutCountryCode && !validatePhone(phoneWithoutCountryCode)) {
        passengerErrors.phone_number = "Invalid phone number";
        isValid = false;
      }

      // Validate date of birth and passenger type
      if (passenger.born_on) {
        if (!validateDate(passenger.born_on)) {
          passengerErrors.born_on = "Invalid date of birth";
          isValid = false;
        } else if (!validatePassengerByType(passenger, passenger.born_on)) {
          const type = passenger.type;
          if (type === "adult") {
            passengerErrors.born_on = "Must be 18 years or older";
          } else if (type === "child") {
            passengerErrors.born_on = "Must be between 2 and 11 years";
          } else if (type === "infant") {
            passengerErrors.born_on = "Must be under 2 years";
          }
          isValid = false;
        }
      }

      // Validate passport documents
      const document = passenger.identity_documents[0];
      const docFieldsToValidate = [
        "number",
        "issuing_country_code",
        "expires_on",
      ];

      docFieldsToValidate.forEach((field) => {
        if (!document[field]) {
          passengerErrors[`passport_${field}`] = "Required";
          isValid = false;
        }
      });

      if (document.number && !validatePassportNumber(document.number)) {
        passengerErrors.passport_number = "Invalid passport number";
        isValid = false;
      }

      if (document.expires_on && new Date(document.expires_on) <= new Date()) {
        passengerErrors.passport_expiry = "Passport must not be expired";
        isValid = false;
      }

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Updated handlePayment function
  const handlePayment = async (e) => {
    e.preventDefault();

    // Check authentication
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push("/login?redirect=" + encodeURIComponent(currentUrl));
      return;
    }

    if (!validateForm()) {
      alert("Please fix all validation errors before proceeding with payment");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("authToken");

      const passenger_ids = flightData.passenger_ids.length > 0 
        ? flightData.passenger_ids 
        : passengers.map(passenger => passenger.id);
        
const priceInfo = parsePrice(flightData.price);

      // Prepare payment payload
      const paymentPayload = {
  total_amount: priceInfo.amount.toString(),
          currency: priceInfo.currency,
        offer_id: flightData.offer_id,
        passenger_ids: passenger_ids,
        passengers: passengers.map((passenger, index) => ({
          id: passenger_ids[index] || passenger.id,
          title: passenger.title,
          given_name: passenger.given_name.trim(),
          family_name: passenger.family_name.trim(),
          born_on: passenger.born_on,
          gender: passenger.gender,
          email: passenger.email.trim(),
          phone_number: passenger.phone_number.trim(),
          identity_documents: passenger.identity_documents.map((doc) => ({
            ...doc,
            number: doc.number.trim(),
            issuing_country_code: doc.issuing_country_code.trim().toUpperCase(),
            unique_identifier:
              doc.unique_identifier || generateUniqueIdentifier(index),
          })),
        })),
        cus_name: `${passengers[0].given_name} ${passengers[0].family_name}`,
        email: passengers[0].email,
        cus_phone: passengers[0].phone_number,
        cus_add1: "Flight Booking Address",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1207",
        cus_country: "Bangladesh",
      };

      console.log("🔄 Initiating flight payment with payload:", paymentPayload);

      // Call payment initiation API
      const response = await fetch(`${apiUrl}/flights/payments/initiate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(paymentPayload),
      });

      const data = await response.json();
      console.log("📥 Payment initiation response:", data);

      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("❌ Payment initiation error:", error);
      alert(`Payment initiation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPassengerTypeLabel = (type, index) => {
    const typeLabels = {
      adult: `Adult ${index + 1}`,
      child: `Child ${index - flightData.adults + 1}`,
      infant: `Infant ${index - flightData.adults - flightData.children + 1}`,
    };
    return typeLabels[type] || type;
  };

  // Get today's date in YYYY-MM-DD format for date input max attributes
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get max birth date based on passenger type
  const getMaxBirthDate = (passengerType) => {
    const today = new Date();
    if (passengerType === "adult") {
      const minAdultDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return minAdultDate.toISOString().split("T")[0];
    } else if (passengerType === "child") {
      const minChildDate = new Date(
        today.getFullYear() - 12,
        today.getMonth(),
        today.getDate()
      );
      return minChildDate.toISOString().split("T")[0];
    }
    return getTodayDate();
  };

  // Get min birth date based on passenger type
  const getMinBirthDate = (passengerType) => {
    const today = new Date();
    if (passengerType === "infant") {
      const maxInfantDate = new Date(
        today.getFullYear() - 2,
        today.getMonth(),
        today.getDate()
      );
      return maxInfantDate.toISOString().split("T")[0];
    } else if (passengerType === "child") {
      const maxChildDate = new Date(
        today.getFullYear() - 2,
        today.getMonth(),
        today.getDate()
      );
      return maxChildDate.toISOString().split("T")[0];
    }
    const minDate = new Date(
      today.getFullYear() - 120,
      today.getMonth(),
      today.getDate()
    );
    return minDate.toISOString().split("T")[0];
  };

  // Show loading if checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f0f4f8]">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#5A53A7] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 1</p>
                <p className="text-sm font-medium">Passenger Details</p>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 mx-2">
              <div className="h-1 bg-[#5A53A7]" style={{ width: "33%" }}></div>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 font-bold">
                2
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 2</p>
                <p className="text-sm font-medium">Payment</p>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 mx-2">
              <div className="h-1 bg-gray-200" style={{ width: "0%" }}></div>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 font-bold">
                3
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-500">Step 3</p>
                <p className="text-sm font-medium">Confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Profile Autofill Button */}
        {user && passengers.length > 0 && (
          <div className="mb-6">
            <button
              type="button"
              onClick={autofillFromProfile}
              className="inline-flex items-center px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4488] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Fill from Profile
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Auto-fill first passenger information from your profile
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-4">
              <div className="p-6 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] text-white">
                <h2 className="text-xl font-bold mb-1">Flight Summary</h2>
                <p className="text-sm opacity-90">{flightData.fare_name}</p>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 rounded-lg p-3 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-[#5A53A7]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {flightData.airline}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Flight {flightData.flight_number}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {flightData.departure_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      {flightData.departure}
                    </p>
                  </div>
                  <div className="mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#55C3A9]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {flightData.arrival_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      {flightData.arrival}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{flightData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cabin Class</span>
                    <span className="font-medium">
                      {flightData.cabin_class}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers</span>
                    <span className="font-medium">
                      {totalPassengers} traveler(s)
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-800 font-medium">
                      Total Price
                    </span>
                    <span className="text-xl font-bold text-[#5A53A7]">
  {formatFlightPrice(flightData.price)}
</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Forms */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment}>
              {passengers.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6"
                >
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-[#445494]">
                      {getPassengerTypeLabel(passenger.type, index)}
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        (
                        {passenger.type.charAt(0).toUpperCase() +
                          passenger.type.slice(1)}
                        )
                      </span>
                    </h3>
                    {passenger.type === "adult" && (
                      <p className="text-sm text-gray-500 mt-1">
                        Must be 18 years or older
                      </p>
                    )}
                    {passenger.type === "child" && (
                      <p className="text-sm text-gray-500 mt-1">
                        Must be between 2 and 11 years
                      </p>
                    )}
                    {passenger.type === "infant" && (
                      <p className="text-sm text-gray-500 mt-1">
                        Must be under 2 years
                      </p>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Personal Information */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-4">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title*
                          </label>
                          <select
                            value={passenger.title}
                            onChange={(e) =>
                              updatePassenger(index, "title", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "title")}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.title
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                          >
                            <option value="">Select Title</option>
                            <option value="mr">Mr</option>
                            <option value="ms">Ms</option>
                            <option value="mrs">Mrs</option>
                            <option value="miss">Miss</option>
                            <option value="dr">Dr</option>
                          </select>
                          {errors[index]?.title && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].title}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender*
                          </label>
                          <select
                            value={passenger.gender}
                            onChange={(e) =>
                              updatePassenger(index, "gender", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "gender")}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.gender
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                          >
                            <option value="">Select Gender</option>
                            <option value="m">Male</option>
                            <option value="f">Female</option>
                          </select>
                          {errors[index]?.gender && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].gender}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name*
                          </label>
                          <input
                            type="text"
                            value={passenger.given_name}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "given_name",
                                e.target.value
                              )
                            }
                            onBlur={() => handleBlur(index, "given_name")}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.given_name
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                            placeholder="As shown on passport"
                          />
                          {errors[index]?.given_name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].given_name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name*
                          </label>
                          <input
                            type="text"
                            value={passenger.family_name}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "family_name",
                                e.target.value
                              )
                            }
                            onBlur={() => handleBlur(index, "family_name")}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.family_name
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                            placeholder="As shown on passport"
                          />
                          {errors[index]?.family_name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].family_name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth*
                          </label>
                          <input
                            type="date"
                            value={passenger.born_on}
                            onChange={(e) =>
                              updatePassenger(index, "born_on", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "born_on")}
                            min={getMinBirthDate(passenger.type)}
                            max={getMaxBirthDate(passenger.type)}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.born_on
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                          />
                          {errors[index]?.born_on && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].born_on}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-4">
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email*
                          </label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) =>
                              updatePassenger(index, "email", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "email")}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.email
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                            placeholder="email@example.com"
                          />
                          {errors[index]?.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number*
                          </label>
                          <div className="flex gap-2">
                            <div className="w-1/3">
                              <select
                                value={phoneCountryCodes[index] || "+880"}
                                onChange={(e) => {
                                  const countryCode = e.target.value;
                                  // Extract current phone number without country code
                                  const currentPhone = passenger.phone_number?.replace(/^\+\d+\s/, '') || '';
                                  updatePhoneWithCountryCode(index, countryCode, currentPhone);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition"
                              >
                                {countryCodes.map((country) => (
                                  <option key={country.code} value={country.code}>
                                    {country.code} ({country.country})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <input
                                type="tel"
                                value={passenger.phone_number?.replace(/^\+\d+\s/, '') || ''}
                                onChange={(e) => {
                                  const phoneNumber = e.target.value;
                                  updatePhoneWithCountryCode(
                                    index, 
                                    phoneCountryCodes[index] || "+880", 
                                    phoneNumber
                                  );
                                }}
                                onBlur={() => handleBlur(index, "phone_number")}
                                className={`w-full px-4 py-2 border ${
                                  errors[index]?.phone_number
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                                placeholder="1712345678"
                              />
                              {errors[index]?.phone_number && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors[index].phone_number}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Format: Country code + phone number
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Passport Information */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-4">
                        Passport Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passport Number*
                          </label>
                          <input
                            type="text"
                            value={
                              passenger.identity_documents[0]?.number || ""
                            }
                            onChange={(e) =>
                              updatePassengerDocument(
                                index,
                                "number",
                                e.target.value
                              )
                            }
                            onBlur={() => handleBlur(index, "number", true)}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.passport_number
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                            placeholder="AB1234567"
                          />
                          {errors[index]?.passport_number && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].passport_number}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issuing Country*
                          </label>
                          <select
                            value={
                              passenger.identity_documents[0]
                                ?.issuing_country_code || ""
                            }
                            onChange={(e) =>
                              updatePassengerDocument(
                                index,
                                "issuing_country_code",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              handleBlur(index, "issuing_country_code", true)
                            }
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.issuing_country
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                          >
                            <option value="">Select Country</option>
                            <option value="BD">Bangladesh</option>
                            <option value="US">United States</option>
                            <option value="GB">United Kingdom</option>
                            <option value="CA">Canada</option>
                            <option value="IN">India</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IT">Italy</option>
                            <option value="JP">Japan</option>
                          </select>
                          {errors[index]?.issuing_country && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].issuing_country}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date*
                          </label>
                          <input
                            type="date"
                            value={
                              passenger.identity_documents[0]?.expires_on || ""
                            }
                            onChange={(e) =>
                              updatePassengerDocument(
                                index,
                                "expires_on",
                                e.target.value
                              )
                            }
                            onBlur={() => handleBlur(index, "expires_on", true)}
                            min={getTodayDate()}
                            className={`w-full px-4 py-2 border ${
                              errors[index]?.passport_expiry
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-[#55C3A9] focus:border-[#55C3A9] outline-none transition`}
                          />
                          {errors[index]?.passport_expiry && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[index].passport_expiry}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 text-[#55C3A9] focus:ring-[#55C3A9] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-[#5A53A7] hover:underline">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#5A53A7] hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-bold shadow-md transition ${
                    isSubmitting
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] hover:opacity-90 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;