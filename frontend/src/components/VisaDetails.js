"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaFileAlt, FaClock, 
         FaCalendarAlt, FaMoneyBillWave, FaPassport, FaHotel, FaPlane, FaSearch } from 'react-icons/fa';

const VisaDetails = ({ countryData }) => {
  const router = useRouter();
  const [activeVisaType, setActiveVisaType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color constants
  const colors = {
    primary: '#55C3A9',
    secondary: '#5A53A7',
    textDark: '#333333',
    textNavy: '#445494',
    accent: '#54ACA4',
    white: '#FFFFFF'
  };

  // Fetch visa types for this country
useEffect(() => {
  const fetchVisaTypes = async () => {
    try {
      if (!countryData?.slug) return;
      
      // First fetch country details by slug
      const countryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/${countryData.slug}/`
      );
      if (!countryResponse.ok) throw new Error('Failed to fetch country details');
      const countryDetails = await countryResponse.json(); // Changed variable name here
      
      // Then fetch visa types for this country
      const visaTypesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/${countryDetails.slug}/visa-types/`
      );
      if (!visaTypesResponse.ok) throw new Error('Failed to fetch visa types');
      const visaTypesData = await visaTypesResponse.json();
      
      setVisaTypes(visaTypesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchVisaTypes();
}, [countryData]);
  const currentVisa = visaTypes.find(visa => visa.type === activeVisaType) || {
    type: '',
    description: '',
    processing_time: '',
    validity: '',
    entry_type: '',
    fee: 0,
    requirements: [],
    policies: [],
    guidelines: {
      whoCanApply: [],
      requiredDocuments: [],
      additionalInfo: ''
    }
  };

  const getRequirements = () => {
    if (!currentVisa.requirements) return [];
    if (Array.isArray(currentVisa.requirements)) return currentVisa.requirements;
    if (typeof currentVisa.requirements === 'string') {
      try {
        return JSON.parse(currentVisa.requirements);
      } catch {
        return currentVisa.requirements.split('\n').filter(Boolean);
      }
    }
    return [];
  };

  const requirements = getRequirements();

  // Filter visas based on search query
  const filteredVisas = visaTypes.filter(visa => 
    visa.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (visa.description && visa.description.toLowerCase().includes(searchQuery.toLowerCase())));
  
  const openModal = (visa) => {
    setSelectedVisa(visa);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleApplyNow = (visaId) => {
    router.push(`/visa/${countryData?.slug || 'country'}/${visaId}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A53A7]"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#5A53A7] text-white rounded hover:bg-[#4a4791] transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!visaTypes.length) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Visa Types Available</h2>
        <p className="text-gray-600">No visa information is currently available for this country.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search visa types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 pr-16 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7] focus:border-transparent shadow-sm"
            style={{ color: colors.textDark }}
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
            style={{ backgroundColor: colors.secondary }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Hero Banner */}
<div className="relative h-80 rounded-2xl overflow-hidden mb-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
  {countryData.cover_image ? (
    <Image
      src={countryData.cover_image}
      alt="Visa Banner"
      fill
      className="object-cover opacity-70"
      priority
    />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-r from-[#5A53A7] to-[#445494]"></div>
  )}
  <div className="absolute inset-0 flex items-end p-8">
    <div className="text-white">
      <p className="text-sm uppercase tracking-wider mb-2 opacity-90">Travel Documentation</p>
      <h1 className="text-4xl md:text-5xl font-bold mb-2">Visa Requirements for {countryData?.name || 'Your Destination'}</h1>
      <p className="text-lg opacity-90 max-w-2xl">Everything you need to know about visas, requirements, and application process</p>
    </div>
  </div>
</div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Visa Type Selector */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setActiveVisaType('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                activeVisaType === 'all'
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeVisaType === 'all' ? { background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` } : {}}
            >
              All Visas
            </button>
            
            {visaTypes.map((visa, index) => (
              <button
                key={index}
                onClick={() => setActiveVisaType(visa.type)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  activeVisaType === visa.type
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={activeVisaType === visa.type ? { backgroundColor: colors.primary } : {}}
              >
                {visa.type}
              </button>
            ))}
          </div>

          {/* Visa Cards - Single Column Layout */}
          <div className="space-y-6 mb-8">
            {activeVisaType === 'all' ? (
              filteredVisas.map((visa, index) => (

                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-64 md:h-auto md:w-1/3">
                      <Image
                        src={visa.image}
                        alt={visa.type}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{visa.type}</h3>
                      <p className="text-gray-600 mb-4">{visa.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Processing Time</p>
                          <p className="font-medium" style={{ color: colors.textNavy }}>{visa.processing_time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Validity</p>
                          <p className="font-medium" style={{ color: colors.textNavy }}>{visa.validity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Entry Type</p>
                          <p className="font-medium" style={{ color: colors.textNavy }}>{visa.entry_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fees</p>
                          <p className="font-medium" style={{ color: colors.textNavy }}>${visa.fee}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-right">
                          <p className="text-gray-700 font-medium">
                            Total: <span className="font-bold text-lg" style={{ color: colors.primary }}>
                              {visa.fee} 
                              <span className="text-sm font-normal"> + {visa.serviceCharge} service</span>
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => openModal(visa)}
                          className="px-6 py-2 rounded-lg font-medium border transition-colors hover:bg-[#55C3A9] hover:text-white"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                            backgroundColor: 'transparent'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Single Visa Detail Card */
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-64 md:h-auto md:w-1/3">
                    <Image
                      src={currentVisa.image}
                      alt={currentVisa.type}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentVisa.type}</h2>
                    <p className="text-gray-600 mb-4">{currentVisa.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Processing Time</p>
                        <p className="font-medium" style={{ color: colors.textNavy }}>{currentVisa.processing_time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Validity</p>
                        <p className="font-medium" style={{ color: colors.textNavy }}>{currentVisa.validity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Entry Type</p>
                        <p className="font-medium" style={{ color: colors.textNavy }}>{currentVisa.entry_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fees</p>
                        <p className="font-medium" style={{ color: colors.textNavy }}>${currentVisa.fee}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-right">
                        <p className="text-gray-700 font-medium">
                          Total: <span className="font-bold text-lg" style={{ color: colors.primary }}>
                            {currentVisa.fee} 
                            <span className="text-sm font-normal"> + {currentVisa.serviceCharge} service</span>
                          </span>
                        </p>
                      </div>
                      <button 
                        onClick={() => handleApplyNow(currentVisa.id)}
                        className="px-6 py-2 rounded-lg font-medium text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information Sections - Only shown for single visa view */}
          {activeVisaType !== 'all' && (
            <div className="space-y-6">
       
                      <CollapsibleSection 
                title="Requirements"
                icon={<FaInfoCircle style={{ color: colors.primary }} />}
              >
                {currentVisa.requirements?.length > 0 ? (
                  <div className="space-y-4">
                    {currentVisa.requirements.map((requirement, index) => (
                      <p key={index} className="text-gray-700 pl-2 border-l-4 pl-4" style={{ borderColor: colors.accent }}>
                        {requirement}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No policies specified</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection 
                title="Policies"
                icon={<FaInfoCircle style={{ color: colors.primary }} />}
              >
                {currentVisa.policies?.length > 0 ? (
                  <div className="space-y-4">
                    {currentVisa.policies.map((policy, index) => (
                      <p key={index} className="text-gray-700 pl-2 border-l-4 pl-4" style={{ borderColor: colors.accent }}>
                        {policy}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No policies specified</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection 
                title="Application Guidelines"
                icon={<FaPassport style={{ color: colors.primary }} />}
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-3 text-lg">
                      <span className="p-1.5 rounded-full" style={{ backgroundColor: colors.accent }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Who can Apply?
                    </h3>
                    {currentVisa.guidelines?.whoCanApply?.length > 0 ? (
                      <ul className="space-y-3 pl-7">
                        {currentVisa.guidelines.whoCanApply.map((item, index) => (
                          <li key={index} className="relative before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full" style={{ color: colors.textDark, backgroundColor: colors.primary }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No eligibility criteria specified</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-3 text-lg">
                      <span className="p-1.5 rounded-full" style={{ backgroundColor: colors.accent }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Required Documents
                    </h3>
                    {currentVisa.guidelines?.requiredDocuments?.length > 0 ? (
                      <ul className="space-y-3 pl-7">
                        {currentVisa.guidelines.requiredDocuments.map((item, index) => (
                          <li key={index} className="relative before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full" style={{ color: colors.textDark, backgroundColor: colors.primary }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No document requirements specified</p>
                    )}
                  </div>

                  <div className="p-5 rounded-xl border" style={{ backgroundColor: `${colors.accent}20`, borderColor: colors.accent }}>
                    <h3 className="font-semibold text-gray-800 mb-3">Additional Information</h3>
                    <p className="text-gray-700">
                      {currentVisa.guidelines?.additionalInfo || 'No additional information available for this visa type.'}
                    </p>
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Visa Status Tracking */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="p-2 rounded-full" style={{ backgroundColor: colors.accent }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              Track Your Visa
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Reference number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A53A7] focus:border-transparent"
              />
              <button 
                className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: colors.primary }}
              >
                Check Status
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Enter the reference number provided during your application submission</p>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="p-1.5 rounded-full" style={{ backgroundColor: colors.accent }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                </span>
                Quick Links
              </h3>
            </div>
            <div className="p-3">
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                    <span className="p-1.5 rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                      <FaPassport className="text-sm" style={{ color: colors.primary }} />
                    </span>
                    Visa Application Form
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                    <span className="p-1.5 rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                      <FaCalendarAlt className="text-sm" style={{ color: colors.primary }} />
                    </span>
                    Appointment Booking
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                    <span className="p-1.5 rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                      <FaMoneyBillWave className="text-sm" style={{ color: colors.primary }} />
                    </span>
                    Fee Calculator
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                    <span className="p-1.5 rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                      <FaHotel className="text-sm" style={{ color: colors.primary }} />
                    </span>
                    Embassy Locations
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="p-1.5 rounded-full" style={{ backgroundColor: colors.accent }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
                Frequently Asked Questions
              </h3>
            </div>
            <div className="p-3">
              <div className="space-y-3">
                <FAQItem 
                  question="How long does visa processing take?"
                  answer="Processing times vary by visa type. Tourist visas typically take 5-7 working days, while student visas may take 15-20 working days."
                />
                <FAQItem 
                  question="Can I extend my visa?"
                  answer="Some visa types can be extended at local immigration offices. Check the specific policies for your visa type."
                />
                <FAQItem 
                  question="What's the visa fee payment method?"
                  answer="We accept credit/debit cards, bank transfers, and mobile payments. Cash payments are only accepted at embassy locations."
                />
                <a href="#" className="block text-center text-sm font-medium p-2" style={{ color: colors.primary }}>
                  View All FAQs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visa Details Modal */}
      {isModalOpen && selectedVisa && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">{selectedVisa.type}</h3>
              <button 
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                <Image
                  src={selectedVisa.image}
                  alt={selectedVisa.type}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h4>
                  <div className="space-y-4">
                    <DetailItem 
                      icon={<FaFileAlt style={{ color: colors.primary }} />}
                      label="Visa Mode"
                      value={selectedVisa.mode}
                    />
                    <DetailItem 
                      icon={<FaPlane style={{ color: colors.primary }} />}
                      label="Entry Type"
                      value={selectedVisa.entry_type}
                    />
                    <DetailItem 
                      icon={<FaClock style={{ color: colors.primary }} />}
                      label="Processing Time"
                      value={selectedVisa.processing_time}
                    />
                    <DetailItem 
                      icon={<FaCalendarAlt style={{ color: colors.primary }} />}
                      label="Visa Validity"
                      value={selectedVisa.validity}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Fees & Stay</h4>
                  <div className="space-y-4">
                    <DetailItem 
                      icon={<FaMoneyBillWave style={{ color: colors.primary }} />}
                      label="Visa Fee"
                      value={`$${selectedVisa.fee}`}
                    />
                    <DetailItem 
                      icon={<FaMoneyBillWave style={{ color: colors.primary }} />}
                      label="Service Charge"
                      value={`$${selectedVisa.serviceCharge}`}
                    />
                    <DetailItem 
                      icon={<FaHotel style={{ color: colors.primary }} />}
                      label="Maximum Stay"
                      value={selectedVisa.stay}
                    />
                    <DetailItem 
                      icon={<FaPassport style={{ color: colors.primary }} />}
                      label="Passport Requirement"
                      value="6 months validity"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Description</h4>
                <p className="text-gray-700">{selectedVisa.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Requirements</h4>
                  {Array.isArray(selectedVisa?.requirements) && selectedVisa.requirements.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedVisa.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors.primary }}
                          ></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No requirements specified</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Policies</h4>
                  {Array.isArray(selectedVisa?.policies) && selectedVisa.policies.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedVisa.policies.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }}></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No policies specified</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 p-5 rounded-xl border" style={{ backgroundColor: `${colors.accent}20`, borderColor: colors.accent }}>
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Additional Information</h4>
                <p className="text-gray-700">
                  {selectedVisa.guidelines?.additionalInfo || 'No additional information available for this visa type.'}
                </p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
              <button 
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg mr-3 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => handleApplyNow(selectedVisa.id)}
                className="px-6 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

const CollapsibleSection = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-full bg-opacity-20" style={{ backgroundColor: '#54ACA420' }}>
            {icon}
          </span>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isOpen ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-medium text-gray-800 text-sm">{question}</span>
        {isOpen ? (
          <FaChevronUp className="text-gray-400 text-xs" />
        ) : (
          <FaChevronDown className="text-gray-400 text-xs" />
        )}
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 text-gray-600 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
};

export default VisaDetails;