'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useAuth from '@/app/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

// Validation schema
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().max(50).optional(),
  phone_number: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
  postal_code: z.string().max(20).optional(),
});

export default function ProfilePage() {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.profile?.phone_number || '',
        date_of_birth: user.profile?.date_of_birth?.split('T')[0] || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        country: user.profile?.country || '',
        postal_code: user.profile?.postal_code || '',
      });
      
      if (user.profile?.profile_picture) {
        setProfileImage(user.profile.profile_picture);
      }
    }
  }, [user, reset]);

  const onSubmit = async (formData) => {
    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      profile: {
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postal_code: formData.postal_code,
      },
    };

    try {
      await updateProfile(payload);
      toast.success("Profile updated!");
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      toast.error("Update failed!");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      
      // Get CSRF token
      const csrfResponse = await fetch('http://localhost:8000/api/auth/csrf/', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await fetch('http://localhost:8000/api/auth/profile/picture/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfileImage(URL.createObjectURL(file));
        toast.success('Profile picture updated!');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#55C3A9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Please sign in to view your profile</h2>
          <Link href="/auth/signin" className="mt-4 inline-block px-6 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4490] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[#445494]">Profile Menu</h2>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('personal'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                activeTab === 'personal'
                  ? 'bg-[#55C3A9] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Personal Information
            </button>
            <Link
              href="/profile/my-bookings"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
            <Link
              href="/profile/travellers"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Travellers
            </Link>
            <Link
              href="/profile/loyalty"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Loyalty Club
            </Link>
            {user.is_admin && (
              <Link
                href="/dashboard"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Profile Header - Redesigned for Mobile */}
      <div className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] py-8 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header with Menu Button */}
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h1 className="text-xl font-bold text-white">My Profile</h1>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white/20 text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Profile Card Design for Mobile */}
          <div className="bg-white rounded-2xl p-5 shadow-lg md:shadow-none md:bg-transparent md:p-0">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start">
              {/* Profile Image */}
              <div className="relative h-24 w-24 md:h-24 md:w-24 rounded-full bg-gray-100 overflow-hidden shadow-lg mb-4 md:mb-0 md:mr-6">
                <label htmlFor="profile-picture" className="cursor-pointer group">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={`${user.first_name}'s profile`}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full group-hover:opacity-75 transition-opacity duration-200"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-500">
                        {user.first_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                  />
                  {/* Camera icon for mobile */}
                  <div className="absolute bottom-0 right-0 bg-[#5A53A7] rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </label>

                {isSubmitting && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800 md:text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600 text-sm mt-1 md:text-white/90">{user.email}</p>
                
                {/* Loyalty Points Badge */}
                {user.profile?.loyalty_points >= 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5A53A7]/10 text-[#5A53A7] font-semibold text-sm md:bg-white/20 md:text-white">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09L5.8 12.545.922 8.91l6.294-.91L10 2.5l2.784 5.5 6.294.91-4.878 3.636 1.678 5.545z" />
                    </svg>
                    <span>{user.profile.loyalty_points} Loyalty Points</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sign Out Button for Mobile */}
            <div className="mt-6 flex justify-center md:hidden">
              <button
                onClick={logout}
                className="w-full py-2.5 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4490] transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Desktop Sign Out Button */}
          <button
            onClick={logout}
            className="hidden md:block absolute top-8 right-8 px-4 py-2 bg-white text-[#5A53A7] rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation - Desktop */}
          <div className="hidden md:block w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white rounded-lg shadow-sm p-2">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  activeTab === 'personal'
                    ? 'bg-[#55C3A9] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Personal Information
              </button>
              <Link
                href="/profile/my-bookings"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                My Bookings
              </Link>
              <Link
                href="/profile/travellers"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Travellers
              </Link>
              <Link
                href="/profile/loyalty"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Loyalty Club
              </Link>
              {user.is_admin && (
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Profile Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex justify-between items-center mb-5 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-[#445494]">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4490] transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="text-xs md:text-sm text-gray-500">
                    {isDirty ? 'You have unsaved changes' : 'All changes saved'}
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {/* Basic Info Section */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
                        Basic Info
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            id="first_name"
                            {...register("first_name")}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.first_name
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-[#55C3A9]'
                            }`}
                          />
                          {errors.first_name && (
                            <p className="text-red-500 text-xs md:text-sm mt-1">{errors.first_name.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            id="last_name"
                            {...register("last_name")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Details Section */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
                        Contact Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            id="phone_number"
                            {...register("phone_number")}
                            placeholder="+1234567890"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.phone_number
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-[#55C3A9]'
                            }`}
                          />
                          {errors.phone_number && (
                            <p className="text-red-500 text-xs md:text-sm mt-1">{errors.phone_number.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            id="date_of_birth"
                            type="date"
                            {...register("date_of_birth")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mt-6 md:mt-8">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
                      Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <textarea
                          id="address"
                          {...register("address")}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            id="city"
                            {...register("city")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            id="country"
                            {...register("country")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                        <div>
                          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            id="postal_code"
                            {...register("postal_code")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                      className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium ${
                        isSubmitting || !isDirty
                          ? 'bg-[#55C3A9] opacity-70 cursor-not-allowed'
                          : 'bg-[#55C3A9] hover:bg-[#54ACA4]'
                      }`}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {/* Basic Info Display */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
                        Basic Info
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">
                            Full Name
                          </label>
                          <p className="text-gray-900 font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">
                            Email
                          </label>
                          <p className="text-gray-900 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details Display */}
                    {user.profile && (
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
                          Contact Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                              Phone
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user.profile.phone_number || (
                                <span className="text-gray-400">Not provided</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                              Date of Birth
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user.profile.date_of_birth ? (
                                new Date(user.profile.date_of_birth).toLocaleDateString()
                              ) : (
                                <span className="text-gray-400">Not provided</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address Display */}
                  {user.profile && (
                    <div className="mt-8">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
                        Address
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {user.profile.address ? (
                          <>
                            <p className="text-gray-700 font-medium">{user.profile.address}</p>
                            <p className="text-gray-700 font-medium mt-2">
                              {user.profile.city}, {user.profile.country}
                            </p>
                            {user.profile.postal_code && (
                              <p className="text-gray-700 font-medium mt-2">{user.profile.postal_code}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-400">No address provided</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}