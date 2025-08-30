import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <nav className="bg-white shadow-sm">
      <div className="px-4 md:px-[190px] py-4">
        <div className="flex items-center justify-between">
          

          {/* Navigation Links */}
          <div
            className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-4 md:gap-8 absolute md:static top-16 left-0 right-0 bg-white shadow-md md:shadow-none p-4 md:p-0 z-10`}
          >
            <Link href="/" className="text-md font-semibold text-[#5A53A7]">
              Home
            </Link>
            <Link href="/flights" className="text-md font-semibold text-gray-600">
              Flights
            </Link>
            <Link href="/hotels/search" className="text-md font-semibold text-[#5A53A7] border-b-2 border-[#5A53A7] pb-1 md:pb-0">
              Hotels
            </Link>
            <Link href="/visa" className="text-md font-semibold text-gray-600">
              Visa
            </Link>
            <Link href="/holidays" className="text-md font-semibold text-gray-600">
              Holidays
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
