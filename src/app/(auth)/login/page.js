"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Handle login logic here
    console.log({ email, password, rememberMe });
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f7] to-[#f5f4ff] flex items-center justify-center p-4">
      <div className="w-full max-w-lg"> {/* Increased width */}
        {/* Compact card design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {/* Condensed header */}
          <div className="relative bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] p-6 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 500 150" className="w-full h-full">
                <path 
                  d="M0,100 C150,150 350,50 500,100 L500,0 L0,0 Z" 
                  fill="white"
                ></path>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-white/80 text-sm">Sign in to continue</p>
            </div>
          </div>

          {/* Compact form section */}
          <div className="p-6"> {/* Reduced padding */}
            <form className="space-y-4" onSubmit={handleSubmit}> {/* Reduced spacing */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#445494] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 rounded-lg border border-gray-200 focus:border-[#55C3A9] focus:ring-2 focus:ring-[#54ACA4]/30 outline-none transition-all duration-300 bg-white/50"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#54ACA4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#445494] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 rounded-lg border border-gray-200 focus:border-[#55C3A9] focus:ring-2 focus:ring-[#54ACA4]/30 outline-none transition-all duration-300 bg-white/50"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#54ACA4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#5A53A7] focus:ring-[#54ACA4] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#445494]">
                    Remember me
                  </label>
                </div>

                <Link href="/forgot-password" className="text-sm font-medium text-[#5A53A7] hover:text-[#54ACA4] transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] hover:from-[#5A53A7]/90 hover:to-[#55C3A9]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#54ACA4] shadow transition-all duration-300 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#445494]">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-[#445494] hover:bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#54ACA4]/30 transition-all duration-200 shadow-sm"
                  >
                    <FcGoogle className="w-4 h-4 mr-2" />
                    Google
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-[#445494] hover:bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#54ACA4]/30 transition-all duration-200 shadow-sm"
                  >
                    <FaFacebook className="w-4 h-4 text-[#3b5998] mr-2" />
                    Facebook
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#445494]">
                New to our platform?{' '}
                <Link href="/register" className="font-medium text-[#5A53A7] hover:text-[#54ACA4] underline underline-offset-4 decoration-[#54ACA4]/30 hover:decoration-[#54ACA4]/70 transition-all duration-200">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}