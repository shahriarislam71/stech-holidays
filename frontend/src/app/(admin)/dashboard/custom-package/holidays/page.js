'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomHolidaysPackage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchHolidayRequests();
  }, []);

  const fetchHolidayRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/holidays-visa/custom-holiday-requests/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching holiday requests:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load holiday requests',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId, status, internalNotes = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/holidays-visa/custom-holiday-requests/${requestId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          internal_notes: internalNotes,
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Status updated successfully',
        });
        fetchHolidayRequests();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status',
      });
    }
  };

  const handleStatusUpdate = (request) => {
    Swal.fire({
      title: 'Update Request Status',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select id="status" class="w-full p-2 border border-gray-300 rounded-md">
              <option value="new" ${request.status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${request.status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="confirmed" ${request.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
            <textarea id="internalNotes" class="w-full p-2 border border-gray-300 rounded-md" rows="4" placeholder="Add internal notes...">${request.internal_notes || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const status = document.getElementById('status').value;
        const internalNotes = document.getElementById('internalNotes').value;
        return { status, internalNotes };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(request.id, result.value.status, result.value.internalNotes);
      }
    });
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    Swal.fire({
      title: 'Request Details',
      html: `
        <div class="text-left space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <strong>Contact Name:</strong>
              <p>${request.contact_name}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>${request.email}</p>
            </div>
            <div>
              <strong>Phone:</strong>
              <p>${request.phone}</p>
            </div>
            <div>
              <strong>Status:</strong>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                request.status === 'new' ? 'bg-blue-100 text-blue-800' :
                request.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }">${request.status}</span>
            </div>
            <div>
              <strong>Destination:</strong>
              <p>${request.destination}</p>
            </div>
            <div>
              <strong>Departure Place:</strong>
              <p>${request.departure_place}</p>
            </div>
            <div>
              <strong>Travel Date:</strong>
              <p>${new Date(request.travel_date).toLocaleDateString()}</p>
            </div>
            <div>
              <strong>Number of Travelers:</strong>
              <p>${request.number_of_travelers}</p>
            </div>
            <div class="col-span-2">
              <strong>Budget:</strong>
              <p>${request.budget ? `$${request.budget}` : 'Not specified'}</p>
            </div>
            <div class="col-span-2">
              <strong>Requirements:</strong>
              <p class="mt-1 p-2 bg-gray-50 rounded">${request.requirements}</p>
            </div>
            ${request.internal_notes ? `
            <div class="col-span-2">
              <strong>Internal Notes:</strong>
              <p class="mt-1 p-2 bg-yellow-50 rounded">${request.internal_notes}</p>
            </div>
            ` : ''}
          </div>
        </div>
      `,
      width: '600px',
      confirmButtonText: 'Close',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      contacted: { color: 'bg-yellow-100 text-yellow-800', label: 'Contacted' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Custom Holiday Requests</h1>
        <p className="mt-2 text-gray-600">Manage and update custom holiday package requests from customers</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{request.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.contact_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <strong>From:</strong> {request.departure_place}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Date:</strong> {new Date(request.travel_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Travelers:</strong> {request.number_of_travelers}
                    </div>
                    {request.budget && (
                      <div className="text-sm text-gray-500">
                        <strong>Budget:</strong> ${request.budget}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewDetails(request)}
                      className="text-[#5A53A7] hover:text-[#445494]"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
            <p className="mt-1 text-sm text-gray-500">No custom holiday requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}