"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PopularDestinations = ({ destinations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(4); // Default for desktop
  const sliderRef = useRef(null);
  
  // Calculate slides to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setSlidesToShow(1);
        } else if (window.innerWidth < 768) {
          setSlidesToShow(2);
        } else if (window.innerWidth < 1024) {
          setSlidesToShow(3);
        } else {
          setSlidesToShow(4);
        }
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemWidth = 100 / slidesToShow; // Dynamic width based on slides to show
  const totalSlides = destinations.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= totalSlides - slidesToShow) {
        return 0; // Loop back to start
      }
      return prevIndex + 1;
    });
  }, [totalSlides, slidesToShow]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return totalSlides - slidesToShow; // Loop to end
      }
      return prevIndex - 1;
    });
  };

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, isHovered, nextSlide]);

  // Dot indicators for mobile
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#f8fbfe] to-[#e6f0fd] py-8 md:py-16 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[190px]">
        {/* Title */}
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#445494] mb-3">Popular Destinations</h2>
          <div className="w-16 md:w-20 h-1 bg-[#55C3A9] mx-auto"></div>
        </div>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows - Hidden on mobile, visible on tablet and up */}
          <button 
            onClick={prevSlide}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 md:p-3 rounded-full shadow-lg hover:bg-[#5A53A7] text-[#5A53A7] hover:text-white transition-all duration-300 hover:scale-110 -ml-2 md:-ml-4 lg:-ml-6"
            aria-label="Previous destinations"
          >
            <FiChevronLeft size={24} className="font-bold md:w-7 md:h-7" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 md:p-3 rounded-full shadow-lg hover:bg-[#5A53A7] text-[#5A53A7] hover:text-white transition-all duration-300 hover:scale-110 -mr-2 md:-mr-4 lg:-mr-6"
            aria-label="Next destinations"
          >
            <FiChevronRight size={24} className="font-bold md:w-7 md:h-7" />
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * itemWidth}%)`,
                width: `${totalSlides * (100 / slidesToShow)}%`
              }}
            >
              {destinations.map((destination) => (
                <div 
                  key={destination.locationId}
                  className="flex-shrink-0 px-2 sm:px-3"
                  style={{ width: `${itemWidth}%` }}
                >
                  <div className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg md:shadow-xl h-[300px] sm:h-[350px] md:h-[400px]">
                    {/* Background Image */}
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={destination.contentPath}
                        alt={destination.locationName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk8dfKdUoD6Mh8gH2Qh6kAWd3IYVqVU4VQclmJkFjtX0oD6EJfKv/9k="
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </div>
                    
                    {/* Destination Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                      <div className="mb-1 md:mb-2">
                        <span className="bg-[#5A53A7] text-xs font-semibold px-2 py-1 md:px-3 md:py-1 rounded-full">
                          {destination.country}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">{destination.locationName}</h3>
                      <p className="text-sm md:text-base lg:text-lg font-medium text-[#54ACA4]">
                        Starts from BDT {destination.basePrice.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Hover Effect - Explore Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <button className="bg-[#55C3A9] hover:bg-[#5A53A7] text-white font-medium py-2 px-4 md:py-3 md:px-6 rounded-full flex items-center transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 text-sm md:text-base">
                        Explore Packages
                        <FiChevronRight className="ml-1 md:ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot Indicators for Mobile */}
        <div className="flex justify-center mt-6 sm:hidden">
          {Array.from({ length: totalSlides - slidesToShow + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-[#5A53A7]' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="flex justify-center mt-6 sm:hidden space-x-4">
          <button 
            onClick={prevSlide}
            className="bg-white p-3 rounded-full shadow-md hover:bg-[#5A53A7] text-[#5A53A7] hover:text-white transition-all duration-300"
            aria-label="Previous destinations"
          >
            <FiChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="bg-white p-3 rounded-full shadow-md hover:bg-[#5A53A7] text-[#5A53A7] hover:text-white transition-all duration-300"
            aria-label="Next destinations"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopularDestinations;