"use client"

import React, { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DiscountCarousel = () => {
  const carouselRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollInterval = useRef(null);

  const travelOffers = [
    {
      id: 1,
      title: "FLY NONSTOP",
      route: "DHAKA TO RIYADH",
      airline: "US-BANGLA AIRLINES",
      discount: "30% OFF",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Activate Mindcase",
      type: "Flight"
    },
    {
      id: 2,
      title: "EUROPE SPECIAL",
      route: "PARIS TO ROME",
      airline: "EMIRATES",
      discount: "25% OFF",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Book Now",
      type: "Flight"
    },
    {
      id: 3,
      title: "ASIA DISCOUNT",
      route: "BANGKOK TO BALI",
      airline: "THAI AIRWAYS",
      discount: "40% OFF",
      image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "View Deal",
      type: "Flight"
    },
    {
      id: 4,
      title: "CARIBBEAN ESCAPE",
      route: "MIAMI TO NASSAU",
      airline: "AMERICAN AIRLINES",
      discount: "35% OFF",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Explore",
      type: "Holidays"
    },
    {
      id: 5,
      title: "MIDDLE EAST TOUR",
      route: "DUBAI TO ISTANBUL",
      airline: "TURKISH AIRLINES",
      discount: "20% OFF",
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Get Offer",
      type: "Holidays"
    },
    {
      id: 6,
      title: "TROPICAL GETAWAY",
      route: "SYDNEY TO FIJI",
      airline: "QANTAS",
      discount: "15% OFF",
      image: "https://images.unsplash.com/photo-1470114716159-e389f8712fda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Book Package",
      type: "Holidays"
    }
  ];

  const filteredOffers = activeFilter === 'All' 
    ? travelOffers 
    : travelOffers.filter(offer => offer.type === activeFilter);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
    resetAutoScroll();
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      // Check if we've reached the end
      if (carouselRef.current.scrollLeft + carouselRef.current.clientWidth >= carouselRef.current.scrollWidth - 10) {
        // If at end, scroll to start
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise scroll right
        carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
    resetAutoScroll();
  };

  const startAutoScroll = () => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    
    scrollInterval.current = setInterval(() => {
      if (carouselRef.current) {
        // Check if we've reached the end
        if (carouselRef.current.scrollLeft + carouselRef.current.clientWidth >= carouselRef.current.scrollWidth - 10) {
          // If at end, scroll to start
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Otherwise scroll right
          carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 3000);
  };

  const resetAutoScroll = () => {
    setIsAutoScrolling(false);
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    setTimeout(() => {
      setIsAutoScrolling(true);
      startAutoScroll();
    }, 1000); // Restart after 10 seconds
  };

  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    }
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [isAutoScrolling, filteredOffers]);

  return (
    <div className="bg-white py-12" style={{ paddingLeft: '190px', paddingRight: '190px' }}>
      <div className="max-w-7xl mx-auto relative">
        {/* Title Section with Filter Buttons */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#445494' }}>
              Save Big with Limited-Time Travel Offers
            </h1>
            
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-4 py-2 rounded-full font-medium ${activeFilter === 'All' ? 'text-white' : 'text-gray-600'}`}
              style={{ backgroundColor: activeFilter === 'All' ? '#55C3A9' : '#f3f4f6' }}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('Flight')}
              className={`px-4 py-2 rounded-full font-medium ${activeFilter === 'Flight' ? 'text-white' : 'text-gray-600'}`}
              style={{ backgroundColor: activeFilter === 'Flight' ? '#55C3A9' : '#f3f4f6' }}
            >
              Flight
            </button>
            <button 
              onClick={() => setActiveFilter('Holidays')}
              className={`px-4 py-2 rounded-full font-medium ${activeFilter === 'Holidays' ? 'text-white' : 'text-gray-600'}`}
              style={{ backgroundColor: activeFilter === 'Holidays' ? '#55C3A9' : '#f3f4f6' }}
            >
              Holidays
            </button>
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-end mb-4 space-x-2">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            style={{ color: '#5A53A7' }}
          >
            <FiChevronLeft size={20} />
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            style={{ color: '#5A53A7' }}
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Discount Cards Carousel */}
        {filteredOffers.length > 0 ? (
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 pb-6"
            style={{ scrollbarWidth: 'none' }}
          >
            {filteredOffers.map((offer) => (
              <div 
                key={offer.id}
                className="flex-shrink-0 relative rounded-xl overflow-hidden shadow-lg w-80 transform transition-all hover:scale-105"
                style={{ 
                  border: '1px solid #e2e8f0',
                  minHeight: '400px'
                }}
              >
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 z-10 bg-white px-3 py-1 rounded-full shadow-md font-bold" style={{ color: '#5A53A7' }}>
                  {offer.discount}
                </div>
                
                {/* Card Image */}
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${offer.image})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </div>
                
                {/* Card Content */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#445494' }}>{offer.title}</h3>
                  <p className="text-gray-600">{offer.route}</p>
                  <p className="text-gray-600 mb-6">{offer.airline}</p>
                  
                  <button 
                    className="w-full py-3 rounded-lg font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#55C3A9' }}
                  >
                    {offer.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No offers available for this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCarousel;