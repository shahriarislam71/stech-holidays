import React from "react";

const FlightSearchFilters = ({ filters, onFilterChange, apiFilters, onApply }) => {
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

  // Get airlines from API filters or use default
  const airlines = apiFilters?.airlines?.map(airline => ({
    id: airline.toLowerCase().replace(/\s+/g, '_'),
    name: airline
  })) || [
    { id: "biman_bangladesh_airlines", name: "Biman Bangladesh Airlines" },
    { id: "duffel_airways", name: "Duffel Airways" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="space-y-3">
          <input
            type="range"
            min={apiFilters?.priceRange?.min || 0}
            max={apiFilters?.priceRange?.max || 1000}
            value={filters.priceRange[1]}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                priceRange: [
                  apiFilters?.priceRange?.min || 0,
                  parseInt(e.target.value)
                ],
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #5A53A7 0%, #5A53A7 ${
                ((filters.priceRange[1] - (apiFilters?.priceRange?.min || 0)) /
                  ((apiFilters?.priceRange?.max || 1000) - (apiFilters?.priceRange?.min || 0))) *
                100
              }%, #e5e7eb ${
                ((filters.priceRange[1] - (apiFilters?.priceRange?.min || 0)) /
                  ((apiFilters?.priceRange?.max || 1000) - (apiFilters?.priceRange?.min || 0))) *
                100
              }%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {apiFilters?.priceRange?.currency || "BDT"} {Math.round(apiFilters?.priceRange?.min || 0)}
            </span>
            <span>
              {apiFilters?.priceRange?.currency || "BDT"} {Math.round(filters.priceRange[1])}
            </span>
          </div>
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Airlines</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {airlines.map((airline) => (
            <label key={airline.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline.name)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    airlines: filters.airlines.includes(airline.name)
                      ? filters.airlines.filter((name) => name !== airline.name)
                      : [...filters.airlines, airline.name],
                  })
                }
                className="h-4 w-4 text-[#5A53A7] border-gray-300 rounded focus:ring-[#5A53A7] focus:ring-2"
              />
              <span className="text-gray-700 text-sm">{airline.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Times */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Departure Time</h4>
        <div className="space-y-2">
          {departureTimes.map((time) => (
            <label key={time.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
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
                className="h-4 w-4 text-[#5A53A7] border-gray-300 rounded focus:ring-[#5A53A7] focus:ring-2"
              />
              <span className="text-gray-700 text-sm">{time.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Stops</h4>
        <div className="space-y-2">
          {stops.map((stop) => (
            <label key={stop.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
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
                className="h-4 w-4 text-[#5A53A7] border-gray-300 rounded focus:ring-[#5A53A7] focus:ring-2"
              />
              <span className="text-gray-700 text-sm">{stop.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mb-4">
        <button
          onClick={() =>
            onFilterChange({
              airlines: [],
              priceRange: [apiFilters?.priceRange?.min || 0, apiFilters?.priceRange?.max || 1000],
              departureTimes: [],
              stops: [],
            })
          }
          className="text-sm text-[#5A53A7] hover:text-[#4a4791] font-medium"
        >
          Clear All Filters
        </button>
      </div>

      {onApply && (
        <button 
          onClick={handleApply}
          className="w-full py-2 bg-[#5A53A7] text-white rounded-lg font-medium hover:bg-[#4a4791] transition duration-200"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
};

export default FlightSearchFilters;