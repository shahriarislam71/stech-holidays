'use client';
import { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function VisaTracker() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays-visa/track-visa/${referenceNumber}/`
      );
      
      if (!response.ok) {
        throw new Error('Application not found');
      }

      const data = await response.json();
      setApplication(data);
    } catch (error) {
      toast.error(error.message || 'Failed to track application');
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Visa Application</h2>
      
      <form onSubmit={handleTrack} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <div className="relative">
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter your reference number"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7]"
              required
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Tracking...
            </>
          ) : (
            'Track Application'
          )}
        </button>
      </form>

      {application && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Reference Number:</span>
              <span className="font-medium">{application.reference_number}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Country:</span>
              <span className="font-medium">{application.country}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Application Date:</span>
              <span className="font-medium">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}