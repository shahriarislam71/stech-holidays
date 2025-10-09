"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AirlineCard = ({ airline }) => {
  return (
    <div className="w-40 h-40 flex items-center justify-center p-4 bg-white rounded-2xl shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)] border border-gray-100">
      <Image
        src={airline.logo || "/airline-placeholder.jpg"}
        alt={airline.name || "Airline Logo"}
        width={100}
        height={100}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

const TrustedAirlines = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Airline data with working image URLs
  const airlines = [
    {
      name: "US Bangla Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fc440b503-b9a6-4d88-bbc0-d9461a1a9cda.svg&w=750&q=75",
    },
    {
      name: "Air Astra",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fd8f1d7b4-493f-465d-a08e-9d66220aa377.svg&w=750&q=75",
    },
    {
      name: "Novo Air",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F14817391-5ee1-4dc3-9d42-2cdda1d11b1d.svg&w=750&q=75",
    },
    {
      name: "Biman Bangladesh Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F32d1df32-cced-483b-ba5a-8d3c8ca450cc.svg&w=750&q=75",
    },
    {
      name: "Qatar Airways",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fabfdc8d7-603f-471f-850e-24222d85c7fd.svg&w=750&q=75",
    },
    {
      name: "Emirates",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F5c59aaf5-aa7b-45db-9b7c-eef2f59baead.svg&w=750&q=75",
    },
    {
      name: "Singapore Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F0b966fe9-f217-4603-a666-d05206870bbc.svg&w=750&q=75",
    },
    {
      name: "Malaysia Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F4536b41a-9e2c-4af4-9bc6-29b7c62c03c5.svg&w=750&q=75",
    },
    {
      name: "Turkish Airlines",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F29215290-5f47-4d8e-a7d6-7700da193ca4.svg&w=750&q=75",
    },
    {
      name: "Air India",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2Fce48e0d1-e202-4eb8-be5e-cab1c7047056.png&w=750&q=75",
    },
    {
      name: "Cathay Pacific",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2Fce48e0d1-e202-4eb8-be5e-cab1c7047056.png&w=750&q=75",
    },
    {
      name: "IndiGo",
      logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2F8a0a5bc1-cc0e-4fc0-8fae-800dacae794c.png&w=750&q=75",
    },
  ];

  // Duplicate the airlines for seamless looping
  const duplicatedAirlines = [...airlines, ...airlines];

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 xl:px-44 2xl:px-60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-[#445494] text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Trusted Airline Alliances
          </h2>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">
            With Firsttrip, your journey begins with the best names in the sky
          </p>
        </div>

        {/* Desktop view - grid layout */}
        <div className="hidden md:flex flex-wrap justify-center gap-6 lg:gap-8">
          {airlines.map((airline, index) => (
            <AirlineCard key={index} airline={airline} />
          ))}
        </div>

        {/* Mobile view - continuously scrolling carousel */}
        <div className="md:hidden relative overflow-hidden">
          <style jsx>{`
            @keyframes smoothScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .scrolling-wrapper {
              display: flex;
              width: max-content;
              animation: smoothScroll 40s linear infinite;
            }

            .scrolling-wrapper:hover {
              animation-play-state: paused;
            }

            .scrolling-container {
              overflow: hidden;
              position: relative;
            }
          `}</style>

          <div className="scrolling-container">
            <div className="scrolling-wrapper flex gap-6">
              {duplicatedAirlines.map((airline, index) => (
                <div key={index} className="flex-shrink-0">
                  <AirlineCard airline={airline} />
                </div>
              ))}
            </div>
          </div>

          {/* Gradient fade effects on edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default TrustedAirlines;
