'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import useAuth from '@/app/hooks/useAuth';

export default function LoginPage() {
  const { isLoading, errorMsg, initGoogleLogin } = useAuth({ redirectToLogin: false });

  // Initialize Google Login button once on mount
useEffect(() => {
    // Only initialize Google after we're done checking auth status
    if (!isLoading) {
      const timer = setTimeout(() => {
        initGoogleLogin();
      }, 300);
      
      return () => clearTimeout(timer);
    }
}, [isLoading, initGoogleLogin]);

  

  // In LoginPage.js
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading authentication...</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1F1E7] to-[#8E8CE8] flex flex-col items-center justify-center px-6 py-12 sm:py-20">
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-10 select-none max-w-xs sm:max-w-sm">
        <Image
          src="/holidays.webp"
          alt="Stech Holidays Logo"
          width={140}
          height={140}
          priority
          className="rounded-full shadow-lg mb-4"
        />
        <h1 className="text-5xl font-extrabold text-[#5A53A7] mb-1">Stech Holidays</h1>
        <p className="text-center text-[#5A53A7]/90 font-medium text-lg px-2">
          Your trusted travel agency to explore amazing destinations worldwide.
        </p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-[#5A53A7] select-none">Welcome Back</h2>
          <p className="text-[#5A53A7]/80 text-lg font-medium select-none">
            Sign in with Google to continue
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 rounded-md bg-red-100 text-red-700 px-5 py-3 text-center font-semibold select-text break-words whitespace-pre-wrap">
            {errorMsg}
          </div>
        )}

        {/* Google Button or Loader */}
        <div className="flex justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="animate-spin h-12 w-12 text-[#5A53A7]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-[#5A53A7] font-semibold text-xl">Signing in...</p>
            </div>
          ) : (
            <div id="google-btn" />
          )}
        </div>
      </div>
    </div>
  );
}
