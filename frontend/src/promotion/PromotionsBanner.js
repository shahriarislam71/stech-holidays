"use client"
import Image from 'next/image';

export default function PromotionsBanner() {
  return (
    <div className="w-full relative h-96 overflow-hidden shadow-lg">
      {/* Banner Image */}
      <Image
        src="/promotions/trip-banner-1.webp" // Replace with your actual banner image path
        alt="Special Travel Offers"
        fill
        className="object-cover"
        priority
      />
      
      {/* Optional Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5A53A7]/80 to-[#55C3A9]/80 flex items-center">
        <div className="px-[190px] w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">Exclusive Travel Deals</h1>
            <p className="text-xl text-white/90 mb-6">Discover our limited-time offers and save on your next adventure</p>
            <button className="bg-white text-[#5A53A7] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors duration-200">
              Explore Offers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}