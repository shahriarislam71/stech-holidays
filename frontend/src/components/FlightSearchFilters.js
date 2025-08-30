import React from "react";

const FlightSearchFilters = ({ filters, onFilterChange, onApply }) => {
  const airlines = [
    { id: "biman", name: "Biman Bangladesh" },
    { id: "emirates", name: "Emirates" },
    { id: "qatar", name: "Qatar Airways" },
    { id: "singapore", name: "Singapore Airlines" },
  ];

  const departureTimes = [
    { id: "morning", name: "Morning (6am - 12pm)" },
    { id: "afternoon", name: "Afternoon (12pm - 6pm)" },
    { id: "evening", name: "Evening (6pm - 12am)" },
    { id: "night", name: "Night (12am - 6am)" },
  ];

  const stops = [
    { id: "nonstop", name: "Non-stop" },
    { id: "1stop", name: "1 Stop" },
    { id: "2plus", name: "2+ Stops" },
  ];

  const handleApply = () => {
    if (onApply) {
      onApply();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Price Range</h4>
        <input
          type="range"
          min="0"
          max="1000"
          value={filters.priceRange[1]}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              priceRange: [filters.priceRange[0], parseInt(e.target.value)],
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Airlines</h4>
        <div className="space-y-2">
          {airlines.map((airline) => (
            <label key={airline.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline.id)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    airlines: filters.airlines.includes(airline.id)
                      ? filters.airlines.filter((id) => id !== airline.id)
                      : [...filters.airlines, airline.id],
                  })
                }
                className="h-4 w-4 text-[#5A53A7] border-gray-300 rounded focus:ring-[#5A53A7]"
              />
              <span className="text-gray-700">{airline.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Times */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Departure Time</h4>
        <div className="space-y-2">
          {departureTimes.map((time) => (
            <label key={time.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.departureTimes.includes(time.id)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    departureTimes: filters.departureTimes.includes(time.id)
                      ? filters.departureTimes.filter((id) => id !== time.id)
                      : [...filters.departureTimes, time.id],
                  })
                }
                className="h-4 w-4 text-[#5A53A7] border-gray-300 rounded focus:ring-[#5A53A7]"
              />
              <span className="text-gray-700">{time.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Stops</h4>
        <div className="space-y-2">
          {stops.map((stop) => (
            <label key={stop.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.stops.includes(stop.id)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    stops: filters.stops.includes(stop.id)
                      ? filters.stops.filter((id) => id !== stop.id)
                      : [...filters.stops, stop.id],
                  })
                }
                className="h-4 w-4 text-[#5A53A7] border-gray-300 rounded focus:ring-[#5A53A7]"
              />
              <span className="text-gray-700">{stop.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={handleApply}
        className="w-full py-2 bg-[#5A53A7] text-white rounded-lg font-medium hover:bg-[#4a4791] transition"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FlightSearchFilters;