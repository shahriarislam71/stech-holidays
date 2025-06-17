import React from 'react';

const GetStarted = () => {
  return (
    <div className="relative h-[488px] w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
          filter: 'brightness(0.8)'
        }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-start px-[190px]">
        <div className="max-w-2xl space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl font-bold leading-tight text-white">
            Start Exploring the World with Us!
          </h1>
          
          {/* Get Started Button */}
          <button 
            className="px-8 py-3 rounded-md font-semibold text-white transition-all duration-300 hover:shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #55C3A9 0%, #5A53A7 100%)',
              boxShadow: '0 4px 15px rgba(90, 83, 167, 0.4)'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)'
        }}
      />
    </div>
  );
};

export default GetStarted;