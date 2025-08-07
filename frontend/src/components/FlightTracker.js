'use client';

import React from 'react';

const FlightTracker = () => {
  return (
    <div className="flex items-center justify-center min-h-[300px] px-[190px] py-12" style={{ backgroundColor: 'rgb(248, 251, 254)' }}>
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8">
        {/* Left Content */}
        <div className="flex-1 pr-8">
          <h1 className="text-3xl font-bold text-[#445494] mb-4">Flight Tracking Made Easy</h1>
          <p className="text-lg text-gray-600 mb-2">With Firsttrip, tracking your flight is a breeze!</p>
          <p className="text-lg text-gray-600 mb-8">Stay updated on your flights effortlessly using our handy flight tracker.</p>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          <button className="bg-[#55C3A9] hover:bg-[#54ACA4] text-white font-semibold py-3 px-8 rounded-full transition duration-300">
            Open Flight Tracker
          </button>
        </div>
        
        {/* Right Content - Radar Animation */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-64 h-64">
            {/* Radar Base */}
            <div className="absolute inset-0 rounded-full border-4 border-[#5A53A7] opacity-20"></div>
            
            {/* Radar Circles */}
            <div className="absolute inset-0 rounded-full border-2 border-[#5A53A7] opacity-20" style={{ top: '25%', left: '25%', right: '25%', bottom: '25%' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-[#5A53A7] opacity-20" style={{ top: '50%', left: '50%', right: '50%', bottom: '50%' }}></div>
            
            {/* Radar Sweep - Fixed position */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full">
              <div className="absolute top-0 left-1/2 w-1/2 h-full origin-left animate-radar-sweep">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#55C3A9]/20 to-transparent"></div>
              </div>
            </div>
            
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#55C3A9] rounded-full"></div>
            
            {/* Random Dots (flight signals) */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#5A53A7] rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/5 w-2 h-2 bg-[#55C3A9] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-[#5A53A7] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-[#54ACA4] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>

      {/* Add custom animation keyframes */}
      <style jsx global>{`
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FlightTracker;