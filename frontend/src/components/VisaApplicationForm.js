'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPassport, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaUsers } from 'react-icons/fa';
import useAuth from '@/app/hooks/useAuth';
import { toast } from 'react-toastify';

export default function VisaApplicationForm({ countryData, visaType }) {
  const { user, fetchUser } = useAuth({ redirectToLogin: false });
  const router = useRouter();
  const [formData, setFormData] = useState({
    contactName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    departureDate: '',
    travelers: 1,
    passportNumber: '',
    passportExpiry: '',
    additionalInfo: '',
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [documentUploads, setDocumentUploads] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/visa-applications/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            country_id: countryData.id,
            visa_type: visaType.id,
            contact_name: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            departure_date: formData.departureDate,
            travelers: formData.travelers,
            passport_number: formData.passportNumber,
            passport_expiry: formData.passportExpiry,
            additional_info: formData.additionalInfo,
            documents: documentUploads
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Application submission failed');
      }

      const data = await response.json();
      toast.success('Visa application submitted successfully!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      router.push(`/profile/my-bookings?tab=visa&ref=${data.reference_number}`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit visa application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        
        return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-document/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          },
          body: formData
        }).then(res => res.json());
      });

      const uploadResults = await Promise.all(uploadPromises);
      setDocumentUploads(prev => [...prev, ...uploadResults.map(res => res.url)]);
    } catch (error) {
      toast.error('Failed to upload documents');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Apply for {visaType.type} - {countryData.name}
      </h2>
      
      {showLoginPrompt && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need to <button onClick={() => router.push('/login')} className="font-medium underline">sign in</button> or <button onClick={() => router.push('/register')} className="font-medium underline">register</button> to submit a visa application.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label>
            <div className="relative">
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Travelers *</label>
            <div className="relative">
              <input
                type="number"
                name="travelers"
                min="1"
                value={formData.travelers}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number *</label>
            <div className="relative">
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaPassport className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date *</label>
            <div className="relative">
              <input
                type="date"
                name="passportExpiry"
                value={formData.passportExpiry}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
                required
              />
              <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Documents</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#5A53A7] hover:text-[#445494] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#5A53A7]"
                >
                  <span>Upload files</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    multiple
                    onChange={handleDocumentUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
          {documentUploads.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Uploaded documents:</p>
              <ul className="mt-1 space-y-1">
                {documentUploads.map((doc, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {doc.split('/').pop()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
          <textarea
            rows={4}
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
            placeholder="Any special requests or additional information..."
          />
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="focus:ring-[#5A53A7] h-4 w-4 text-[#5A53A7] border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the terms and conditions
            </label>
            <p className="text-gray-500">
              By submitting this application, I confirm that all information provided is accurate.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Visa Application'}
          </button>
        </div>
      </form>
    </div>
  );
}