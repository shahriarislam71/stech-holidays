"use client";

import React from "react";
import { FiMapPin, FiMail, FiPhone, FiGlobe, FiClock, FiUsers, FiTarget, FiHeart } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-4 md:px-[190px]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Journey Began With A Simple Spark</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Making travel accessible for everyone, everywhere – that's the vision that gave life to Stech Holidays
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-[190px] py-12 md:py-16">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Our Story */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-gray-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] rounded-xl flex items-center justify-center mr-4">
                <FiHeart className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            </div>
            
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                In 2024, a small spark lit up a bold vision – to make travel accessible for everyone, everywhere. 
                This vision gave life to <strong className="text-[#5A53A7]">Stech Holidays</strong>, a name now synonymous with seamless travel experiences.
              </p>
              
              <p>
                Stech Holidays, a proud member of Stech Group, is a trusted Online Travel Agency (OTA) based in Dhaka, Bangladesh, 
                dedicated to redefining travel with innovation, reliability, and personalized service.
              </p>
              
              <p>
                Stech Holidays isn't just about growth – it's about impact. Together, we've built a platform that empowers you to explore the world effortlessly.
              </p>
            </div>
          </div>

          {/* Our Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#5A53A7] to-[#6a63b7] text-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <FiTarget className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Our Mission</h3>
              </div>
              <p className="text-lg opacity-90 leading-relaxed">
                To make travel stress-free, transparent, and accessible. Whether you're looking for expert consultation 
                or need assistance at any hour – you can get it through our experience center, 24/7 hotline, social media, email, or chat.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#55C3A9] to-[#4ab09a] text-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <FiGlobe className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="text-lg opacity-90 leading-relaxed">
                To redefine the way you travel by offering real-time pricing, exclusive deals, and customized solutions. 
                From flights and hotels to customized tours and visa services, we open the door to limitless possibilities.
              </p>
            </div>
          </div>

          {/* What Makes Us Different */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Makes Us Different</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiUsers className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Innovation First</h4>
                <p className="text-gray-600">
                  Our user-friendly platform uses cutting-edge technology to simplify travel planning with real-time pricing and exclusive deals.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiClock className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h4>
                <p className="text-gray-600">
                  Round-the-clock assistance through multiple channels – experience center, hotline, social media, email, and chat.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#5A53A7] to-[#6a63b7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiHeart className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Personalized Service</h4>
                <p className="text-gray-600">
                  Tailored solutions for every traveler – from budget backpackers to luxury seekers and business travelers.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Offices</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <FiMapPin className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold">Head Office</h3>
                </div>
                <p className="text-lg mb-2">
                  Level 2, House 31, Road 17, Block-E, Banani, Dhaka 1212.
                </p>
                <p className="text-lg mb-6">Banani, Dhaka-1213.</p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FiMail className="mr-3 text-xl" />
                    <a href="mailto:stech.holidays@stechgroupbd.com" className="hover:underline">
                      stech.holidays@stechgroupbd.com
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <FiPhone className="mr-3 text-xl" />
                    <a href="tel:+8801811271271" className="hover:underline">
                      +880 1811-271271
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <FiGlobe className="mr-3 text-xl" />
                    <a href="https://stechholidays.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      stechholidays.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-xl font-bold mb-4">Send Us a Message</h4>
                <p className="mb-4">We're here to help! Contact us through any of these channels:</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold mb-1">WhatsApp:</p>
                    <a href="https://wa.me/8801811271271" className="hover:underline">
                      +880 1811-271271
                    </a>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Map Location:</p>
                    <a 
                      href="https://maps.google.com/?q=Level+2,+House+31,+Road+17,+Block-E,+Banani,+Dhaka+1212" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Email Format:</p>
                    <code className="text-sm bg-black bg-opacity-20 px-2 py-1 rounded">
                      stech.holidays@stechgroupbd.com
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-gray-900 mb-6">
              Dreams aren't just meant to be dreamed – they're meant to be lived.
            </p>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Together, let's make every journey a seamless story worth telling.
            </p>
            
            <Link 
              href="/contact-us" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Journey Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}