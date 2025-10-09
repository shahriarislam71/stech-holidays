"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DiscountCarousel = () => {
  const carouselRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const scrollInterval = useRef(null);

  const travelOffers = [
    {
      id: 1,
      title: "FLY NONSTOP",
      route: "DHAKA TO RIYADH",
      airline: "US-BANGLA AIRLINES",
      discount: "30% OFF",
      image:
        "https://www.shutterstock.com/image-photo/bangkok-thailand-dec-14-2019-260nw-1591194475.jpg",
      buttonText: "Activate Mindcase",
      type: "Flight",
    },
    {
      id: 2,
      title: "EUROPE SPECIAL",
      route: "PARIS TO ROME",
      airline: "EMIRATES",
      discount: "25% OFF",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Book Now",
      type: "Flight",
    },
    {
      id: 3,
      title: "ASIA DISCOUNT",
      route: "BANGKOK TO BALI",
      airline: "THAI AIRWAYS",
      discount: "40% OFF",
      image:
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "View Deal",
      type: "Flight",
    },
    {
      id: 4,
      title: "CARIBBEAN ESCAPE",
      route: "MIAMI TO NASSAU",
      airline: "AMERICAN AIRLINES",
      discount: "35% OFF",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Explore",
      type: "Holidays",
    },
    {
      id: 5,
      title: "MIDDLE EAST TOUR",
      route: "DUBAI TO ISTANBUL",
      airline: "TURKISH AIRLINES",
      discount: "20% OFF",
      image:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Get Offer",
      type: "Holidays",
    },
    {
      id: 6,
      title: "TROPICAL GETAWAY",
      route: "SYDNEY TO FIJI",
      airline: "QANTAS",
      discount: "15% OFF",
      image:
        "https://images.unsplash.com/photo-1470114716159-e389f8712fda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Book Package",
      type: "Holidays",
    },
  ];

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const filteredOffers =
    activeFilter === "All"
      ? travelOffers
      : travelOffers.filter((offer) => offer.type === activeFilter);

  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = isMobile ? 280 : 300;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
    resetAutoScroll();
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = isMobile ? 280 : 300;
      // Check if we've reached the end
      if (
        carouselRef.current.scrollLeft + carouselRef.current.clientWidth >=
        carouselRef.current.scrollWidth - 10
      ) {
        // If at end, scroll to start
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Otherwise scroll right
        carouselRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
    resetAutoScroll();
  };

 const DiscountCarousel = ({ isMobile }) => {
  const carouselRef = useRef(null);
  const scrollInterval = useRef(null);

  const startAutoScroll = useCallback(() => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);

    scrollInterval.current = setInterval(() => {
      if (carouselRef.current) {
        const scrollAmount = isMobile ? 280 : 300;

        // Check if we've reached the end
        if (
          carouselRef.current.scrollLeft + carouselRef.current.clientWidth >=
          carouselRef.current.scrollWidth - 10
        ) {
          // If at end, scroll to start
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Otherwise scroll right
          carouselRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }, 3000);
  }, [isMobile]); // ✅ dependency added here

  useEffect(() => {
    startAutoScroll(); // now safe
    return () => clearInterval(scrollInterval.current); // cleanup on unmount
  }, [startAutoScroll]);

  return (
    <div ref={carouselRef} className="overflow-x-auto whitespace-nowrap">
      {/* carousel items here */}
    </div>
  );
};

  const resetAutoScroll = () => {
    setIsAutoScrolling(false);
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    setTimeout(() => {
      setIsAutoScrolling(true);
      startAutoScroll();
    }, 10000); // Restart after 10 seconds
  };

  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    }
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [isAutoScrolling, filteredOffers, isMobile,startAutoScroll]);

  return (
    <div className="bg-white py-8 md:py-12 px-4 sm:px-6 lg:px-8 xl:px-44 2xl:px-60">
      <div className="max-w-7xl mx-auto relative">
        {/* Title Section with Filter Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-5 mt-5 gap-4 md:gap-0">
          <div className="w-full md:w-auto">
            <h1
              className="text-3xl sm:text-3xl md:text-4xl font-bold text-center md:text-left"
              style={{ color: "#445494" }}
            >
              Save Big with Limited-Time Travel Offers
            </h1>
          </div>

          {/* Filter Tabs - Stack on mobile, row on larger screens */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
            <button
              onClick={() => setActiveFilter("All")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-sm md:text-base ${
                activeFilter === "All" ? "text-white" : "text-gray-600"
              }`}
              style={{
                backgroundColor: activeFilter === "All" ? "#55C3A9" : "#f3f4f6",
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("Flight")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-sm md:text-base ${
                activeFilter === "Flight" ? "text-white" : "text-gray-600"
              }`}
              style={{
                backgroundColor:
                  activeFilter === "Flight" ? "#55C3A9" : "#f3f4f6",
              }}
            >
              Flight
            </button>
            <button
              onClick={() => setActiveFilter("Holidays")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-sm md:text-base ${
                activeFilter === "Holidays" ? "text-white" : "text-gray-600"
              }`}
              style={{
                backgroundColor:
                  activeFilter === "Holidays" ? "#55C3A9" : "#f3f4f6",
              }}
            >
              Holidays
            </button>
          </div>
        </div>

        {/* Carousel Navigation - Position differently on mobile */}
        <div className="flex justify-center md:justify-end mb-4 space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            style={{ color: "#5A53A7" }}
            aria-label="Previous offers"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            style={{ color: "#5A53A7" }}
            aria-label="Next offers"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Discount Cards Carousel */}
        {filteredOffers.length > 0 ? (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide pb-6 gap-4 md:gap-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", scrollPadding: "0 1rem" }}
          >
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="flex-shrink-0 relative rounded-xl overflow-hidden shadow-lg w-72 sm:w-80 transform transition-all hover:scale-105 snap-start"
                style={{
                  border: "1px solid #e2e8f0",
                  minHeight: isMobile ? "380px" : "400px",
                }}
              >
                {/* Discount Badge */}
                <div
                  className="absolute top-4 right-4 z-10 bg-white px-3 py-1 rounded-full shadow-md font-bold text-sm md:text-base"
                  style={{ color: "#5A53A7" }}
                >
                  {offer.discount}
                </div>

                {/* Card Image */}
                <div className="h-40 sm:h-48 relative overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={offer.title || "Offer Image"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0  bg-opacity-30"></div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-6 bg-white">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-2"
                    style={{ color: "#445494" }}
                  >
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {offer.route}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    {offer.airline}
                  </p>

                  <button
                    className="w-full py-2 sm:py-3 rounded-lg font-bold text-white transition-all hover:opacity-90 text-sm sm:text-base"
                    style={{ backgroundColor: "#55C3A9" }}
                  >
                    {offer.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No offers available for this category
            </p>
          </div>
        )}

        {/* Mobile indicator dots */}
        {isMobile && (
          <div className="flex justify-center mt-4 space-x-2">
            {filteredOffers.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300"
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCarousel;
