"use client"
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VisaDetails from '@/components/VisaDetails';
import VisaApplicationForm from '@/components/VisaApplicationForm';

export default function VisaCountryPage() {
  const { country } = useParams();
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisaType, setSelectedVisaType] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVisaCountry = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/visa-countries/${country}/`
        );
        if (!response.ok) throw new Error('Country not found');
        const data = await response.json();
        setCountryData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaCountry();
  }, [country]);

  const handleApplyNow = (visaType) => {
    setSelectedVisaType(visaType);
    // Scroll to application form
    document.getElementById('visa-application-form')?.scrollIntoView({ behavior: 'smooth' });
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

  if (!countryData) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Country Not Found</h2>
        <p className="text-gray-600">The visa country you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <VisaDetails 
        countryData={countryData} 
        onApplyNow={handleApplyNow}
      />
      
      {selectedVisaType && (
        <div id="visa-application-form" className="py-12 bg-gray-50">
          <VisaApplicationForm 
            countryData={countryData} 
            visaType={selectedVisaType}
          />
        </div>
      )}
    </div>
  );
}