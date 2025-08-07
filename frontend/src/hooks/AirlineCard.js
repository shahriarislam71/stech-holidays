'use client';

import Image from 'next/image';
import React from 'react';

const AirlineCard = ({ airline }) => {
  return (
    <div className="flex flex-col items-center w-40 transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="bg-white p-4 rounded-lg shadow-md h-32 w-32 flex items-center justify-center mb-2">
        <Image
          src={airline.logo} 
          alt={airline.name} 
          width={80}
          height={80}
          className="max-h-20 max-w-full object-contain"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/128x128?text=Airline+Logo";
          }}
        />
      </div>
      <span className="text-[#445494] font-medium">{airline.name}</span>
    </div>
  );
};

export default AirlineCard;