"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import logo from '../../public/Stech-Holodays (1).webp'

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('flights');

  return (
    <nav className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-[190px]">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center justify-center bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm hover:bg-white transition-all duration-200">
              <Image src='/Stech-Holodays (1).webp' alt='logo' width={50} height={38} className="rounded-lg" />
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {/* Flights */}
            <button 
              onClick={() => setActiveSection('flights')}
              className="group flex flex-col items-center px-2 py-2 text-sm font-medium relative"
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg 
                  className={`w-6 h-6 ${activeSection === 'flights' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <span className={`${activeSection === 'flights' ? 'text-white font-semibold' : 'text-white opacity-90 group-hover:opacity-100'}`}>
                Flights
              </span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${activeSection === 'flights' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </button>

            {/* Hotels */}
            <button 
              onClick={() => setActiveSection('hotels')}
              className="group flex flex-col items-center px-2 py-2 text-sm font-medium relative"
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg 
                  className={`w-6 h-6 ${activeSection === 'hotels' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <span className={`${activeSection === 'hotels' ? 'text-white font-semibold' : 'text-white opacity-90 group-hover:opacity-100'}`}>
                Hotels
              </span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${activeSection === 'hotels' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </button>

            {/* Holidays */}
            <button 
              onClick={() => setActiveSection('holidays')}
              className="group flex flex-col items-center px-2 py-2 text-sm font-medium relative"
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg 
                  className={`w-6 h-6 ${activeSection === 'holidays' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className={`${activeSection === 'holidays' ? 'text-white font-semibold' : 'text-white opacity-90 group-hover:opacity-100'}`}>
                Holidays
              </span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${activeSection === 'holidays' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </button>

            {/* Visa */}
            <button 
              onClick={() => setActiveSection('visa')}
              className="group flex flex-col items-center px-2 py-2 text-sm font-medium relative"
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg 
                  className={`w-6 h-6 ${activeSection === 'visa' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className={`${activeSection === 'visa' ? 'text-white font-semibold' : 'text-white opacity-90 group-hover:opacity-100'}`}>
                Visa
              </span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${activeSection === 'visa' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </button>

            {/* Promotions */}
            <button 
              onClick={() => setActiveSection('promotions')}
              className="group flex flex-col items-center px-2 py-2 text-sm font-medium relative"
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg 
                  className={`w-6 h-6 ${activeSection === 'promotions' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
                </svg>
              </div>
              <span className={`${activeSection === 'promotions' ? 'text-white font-semibold' : 'text-white opacity-90 group-hover:opacity-100'}`}>
                Promotions
              </span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${activeSection === 'promotions' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/signin" 
              className="text-white hover:text-white/90 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-white hover:bg-white/90 text-[#5A53A7] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/90 hover:bg-white/10 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-b from-[#5A53A7] to-[#55C3A9]">
          <button className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">
            <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            Flights
          </button>
          
          {/* Repeat for other mobile menu items */}
          
          <div className="pt-4 border-t border-white/20">
            <Link href="/signin" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">
              Sign In
            </Link>
            <Link href="/signup" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-white text-[#5A53A7] hover:bg-white/90 mt-2">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}