import DiscountCarousel from "@/components/DiscountCarousel";
import DownloadApp from "@/components/DownloadApp";
import FlightTracker from "@/components/FlightTracker";
import HeroSection from "@/components/HeroSection";
import PopularDestinations from "@/components/PopularDestination";
import TrustedAirlines from "@/components/TrustedAirlines";

export default function Home() {
  const destinationsData = [
    {
        "tagIdentifier": "Popular Destinations",
        "locationId": "ISMlJEBRKl5AKEFAhGAo4IaPz6z1ggK60oLHDF03Vsg",
        "locationName": "Kathmandu",
        "basePrice": 4899.0,
        "country": "Nepal",
        "contentPath": "https://cdn.firsttrip.com/tourUpload/tourImage/202505/1748256580584_1_aws_ChatGPT_Image_May_26,_2025,_04_50_21_PM.png",
        "sortOrder": 1
    },
    {
        "tagIdentifier": "Popular Destinations",
        "locationId": "ISMlJEBRKl5AKEFAhGAo5jCCJs6liiNsPx3wbhE1XrY",
        "locationName": "Kuala Lumpur",
        "basePrice": 9889.0,
        "country": "Malaysia",
        "contentPath": "https://cdn.firsttrip.com/tourUpload/tourImage/202502/1737641490676_1_aws_92.jpg",
        "sortOrder": 2
    },
    {
        "tagIdentifier": "Popular Destinations",
        "locationId": "ISMlJEBRKl5AKEFAhGAo4Q5yY8PtgfLj_zhOY0DIVSI",
        "locationName": "Bangkok",
        "basePrice": 10340.0,
        "country": "Thailand",
        "contentPath": "https://cdn.firsttrip.com/tourUpload/tourImage/202505/1748436797334_1_aws_Bangkok_4.jpg",
        "sortOrder": 3
    },
    {
        "tagIdentifier": "Popular Destinations",
        "locationId": "ISMlJEBRKl5AKEFAhGAo7aBpsQdNkbFOJAYgp9jMRd8",
        "locationName": "Singapore",
        "basePrice": 19100.0,
        "country": "Singapore",
        "contentPath": "https://cdn.firsttrip.com/tourUpload/tourImage/202505/1748496893744_1_aws_ChatGPT_Image_May_29,_2025,_11_35_35_AM.png",
        "sortOrder": 4
    },
    {
        "tagIdentifier": "Popular Destinations",
        "locationId": "ISMlJEBRKl5AKEFAhGAr5gR2l-ahmsga8IZBSBAxYc8",
        "locationName": "Male",
        "basePrice": 11490.0,
        "country": "Maldives",
        "contentPath": "https://cdn.firsttrip.com/tourUpload/tourImage/202506/1738665083934_1_aws_maldives.jpg",
        "sortOrder": 5
    },
    {
        "tagIdentifier": "Popular Destinations",
        "locationId": "ISMlJEBRKl5AKEFAhGAr54yLO4m5mThD3TzIJw3OYiU",
        "locationName": "Colombo",
        "basePrice": 19734.0,
        "country": "Sri Lanka",
        "contentPath": "https://cdn.firsttrip.com/tourUpload/tourImage/202505/1748251284736_1_aws_Colombo,_Sri_Lanka.jpg",
        "sortOrder": 6
    }
]
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />
      <DiscountCarousel />
      <FlightTracker />
      <PopularDestinations destinations={destinationsData}></PopularDestinations>
      <TrustedAirlines />
      <DownloadApp />
      {/* Other sections would go here */}
    </main>
  );
}