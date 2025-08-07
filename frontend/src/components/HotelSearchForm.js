"use client"
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function HotelSearchForm() {
  const [destination, setDestination] = useState('Dhaka, Bangladesh');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showHotelDestinations, setShowHotelDestinations] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const hotelDestinations = [
    'Dhaka, Bangladesh',
    'Chattogram, Bangladesh',
    'Cox\'s Bazar, Bangladesh',
    'Sylhet, Bangladesh'
  ];

  const handleCheckInChange = (date) => {
    setCheckInDate(date);
    if (checkOutDate < date) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      setCheckOutDate(newDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Destination Field */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowHotelDestinations(true);
              }}
              onFocus={() => setShowHotelDestinations(true)}
              onBlur={() => setTimeout(() => setShowHotelDestinations(false), 200)}
              placeholder="Where to?"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
            />
            {showHotelDestinations && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                {hotelDestinations
                  .filter(dest => dest.toLowerCase().includes(destination.toLowerCase()))
                  .map((dest, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-[#5A53A7] hover:text-white cursor-pointer text-gray-800 flex items-center"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setDestination(dest);
                        setShowHotelDestinations(false);
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2 text-[#5A53A7]"
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {dest}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Check-in Date */}
        <div>
          <DatePicker
            selected={checkInDate}
            onChange={handleCheckInChange}
            minDate={new Date()}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
            calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
            customInput={
              <div className="flex items-center justify-between cursor-pointer">
                <span>{formatDate(checkInDate)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            }
          />
        </div>
        
        {/* Check-out Date */}
        <div>
          <DatePicker
            selected={checkOutDate}
            onChange={(date) => setCheckOutDate(date)}
            minDate={checkInDate}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A53A7]"
            calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
            customInput={
              <div className="flex items-center justify-between cursor-pointer">
                <span>{formatDate(checkOutDate)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            }
          />
        </div>
        
        {/* Rooms & Guests */}
        <div className="relative">
          <div 
            className="flex items-center justify-between p-3 rounded-lg border border-gray-300 cursor-pointer"
            onClick={() => setShowGuestSelector(!showGuestSelector)}
          >
            <span>{rooms} Room, {adults} Adult{adults !== 1 ? 's' : ''}, {children} Child{children !== 1 ? 'ren' : ''}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {showGuestSelector && (
            <div className="absolute z-10 w-full mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Rooms</span>
                  <div className="flex items-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (rooms > 1) setRooms(rooms - 1);
                      }}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="mx-3 text-gray-700">{rooms}</span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (rooms < 10) setRooms(rooms + 1);
                      }}
                      className="w-8 h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Adults</span>
                  <div className="flex items-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (adults > 1) setAdults(adults - 1);
                      }}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="mx-3 text-gray-700">{adults}</span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (adults < 10) setAdults(adults + 1);
                      }}
                      className="w-8 h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Children</span>
                  <div className="flex items-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (children > 0) setChildren(children - 1);
                      }}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="mx-3 text-gray-700">{children}</span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (children < 10) setChildren(children + 1);
                      }}
                      className="w-8 h-8 rounded-full bg-[#5A53A7] flex items-center justify-center text-white hover:bg-[#4a4791]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}