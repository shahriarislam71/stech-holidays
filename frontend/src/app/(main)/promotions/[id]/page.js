import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Mock data
const promotions = [
  {
    id: 1,
    title: "Eidventure with Firsttrip-Domestic Hotel Discount Offer",
    description: "Enjoy up to 67% discount on domestic hotel booking at Firsttrip App & www.firsttrip.com",
    category: "hotel",
    image: "/promotions/trip-banner-1.webp",
    campaignPeriod: "May 20, 2025 to June 20, 2025",
    applicableUsers: [
      "bKash users",
      "AB Bank PLC.", 
      "Bank Asia PLC.",
      "Standard Chartered Bank Bangladesh",
      "VISA, Mastercard and AMEX Cardholders"
    ],
    terms: [
      "Available for online bookings through Firsttrip app or website",
      "Full payment must be completed online",
      "Prices subject to change until booking confirmed",
      "Cancellations subject to hotel policy",
      "No refunds within 24 hours of arrival"
    ],
    faqs: [
      {
        question: "What is the offer?",
        answer: "Enjoy up to 67% discount on domestic hotel bookings"
      },
      {
        question: "Campaign timeline?",
        answer: "Valid until June 20, 2025"
      },
      {
        question: "International hotels included?",
        answer: "No, only domestic hotels in Bangladesh"
      }
    ],
    contact: {
      phone: "+8809613-131415",
      email: "ask@firsttrip.com",
      messenger: "m.me/firsttripbd"
    }
  },
  // ... other offers
];

export default function OfferDetail({ params }) {
  const offer = promotions.find(p => p.id.toString() === params.id);
  
  if (!offer) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-96 w-full">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end pb-12">
          <div className="px-[190px] w-full">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-white">{offer.title}</h1>
              <p className="text-xl text-white/90 mt-4">{offer.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-[190px] py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#55C3A9] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/promotions" className="hover:text-[#55C3A9] transition-colors">Offers</Link>
          <span>/</span>
          <span className="text-[#5A53A7] font-medium">{offer.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-[190px] py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Details */}
          <div className="lg:w-2/3">
            {/* Highlights */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-[#445494] mb-6 pb-2 border-b border-gray-200">Offer Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#55C3A9]/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#5A53A7] flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Campaign Period
                  </h3>
                  <p className="text-gray-700">{offer.campaignPeriod}</p>
                </div>
                <div className="bg-[#55C3A9]/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#5A53A7] flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Eligible Users
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.applicableUsers.map((user, i) => (
                      <span key={i} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                        {user}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-[#445494] mb-6 pb-2 border-b border-gray-200">Terms & Conditions</h2>
              <ul className="space-y-3">
                {offer.terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#55C3A9]"></div>
                    </div>
                    <p className="text-gray-700">{term}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#445494] mb-6 pb-2 border-b border-gray-200">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {offer.faqs.map((faq, i) => (
                  <div key={i} className="group">
                    <h3 className="font-semibold text-lg text-[#5A53A7] group-hover:text-[#55C3A9] transition-colors">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 mt-2 pl-2 border-l-2 border-[#55C3A9]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - CTA */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[#445494] mb-2">Ready to Book?</h3>
                <p className="text-gray-600 mb-4">Don&apos;t miss this limited time offer!</p>
                <button className="w-full bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                  BOOK NOW
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-[#445494] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-[#55C3A9] font-medium">Phone:</span> {offer.contact.phone}
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-[#55C3A9] font-medium">Email:</span> {offer.contact.email}
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-[#55C3A9] font-medium">Messenger:</span> {offer.contact.messenger}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}