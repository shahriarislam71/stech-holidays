import Link from 'next/link';

export default function MainNav() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="px-[190px] py-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-lg font-semibold text-[#5A53A7]">Home</Link>
          <Link href="/hotels/search" className="text-lg font-semibold text-[#5A53A7] border-b-2 border-[#5A53A7] pb-1">Hotels</Link>
          <Link href="/flights" className="text-lg font-semibold text-gray-600">Flights</Link>
          <Link href="/holidays" className="text-lg font-semibold text-gray-600">Holidays</Link>
          <Link href="/visa" className="text-lg font-semibold text-gray-600">Visa</Link>
        </div>
      </div>
    </nav>
  );
}