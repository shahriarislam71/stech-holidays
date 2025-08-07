"use client"
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Offer() {
  const [activeTab, setActiveTab] = useState('all');

  // Promotion data
  const promotions = [
    {
      id: 1,
      title: "Eidventure with Firsttrip-Domestic Hotel Discount Offer",
      description: "Enjoy exclusive discounts on domestic hotels during Eid celebrations.",
      category: "hotel",
      image: "/promotions/trip-offer-1.webp",
      details: {
        campaignPeriod: "May 20, 2025 to June 20, 2025",
        applicableUsers: "bKash users & AB Bank PLC., Bank Asia PLC., Brac Bank PLC., City Bank PLC., Dutch-Bangla Bank PLC., Eastern Bank PLC., Islami Bank PLC., LankaBangla Finance PLC., Meghna Bank PLC., Mutual Trust Bank PLC., NRB Bank PLC., One Bank PLC., Prime Bank PLC., Standard Chartered Bank Bangladesh, Southeast Bank PLC., United Commercial Bank PLC., VISA, Mastercard and AMEX Cardholders",
        terms: [
          "Available for online bookings made through the Firsttrip app or www.firsttrip.com.",
          "The campaign period is valid from May 20, 2025 to June 20, 2025.",
          "Full payment must be completed online to avail the discount.",
          "Discounts are applicable only when payments are made online through Firsttrip app or website.",
          "Hotel and resort prices are subject to change without prior notice.",
          "Accommodation is subject to confirmation from the respective hotel or resort.",
          "Customers wishing to change or modify their bookings should email hotel@firsttrip.com.",
          "Cancellations and refunds are subject to the individual hotel's or resort's policy.",
          "No refunds will be issued for cancellations made within 24 hours of the scheduled arrival.",
          "Any services not specified in the booking must be paid for directly at the hotel or resort."
        ],
        faqs: [
          {
            question: "What is the offer?",
            answer: "Enjoy up to 67% discount on domestic hotel booking at Firsttrip App & www.firsttrip.com."
          },
          {
            question: "What is the timeline of the campaign?",
            answer: "The campaign period is till June 20, 2025."
          },
          {
            question: "Is the offer available for international hotels?",
            answer: "No, this offer is exclusively for domestic hotels and resorts within Bangladesh."
          }
        ]
      }
    },
    // ... other promotions with similar detail structure
  ];

  // Filter promotions
  const filteredPromotions = activeTab === 'all' 
    ? promotions 
    : promotions.filter(promo => promo.category === activeTab || promo.category === 'all');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="bg-white shadow-sm sticky top-20 z-10">
        <div className="px-[190px]">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'all' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All Offers
            </button>
            <button
              onClick={() => setActiveTab('flight')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'flight' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Flight
            </button>
            <button
              onClick={() => setActiveTab('hotel')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'hotel' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Promotions Content */}
      <div className="px-[190px] py-8">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">No promotions available in this category</h3>
            <p className="text-gray-500 mt-2">Check back later for new offers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPromotions.map((promo) => (
              <div key={promo.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="h-52 relative overflow-hidden">
                  <Image 
                    src={promo.image}
                    alt={promo.title}
                    fill

                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-[#5A53A7] capitalize">
                    {promo.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{promo.title}</h3>
                  <p className="text-gray-600 mb-5">{promo.description}</p>
                  <div className="flex justify-between items-center">
                    <Link href={`/promotions/${promo.id}`} className="text-[#55C3A9] font-semibold hover:text-[#5A53A7] flex items-center transition-colors">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#55C3A9]/10 text-[#55C3A9]">
                      LIMITED OFFER
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}