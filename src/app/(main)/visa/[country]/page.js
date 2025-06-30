"use client"
import { visaCountries } from '@/constants/visaCountries';
import VisaDetails from '@/components/VisaDetails';
import { notFound } from 'next/navigation';
import { use } from 'react'; // Import the use hook

export default function VisaCountryPage({ params }) {
  // Unwrap the params promise first
  const unwrappedParams = use(params);
  
  // Convert to lowercase once for consistent comparison
  const countryParam = unwrappedParams.country.toLowerCase();
  
  // Find country data (case insensitive)
  const countryData = visaCountries.find(c => 
    c.name.toLowerCase() === countryParam.replace(/-/g, ' ')
  );

  if (!countryData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VisaDetails countryData={countryData} />
    </div>
  );
}