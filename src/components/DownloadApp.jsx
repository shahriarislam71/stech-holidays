import React from 'react';

const DownloadApp = () => {
  return (
    <div className="w-full py-16 bg-gradient-to-br from-[#f7f9ff] to-[#e8f0fe]">
      <div className="mx-auto px-4 sm:px-6 lg:px-24 flex flex-col md:flex-row items-center gap-12">
        {/* App Mockup Image - Realistic iPhone mockup */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative">
            <div className="w-64 h-auto bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-gray-900 relative">
              {/* iPhone notch */}
              <div className="h-6 bg-gray-900 flex items-center justify-center relative">
                <div className="w-24 h-4 bg-gray-900 rounded-full absolute -bottom-1"></div>
              </div>
              {/* Screen content */}
              <div className="p-1">
                <div className="h-96 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[28px] overflow-hidden relative">
                  {/* App screenshot mockup */}
                  <img 
                    src="https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" 
                    alt="Travel App Screenshot"
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
        <div className="w-full md:w-1/2 space-y-6">
          <h2 className="text-4xl font-bold text-gray-800 leading-tight">
            Your Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Travel Companion</span>
          </h2>
          <p className="text-lg text-gray-600">
            Discover amazing destinations, book with ease, and get exclusive offers - all in one app.
          </p>
          
          <div className="flex items-start gap-6 p-4 bg-white rounded-xl shadow-sm">
            {/* QR Code - Using a QR code generator service */}
            <div className="flex-shrink-0">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/app-download" 
                alt="Download App QR Code"
                className="w-24 h-24 border-2 border-indigo-100 rounded-md"
              />
            </div>
            
            <div>
              <p className="text-gray-700 mb-3">
                Scan the QR code to download our app and get <span className="font-semibold text-indigo-600">10% off</span> your first booking!
              </p>
              <p className="text-sm text-gray-500">*Available on iOS and Android</p>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center transition duration-300 shadow-lg hover:shadow-xl">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Download Now
            </button>
            
            {/* App Store Badges */}
            <div className="flex gap-3">
              <a href="#" className="h-14 w-auto">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store"
                  className="h-full"
                />
              </a>
              <a href="#" className="h-14 w-auto">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play"
                  className="h-full"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;