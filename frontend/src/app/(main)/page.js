// frontend/src/app/(main)/page.js
"use client";
import { useEffect, useState } from "react";
import DiscountCarousel from "@/components/DiscountCarousel";
import DownloadApp from "@/components/DownloadApp";
import FlightTracker from "@/components/FlightTracker";
import HeroSection from "@/components/HeroSection";
import PopularDestinations from "@/components/PopularDestination";
import TrustedAirlines from "@/components/TrustedAirlines";

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/locations/popular-destinations/`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }
        const data = await response.json();
        setDestinations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <HeroSection />
      <DiscountCarousel />
      <FlightTracker />
      <PopularDestinations destinations={destinations} />
      <TrustedAirlines />
      <DownloadApp />
      {/* Other sections would go here */}
    </main>
  );
}