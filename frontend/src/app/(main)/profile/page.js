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
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="relative h-24 w-24 rounded-full bg-white overflow-hidden shadow-lg">
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
    {/* ✏️ Overlay edit icon */}
    <div className="absolute inset-0 hover:bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-colors duration-200 flex items-center justify-center">
      <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
        ✏️ Change
      </span>
    </div>
  </label>

  {isSubmitting && (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
    </div>
  )}
</div>

              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-white opacity-90">{user.email}</p>
                {user.profile?.loyalty_points >= 0 && (
  <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm text-[#5A53A7] font-semibold text-sm">
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10 15l-5.878 3.09L5.8 12.545.922 8.91l6.294-.91L10 2.5l2.784 5.5 6.294.91-4.878 3.636 1.678 5.545z" />
    </svg>
    <span>{user.profile.loyalty_points} Points</span>
  </div>
)}

              </div>
            </div>

            <button
              onClick={logout}
              className="mt-4 md:mt-0 px-4 py-2 bg-white text-[#5A53A7] rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
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
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#445494]">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-[#5A53A7] text-white rounded-lg hover:bg-[#4a4490] transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    {isDirty ? 'You have unsaved changes' : 'All changes saved'}
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Basic Info
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            id="first_name"
                            {...register("first_name")}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                              errors.first_name
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-[#55C3A9]'
                            }`}
                          />
                          {errors.first_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            id="last_name"
                            {...register("last_name")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Contact Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            id="phone_number"
                            {...register("phone_number")}
                            placeholder="+1234567890"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                              errors.phone_number
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-[#55C3A9]'
                            }`}
                          />
                          {errors.phone_number && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          <input
                            id="date_of_birth"
                            type="date"
                            {...register("date_of_birth")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <textarea
                          id="address"
                          {...register("address")}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            id="city"
                            {...register("city")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            id="country"
                            {...register("country")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                        <div>
                          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            id="postal_code"
                            {...register("postal_code")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#55C3A9]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                      className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info Display */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Basic Info
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Full Name
                          </label>
                          <p className="mt-1 text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <p className="mt-1 text-gray-900">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details Display */}
                    {user.profile && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Contact Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Phone
                            </label>
                            <p className="mt-1 text-gray-900">
                              {user.profile.phone_number || (
                                <span className="text-gray-400">Not provided</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Date of Birth
                            </label>
                            <p className="mt-1 text-gray-900">
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Address
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {user.profile.address ? (
                          <>
                            <p className="text-gray-700">{user.profile.address}</p>
                            <p className="text-gray-700">
                              {user.profile.city}, {user.profile.country}
                            </p>
                            {user.profile.postal_code && (
                              <p className="text-gray-700">{user.profile.postal_code}</p>
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