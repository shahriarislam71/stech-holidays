"use client";

import React from "react";
import { FiLock, FiShield, FiEye, FiUser, FiMail, FiCreditCard, FiDatabase, FiGlobe } from "react-icons/fi";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white py-12 md:py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-4 md:px-[190px]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <FiShield className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                <p className="text-xl opacity-90 mt-2">Your privacy is our priority</p>
              </div>
            </div>
            <p className="text-lg max-w-3xl">
              We respect your privacy and recognize the need to protect your personally identifiable information. 
              This policy explains how we collect, use, and protect your data.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-[190px] py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#5A53A7] to-[#6a63b7] rounded-xl flex items-center justify-center mr-4">
                <FiLock className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Commitment</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              At Stech Holidays, we are committed to protecting your personal information and being transparent about 
              how we collect, use, and share your data. We follow appropriate standards to ensure your privacy is respected 
              on our website and mobile applications.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">📊 Information We Collect</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FiUser className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Full Name and Gender</li>
                  <li>• Phone Number</li>
                  <li>• Email Address</li>
                  <li>• Billing Address</li>
                  <li>• Date of Birth (for children)</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FiCreditCard className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Financial Information</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Credit Card Details</li>
                  <li>• Net Banking Information</li>
                  <li>• Mobile Financial Service Details</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
              <h4 className="font-bold text-lg text-yellow-900 mb-2">Important Note</h4>
              <p className="text-yellow-800">
                Credit card and net banking details are usually collected directly by payment gateways and banks. 
                When stored by us, they are secured and never shared except with security agencies for fraud screening.
              </p>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">🎯 How We Use Your Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#5A53A7] text-white rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Reservation & Booking</h3>
                  <p className="text-gray-700">
                    Your information is shared with service providers (airlines, hotels, etc.) for reservation purposes.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#55C3A9] text-white rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Processing</h3>
                  <p className="text-gray-700">
                    Financial information is used to process transactions and prevent fraudulent activities.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#5A53A7] text-white rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Communication</h3>
                  <p className="text-gray-700">
                    We use your contact details to send booking confirmations, updates, and promotional offers 
                    (unless you unsubscribe).
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#55C3A9] text-white rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Improvement</h3>
                  <p className="text-gray-700">
                    We analyze usage patterns to improve our platform and services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies & Tracking */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#55C3A9] to-[#4ab09a] rounded-xl flex items-center justify-center mr-4">
                <FiGlobe className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">🍪 Cookies & Tracking</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Some of our web pages use "cookies" to better serve you with customized information when you return to our site.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">What are Cookies?</h4>
                <p>
                  Cookies are identifiers which websites send to your browser to facilitate your next visit. 
                  You can set your browser to notify you when sent a cookie.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Third-Party Advertising</h4>
                <p>
                  We use third-party service providers for advertising. They may collect anonymous information about 
                  your visits to target advertisements. No personally identifiable information is collected in this process.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-gradient-to-r  from-[#5A53A7] to-[#55C3A9] text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <FiDatabase className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold">🔒 Data Security</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Security Measures</h3>
                <ul className="space-y-2">
                  <li>• Industry-standard encryption</li>
                  <li>• Secure servers and firewalls</li>
                  <li>• Regular security audits</li>
                  <li>• Employee privacy training</li>
                </ul>
              </div>

              <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Your Rights</h3>
                <ul className="space-y-2">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request data deletion</li>
                  <li>• Opt-out of marketing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Policy Updates */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] rounded-xl flex items-center justify-center mr-4">
                <FiEye className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">📝 Policy Updates</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                We may update our privacy policy from time to time. We will notify you of any changes by posting 
                the new policy on this page with an updated effective date.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
                <p className="text-yellow-800 font-medium">
                  We encourage you to review this privacy policy periodically to stay informed about how we are 
                  protecting your information.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h3>
                <p className="text-gray-700 mb-2">
                  If you have any questions or concerns about our Privacy Policy, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:stech.holidays@stechgroupbd.com" className="text-[#5A53A7] hover:underline">
                      stech.holidays@stechgroupbd.com
                    </a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href="tel:13701" className="text-[#5A53A7] hover:underline">13701</a> (24/7)
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