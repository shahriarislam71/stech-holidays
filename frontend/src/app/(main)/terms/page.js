"use client";

import React, { useState } from "react";
import { FiFileText, FiCheck, FiAlertTriangle, FiShield, FiCreditCard, FiGlobe, FiClock, FiUser, FiLock } from "react-icons/fi";
import Link from "next/link";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general", label: "General Terms" },
    { id: "booking", label: "Booking & Payment" },
    { id: "flight", label: "Flight Policies" },
    { id: "hotel", label: "Hotel Policies" },
    { id: "holiday", label: "Holiday Packages" },
    { id: "visa", label: "Visa Services" },
    { id: "privacy", label: "Privacy & Security" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white py-12 md:py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-4 md:px-[190px]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <FiFileText className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
                <p className="text-xl opacity-90 mt-2">Last updated: January 2025</p>
              </div>
            </div>
            <p className="text-lg max-w-3xl">
              By accessing or using Stech Holidays services, you agree to comply with and be bound by the following terms.
              Please read them carefully.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-[190px] py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Navigation */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 sticky top-4 z-10 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-32">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* General Terms */}
              <section id="general" className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#5A53A7] to-[#6a63b7] rounded-xl flex items-center justify-center mr-4">
                    <FiGlobe className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">General Terms & Conditions</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                    <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center">
                      <FiCheck className="mr-2" /> Acceptance of Terms
                    </h3>
                    <p className="text-gray-700">
                      By using our platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions, 
                      our Privacy Policy, and any other applicable policies or notices posted on the Platform.
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                    <h3 className="font-bold text-lg text-green-900 mb-2 flex items-center">
                      <FiUser className="mr-2" /> Eligibility
                    </h3>
                    <p className="text-gray-700">
                      To use our services, you must be at least 18 years old. You agree to provide only true and accurate information when booking services.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
                    <h3 className="font-bold text-lg text-yellow-900 mb-2 flex items-center">
                      <FiAlertTriangle className="mr-2" /> Intellectual Property
                    </h3>
                    <p className="text-gray-700">
                      All content, branding, logos, and trademarks displayed on our platform are the property of Stech Holidays or its licensors.
                    </p>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
                    <h3 className="font-bold text-lg text-purple-900 mb-2 flex items-center">
                      <FiClock className="mr-2" /> Modifications
                    </h3>
                    <p className="text-gray-700">
                      We reserve the right to amend these Terms and Conditions at any time. Continued use after changes constitutes acceptance.
                    </p>
                  </div>
                </div>
              </section>

              {/* Booking & Payment */}
              <section id="booking" className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#55C3A9] to-[#4ab09a] rounded-xl flex items-center justify-center mr-4">
                    <FiCreditCard className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Booking & Payment Terms</h2>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-4">📝 Booking Confirmation</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#5A53A7] text-white rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</div>
                        <span>All bookings are subject to availability and confirmation</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#5A53A7] text-white rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</div>
                        <span>Prices are subject to change without prior notice</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#5A53A7] text-white rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</div>
                        <span>Payments must be made in full using approved payment methods</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-4">💳 Payment Methods</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['VISA', 'MasterCard', 'AMEX', 'Bkash', 'Nagad', 'Bank Transfer'].map((method) => (
                        <div key={method} className="bg-gray-50 p-3 rounded-lg text-center">
                          <span className="font-semibold text-gray-800">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Flight Policies */}
              <section id="flight" className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">✈️ Flight Policies</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airline Charge</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ST Service Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Domestic Refund</td>
                        <td className="px-6 py-4 text-gray-700">As per airline policy</td>
                        <td className="px-6 py-4 text-[#5A53A7] font-semibold">BDT 300</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Domestic Re-issue</td>
                        <td className="px-6 py-4 text-gray-700">As per airline policy</td>
                        <td className="px-6 py-4 text-[#5A53A7] font-semibold">BDT 200</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">International Refund</td>
                        <td className="px-6 py-4 text-gray-700">As per airline policy</td>
                        <td className="px-6 py-4 text-[#5A53A7] font-semibold">BDT 1,500</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">International Re-issue</td>
                        <td className="px-6 py-4 text-gray-700">As per airline policy</td>
                        <td className="px-6 py-4 text-[#5A53A7] font-semibold">BDT 1,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Important:</strong> Refunds take 20-30 bank working weeks. Stech Holidays' convenience fee is non-refundable for online bookings.
                  </p>
                </div>
              </section>

              {/* Important Notice Section */}
              <div className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <FiAlertTriangle className="mr-3" /> Important Notice
                </h3>
                <div className="space-y-4">
                  <p>• Please upload accurate passport and visa copies for ticket issuance</p>
                  <p>• Check country restrictions and airline policies before purchasing</p>
                  <p>• Passport must be valid for at least 6 months from travel date</p>
                  <p>• We do not issue one-way tickets for Air India and Saudi Airlines (labour tickets)</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">📞 Customer Support</h4>
                    <p className="text-gray-700 mb-2">24/7 Hotline:</p>
                    <a href="tel:13701" className="text-[#5A53A7] font-bold text-xl hover:underline">13701</a>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">📧 Email Support</h4>
                    <a href="mailto:stech.holidays@stechgroupbd.com" className="text-[#5A53A7] hover:underline">
                      stech.holidays@stechgroupbd.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}