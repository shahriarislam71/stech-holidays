import Image from 'next/image';
import React from 'react';

const DownloadApp = () => {
  return (
    <div className="w-full py-10 md:py-16 bg-gradient-to-br from-[#f7f9ff] to-[#e8f0fe]">
      <div className="mx-auto px-4 sm:px-6 lg:px-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* App Mockup Image - Realistic iPhone mockup - Hidden on mobile, shown on tablet+ */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
          <div className="relative hidden md:block">
            <div className="w-64 h-auto bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-gray-900 relative">
              {/* iPhone notch */}
              <div className="h-6 bg-gray-900 flex items-center justify-center relative">
                <div className="w-24 h-4 bg-gray-900 rounded-full absolute -bottom-1"></div>
              </div>
              {/* Screen content */}
              <div className="p-1">
                <div className="h-96 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[28px] overflow-hidden relative">
                  {/* App screenshot mockup */}
                  <Image
                    src="https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" 
                    alt="Travel App Screenshot"
                    width={634}
                    height={634}
                    className="w-full h-full object-cover"
                  />
                  {/* App logo overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-white bg-opacity-90 rounded-xl p-2 shadow-md w-20 h-20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Home button indicator */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <div className="w-24 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-indigo-200 opacity-30"></div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-purple-200 opacity-30"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 space-y-6 order-1 md:order-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight text-center md:text-left">
            Your Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Travel Companion</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 text-center md:text-left">
            Discover amazing destinations, book with ease, and get exclusive offers - all in one app.
          </p>
          
          {/* Mobile App Mockup - Only visible on mobile */}
          <div className="md:hidden flex justify-center my-4">
            <div className="relative w-48 h-auto bg-gray-900 rounded-[36px] shadow-xl overflow-hidden border-[10px] border-gray-900">
              {/* iPhone notch */}
              <div className="h-5 bg-gray-900 flex items-center justify-center relative">
                <div className="w-20 h-3 bg-gray-900 rounded-full absolute -bottom-1"></div>
              </div>
              {/* Screen content */}
              <div className="p-1">
                <div className="h-72 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[24px] overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" 
                    alt="Travel App Screenshot"
                    width={634}
                    height={634}
                    className="w-full h-full object-cover"
                  />
                  {/* App logo overlay */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <div className="bg-white bg-opacity-90 rounded-lg p-1.5 shadow-md w-14 h-14 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Home button indicator */}
              <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
                <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <Image 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/app-download" 
                alt="Download App QR Code"
                width={150}
                height={150}
                className="w-20 h-20 md:w-24 md:h-24 border-2 border-indigo-100 rounded-md"
              />
            </div>
            
            <div className="text-center md:text-left">
              <p className="text-sm md:text-base text-gray-700 mb-2">
                Scan to download our app and get <span className="font-semibold text-indigo-600">10% off</span> your first booking!
              </p>
              <p className="text-xs md:text-sm text-gray-500">*Available on iOS and Android</p>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col gap-4 mt-6">
            {/* Primary Download Button - Mobile Optimized */}
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 md:py-4 md:px-8 rounded-xl flex items-center justify-center transition duration-300 shadow-lg hover:shadow-xl">
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Download Now
            </button>
            
            {/* App Store Badges - Stacked on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href="#" className="h-12 md:h-14 w-auto flex justify-center">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store"
                  width={135}
                  height={40}
                  className="h-full object-contain"
                />
              </a>
              <a href="#" className="h-12 md:h-14 w-auto flex justify-center">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="h-full object-contain"
                />
              </a>
            </div>
          </div>

          {/* Feature Highlights - Mobile Only */}
          <div className="md:hidden grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">Real-time Updates</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">Group Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;