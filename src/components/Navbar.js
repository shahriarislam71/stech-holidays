

"use client"
import { useActiveSection } from '@/context/ActiveSectionContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeSection, setActiveSection } = useActiveSection();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (['flights', 'hotels', 'holidays', 'visa'].includes(hash)) {
        setActiveSection(hash);
      }
    };

    // Handle initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pathname]);

   const handleNavLinkClick = (e, hash) => {
    e.preventDefault();
    if (hash === 'promotions') {
      router.push('/promotions');
    } else {
      if (pathname === '/') {
        window.location.hash = hash;
        setActiveSection(hash);
      } else {
        router.push(`/#${hash}`);
      }
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileOpen(false);
  };

  const getActiveSection = () => {
    if (pathname !== '/') {
      if (pathname.startsWith('/hotels')) return 'hotels';
      if (pathname.startsWith('/holidays')) return 'holidays';
      if (pathname.startsWith('/visa')) return 'visa';
      if (pathname.startsWith('/promotions')) return 'promotions';
      return 'flights';
    }
    return activeSection || 'flights';
  };

   const currentActiveSection = getActiveSection();

  return (
    <nav className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-[190px]">
        <div className="flex h-20 items-center justify-between">
          <div className="flex-shrink-0">
            <Link 
              href="/#flights" 
              onClick={(e) => handleNavLinkClick(e, 'flights')}
              className="flex items-center justify-center bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm hover:bg-white transition-all duration-200"
            >
              <Image src='/Stech-Holodays (1).webp' alt='logo' width={50} height={38} className="rounded-lg" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <Link 
              href="/#flights" 
              onClick={(e) => handleNavLinkClick(e, 'flights')}
              className={`group flex flex-col items-center px-2 py-2 text-sm font-medium relative ${
                currentActiveSection === 'flights' ? 'text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentActiveSection === 'flights' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <span>Flights</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${
                currentActiveSection === 'flights' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></div>
            </Link>

            <Link 
              href="/#hotels" 
              onClick={(e) => handleNavLinkClick(e, 'hotels')}
              className={`group flex flex-col items-center px-2 py-2 text-sm font-medium relative ${
                currentActiveSection === 'hotels' ? 'text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentActiveSection === 'hotels' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <span>Hotels</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${
                currentActiveSection === 'hotels' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></div>
            </Link>

            <Link 
              href="/#holidays" 
              onClick={(e) => handleNavLinkClick(e, 'holidays')}
              className={`group flex flex-col items-center px-2 py-2 text-sm font-medium relative ${
                currentActiveSection === 'holidays' ? 'text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentActiveSection === 'holidays' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span>Holidays</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${
                currentActiveSection === 'holidays' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></div>
            </Link>

            <Link 
              href="/#visa" 
              onClick={(e) => handleNavLinkClick(e, 'visa')}
              className={`group flex flex-col items-center px-2 py-2 text-sm font-medium relative ${
                currentActiveSection === 'visa' ? 'text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentActiveSection === 'visa' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span>Visa</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${
                currentActiveSection === 'visa' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></div>
            </Link>

            <Link 
              href="/promotions" 
              onClick={(e) => handleNavLinkClick(e, 'promotions')}
              className={`group flex flex-col items-center px-2 py-2 text-sm font-medium relative ${
                currentActiveSection === 'promotions' ? 'text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentActiveSection === 'promotions' ? 'text-white' : 'text-white opacity-90 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
                </svg>
              </div>
              <span>Promotions</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${
                currentActiveSection === 'promotions' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></div>
            </Link>
          </div>

          {/* Rest of your Navbar code remains the same */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-white hover:text-white/90 px-3 py-2 text-sm font-medium">Sign In</Link>
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={closeProfileMenu}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/profile/my-bookings"
                    onClick={closeProfileMenu}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      closeProfileMenu();
                      // Add logout logic here
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/90 hover:bg-white/10 focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}