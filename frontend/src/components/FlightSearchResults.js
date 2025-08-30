import React from "react";
import FlightCard from "./FlightCard";

const FlightSearchResults = ({ flights }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {flights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No flights found matching your criteria
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search dates to find more options.
          </p>
        </div>
      ) : (
        flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))
      )}
    </div>
  );
};

export default FlightSearchResults;