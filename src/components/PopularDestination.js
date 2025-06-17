"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PopularDestinations = ({ destinations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);
  const itemWidth = 25; // 25% width for each item (showing 4 at a time)
  const totalSlides = destinations.length;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, isHovered]);

  return (
    <div className="w-full bg-gradient-to-b from-[#f8fbfe] to-[#e6f0fd] py-16 overflow-hidden">
      <div className="mx-auto px-[190px]">
        {/* Title */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-[#445494] mb-3">Popular Destinations</h2>
          <div className="w-20 h-1 bg-[#55C3A9] mx-auto"></div>
        </div>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-[#5A53A7] text-[#5A53A7] hover:text-white transition-all duration-300 hover:scale-110 -ml-6"
          >
            <FiChevronLeft size={28} className="font-bold" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-[#5A53A7] text-[#5A53A7] hover:text-white transition-all duration-300 hover:scale-110 -mr-6"
          >
            <FiChevronRight size={28} className="font-bold" />
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * itemWidth}%)`,
                width: `${totalSlides * itemWidth}%`
              }}
            >
              {destinations.map((destination) => (
                <div 
                  key={destination.locationId}
                  className="w-full flex-shrink-0 px-3"
                  style={{ width: `${itemWidth}%` }}
                >
                  <div className="group relative overflow-hidden rounded-2xl shadow-xl h-[400px]">
                    {/* Background Image */}
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={destination.contentPath}
                        alt={destination.locationName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>
                    
                    {/* Destination Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="mb-2">
                        <span className="bg-[#5A53A7] text-xs font-semibold px-3 py-1 rounded-full">
                          {destination.country}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{destination.locationName}</h3>
                      <p className="text-lg font-medium text-[#54ACA4]">
                        Starts from BDT {destination.basePrice.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Hover Effect - Explore Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-[#55C3A9] hover:bg-[#5A53A7] text-white font-medium py-3 px-6 rounded-full flex items-center transition-all duration-300 transform group-hover:translate-y-0 translate-y-4">
                        Explore Packages
                        <FiChevronRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularDestinations;