import AirlineCard from '@/hooks/AirlineCard';
import React from 'react';


const TrustedAirlines = () => {
  // Airline data with working image URLs
  const airlines = [
    {
      name: "US Bangla Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fc440b503-b9a6-4d88-bbc0-d9461a1a9cda.svg&w=750&q=75"
    },
    {
      name: "Air Astra",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fd8f1d7b4-493f-465d-a08e-9d66220aa377.svg&w=750&q=75"
    },
    {
      name: "Novo Air",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F14817391-5ee1-4dc3-9d42-2cdda1d11b1d.svg&w=750&q=75"
    },
    {
      name: "Biman Bangladesh Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F32d1df32-cced-483b-ba5a-8d3c8ca450cc.svg&w=750&q=75"
    },
    {
      name: "Qatar Airways",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fabfdc8d7-603f-471f-850e-24222d85c7fd.svg&w=750&q=75"
    },
    {
      name: "Emirates",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F5c59aaf5-aa7b-45db-9b7c-eef2f59baead.svg&w=750&q=75"
    },
    {
      name: "Singapore Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F0b966fe9-f217-4603-a666-d05206870bbc.svg&w=750&q=75"
    },
    {
      name: "Malaysia Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F4536b41a-9e2c-4af4-9bc6-29b7c62c03c5.svg&w=750&q=75"
    },
    {
      name: "Turkish Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F29215290-5f47-4d8e-a7d6-7700da193ca4.svg&w=750&q=75"
    },
    {
      name: "Air India",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2Fce48e0d1-e202-4eb8-be5e-cab1c7047056.png&w=750&q=75"
    },
    {
      name: "Cathay Pacific",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2Fce48e0d1-e202-4eb8-be5e-cab1c7047056.png&w=750&q=75"
    },
    {
      name: "IndiGo",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2F8a0a5bc1-cc0e-4fc0-8fae-800dacae794c.png&w=750&q=75"
    }
  ];

  return (
    <div className="bg-white py-16 px-[190px]">
      <div className="text-center mb-12">
        <h2 className="text-[#445494] text-4xl font-bold mb-4">
          Travel Beyond Expectations with Our Trusted Airline Alliances
        </h2>
        <p className="text-gray-600 text-xl">
          With Firsttrip, your journey begins with the best names in the sky
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {airlines.map((airline, index) => (
          <AirlineCard key={index} airline={airline} />
        ))}
      </div>
    </div>
  );
};

export default TrustedAirlines;