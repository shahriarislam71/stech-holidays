// app/(admin)/visa/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  FiGlobe, FiFileText, FiUsers, FiCalendar, FiDollarSign,
  FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiDownload,
  FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiChevronUp,
  FiMail, FiMessageSquare, FiPrinter, FiRefreshCw, FiEye
} from 'react-icons/fi';

export default function VisaAdminPage() {
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showVisaTypeModal, setShowVisaTypeModal] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [currentVisaType, setCurrentVisaType] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);
  const router = useRouter();

  // Form states
  const [countryForm, setCountryForm] = useState({
    name: '',
    slug: '',
    description: '',
    requirements: '',
    processing_time: '',
    validity: '',
    entry_type: 'single',
    fee: '',
    image: '',
    cover_image: '',
    is_featured: false
  });

  const [visaTypeForm, setVisaTypeForm] = useState({
    country: '',
    type: '',
    description: '',
    processing_time: '',
    validity: '',
    entry_type: 'single',
    fee: '',
    image: '',
    requirements: '',
    policies: ''
  });

  // Enhanced application status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'document_review', label: 'Document Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' }
  ];

  // Fetch all visa data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Fetch applications with filters
        let appsUrl = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/`;
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (dateFilter !== 'all') params.append('date_range', dateFilter);
        if (searchTerm && activeTab === 'applications') params.append('search', searchTerm);
        
        if (params.toString()) appsUrl += `?${params.toString()}`;
        
        const appsRes = await fetch(appsUrl, {
          headers: { 'Authorization': `Token ${token}` }
        });
        const appsData = await appsRes.json();
        setApplications(Array.isArray(appsData) ? appsData : []);
        
        // Fetch countries
        const countriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        const countriesData = await countriesRes.json();
        setCountries(Array.isArray(countriesData) ? countriesData : []);
        
        // Fetch visa types
        const typesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        const typesData = await typesRes.json();
        setVisaTypes(Array.isArray(typesData) ? typesData : []);
        
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error:', error);
        setApplications([]);
        setCountries([]);
        setVisaTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, dateFilter, searchTerm, activeTab]);

  // Handle status update for single application
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/${applicationId}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        const updatedApp = await response.json();
        setApplications(applications.map(app => 
          app.id === updatedApp.id ? updatedApp : app
        ));
        toast.success('Status updated successfully');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedApplications.length === 0) {
      toast.warning('Please select at least one application');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const promises = selectedApplications.map(appId => 
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/${appId}/`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
          }
        )
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(res => res.json()));
      
      setApplications(applications.map(app => {
        const updatedApp = results.find(result => result.id === app.id);
        return updatedApp || app;
      }));
      
      setSelectedApplications([]);
      toast.success(`${selectedApplications.length} applications updated`);
    } catch (error) {
      toast.error('Failed to update applications');
    }
  };

  // Download documents for an application
  const handleDownloadDocuments = async (applicationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/${applicationId}/download/`,
        {
          headers: { 'Authorization': `Token ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents-${applicationId}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        throw new Error('Failed to download documents');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message to applicant
  const handleSendMessage = async () => {
    if (!currentApplication || !messageContent.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/${currentApplication.id}/message/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageContent,
            application_id: currentApplication.id
          })
        }
      );

      if (response.ok) {
        toast.success('Message sent successfully');
        setMessageContent('');
        setShowMessageModal(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Toggle application selection
  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Toggle select all applications
  const toggleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  // Toggle country expansion
  const toggleCountryExpansion = (countryId) => {
    setExpandedCountry(expandedCountry === countryId ? null : countryId);
  };

  // Handle country deletion
  const handleDeleteCountry = async (id) => {
    if (window.confirm('Are you sure you want to delete this country? All associated visa types will also be deleted.')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/${id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` }
        });

        if (response.ok) {
          setCountries(countries.filter(c => c.id !== id));
          setVisaTypes(visaTypes.filter(vt => vt.country !== id));
          toast.success('Country deleted successfully');
        } else {
          throw new Error('Failed to delete country');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Handle country creation/update
  const handleCreateCountry = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Append all fields except image
      Object.keys(countryForm).forEach(key => {
        if (key !== 'image') {
          formData.append(key, countryForm[key]);
        }
      });

      if (countryForm.cover_image instanceof File) {
        formData.append('cover_image', countryForm.cover_image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const newCountry = await response.json();
        setCountries([...countries, newCountry]);
        toast.success('Country created successfully');
        setShowCountryModal(false);
        setCountryForm({
          name: '',
          slug: '',
          description: '',
          requirements: '',
          processing_time: '',
          validity: '',
          entry_type: 'single',
          fee: '',
          image: '',
          is_featured: false
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create country');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateCountry = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Append all fields except image
      Object.keys(countryForm).forEach(key => {
        if (key !== 'image') {
          formData.append(key, countryForm[key]);
        }
      });

      // Only append image if it's a File
      if (countryForm.cover_image instanceof File) {
        formData.append('cover_image', countryForm.cover_image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/${currentCountry.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const updatedCountry = await response.json();
        setCountries(countries.map(c => c.id === updatedCountry.id ? updatedCountry : c));
        setShowCountryModal(false);
        toast.success('Country updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update country');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle visa type creation/update
  const handleCreateVisaType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Process requirements and policies
      const processTextArea = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return value.split('\n').filter(line => line.trim() !== '');
      };

      const requirementsArray = processTextArea(visaTypeForm.requirements);
      const policiesArray = processTextArea(visaTypeForm.policies);

      // Append all fields except image
      Object.keys(visaTypeForm).forEach(key => {
        if (key !== 'image' && key !== 'requirements' && key !== 'policies') {
          formData.append(key, visaTypeForm[key]);
        }
      });

      // Append processed arrays as JSON strings
      formData.append('requirements', JSON.stringify(requirementsArray));
      formData.append('policies', JSON.stringify(policiesArray));

      // Handle image upload
      if (visaTypeForm.image instanceof File) {
        formData.append('image', visaTypeForm.image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const newVisaType = await response.json();
        setVisaTypes([...visaTypes, newVisaType]);
        toast.success('Visa type created successfully');
        setShowVisaTypeModal(false);
        setVisaTypeForm({
          country: '',
          type: '',
          description: '',
          processing_time: '',
          validity: '',
          entry_type: 'single',
          fee: '',
          image: '',
          requirements: '',
          policies: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create visa type');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateVisaType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Process requirements and policies
      const processTextArea = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return value.split('\n').filter(line => line.trim() !== '');
      };

      const requirementsArray = processTextArea(visaTypeForm.requirements);
      const policiesArray = processTextArea(visaTypeForm.policies);

      // Append all fields except image
      Object.keys(visaTypeForm).forEach(key => {
        if (key !== 'image' && key !== 'requirements' && key !== 'policies') {
          formData.append(key, visaTypeForm[key]);
        }
      });

      // Append processed arrays as JSON strings
      formData.append('requirements', JSON.stringify(requirementsArray));
      formData.append('policies', JSON.stringify(policiesArray));

      // Handle image upload
      if (visaTypeForm.image instanceof File) {
        formData.append('image', visaTypeForm.image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/${currentVisaType.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const updatedVisaType = await response.json();
        setVisaTypes(visaTypes.map(vt => vt.id === updatedVisaType.id ? updatedVisaType : vt));
        toast.success('Visa type updated successfully');
        setShowVisaTypeModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update visa type');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle visa type deletion
  const handleDeleteVisaType = async (id) => {
    if (window.confirm('Are you sure you want to delete this visa type? All applications for this type will be kept but marked as "type deleted".')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/${id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` }
        });

        if (response.ok) {
          setVisaTypes(visaTypes.filter(vt => vt.id !== id));
          toast.success('Visa type deleted successfully');
        } else {
          throw new Error('Failed to delete visa type');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.visa_type?.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesDate = dateFilter === 'all' || true; // Implement date filtering logic
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filter countries by search term
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group visa types by country for the expanded view
  const visaTypesByCountry = visaTypes.reduce((acc, type) => {
    const countryId = type.country;
    if (!acc[countryId]) acc[countryId] = [];
    acc[countryId].push(type);
    return acc;
  }, {});

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#445494]">Visa Management</h1>
        <p className="text-gray-600">Manage visa applications and countries with their visa types</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'applications' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'countries' ? 'border-[#5A53A7] text-[#5A53A7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Countries & Visa Types
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#5A53A7] focus:border-[#5A53A7] sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {activeTab === 'applications' && (
          <div className="flex items-center space-x-4">
            {/* Bulk Actions Dropdown */}
            <div className="relative">
              <button className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
                <span>Bulk Actions</span>
                <FiChevronDown />
              </button>
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleBulkStatusUpdate(option.value)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Mark as {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="next_month">Next Month</option>
            </select>
          </div>
        )}

        {activeTab === 'countries' && (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setCurrentCountry(null);
                setShowCountryModal(true);
                setCountryForm({
                  name: '',
                  slug: '',
                  description: '',
                  requirements: '',
                  processing_time: '',
                  validity: '',
                  entry_type: 'single',
                  fee: '',
                  image: '',
                  is_featured: false
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5A53A7] hover:bg-[#445494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7]"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Country
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7]"></div>
        </div>
      ) : activeTab === 'applications' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header with quick stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-blue-800 font-medium">Total Applications</div>
                <div className="text-3xl font-bold mt-2">{applications.length}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-yellow-800 font-medium">Pending Review</div>
                <div className="text-3xl font-bold mt-2">
                  {applications.filter(a => a.status === 'pending').length}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-green-800 font-medium">Approved</div>
                <div className="text-3xl font-bold mt-2">
                  {applications.filter(a => a.status === 'approved').length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-red-800 font-medium">Rejected</div>
                <div className="text-3xl font-bold mt-2">
                  {applications.filter(a => a.status === 'rejected').length}
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ref #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country & Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(app.id)}
                          onChange={() => toggleApplicationSelection(app.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.reference_number}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.contact_name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                        <div className="text-sm text-gray-500">{app.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{app.country?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {app.visa_type?.type || 'Type deleted'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {app.departure_date ? new Date(app.departure_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          className={`text-xs leading-5 font-semibold rounded-full px-3 py-1 ${statusOptions.find(s => s.value === app.status)?.color || 'bg-gray-100 text-gray-800'}`}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setCurrentApplication(app);
                            setShowApplicationModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FiEye className="inline" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocuments(app.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Download Documents"
                        >
                          <FiDownload className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentApplication(app);
                            setShowMessageModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Send Message"
                        >
                          <FiMail className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No applications found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <React.Fragment key={country.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleCountryExpansion(country.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {country.cover_image && (
                                <img className="h-10 w-10 rounded-full object-cover" src={country.cover_image} alt={country.name} />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{country.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{country.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{country.processing_time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{country.validity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">BDT {country.fee}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            country.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {country.is_featured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentCountry(country);
                              setCountryForm({
                                name: country.name,
                                slug: country.slug,
                                description: country.description,
                                requirements: country.requirements,
                                processing_time: country.processing_time,
                                validity: country.validity,
                                entry_type: country.entry_type,
                                fee: country.fee,
                                image: country.image,
                                cover_image: country.cover_image,
                                is_featured: country.is_featured
                              });
                              setShowCountryModal(true);
                            }}
                            className="text-[#5A53A7] hover:text-[#445494] text-sm"
                          >
                            <FiEdit2 className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCountry(country.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="inline mr-1" /> Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCountryExpansion(country.id);
                            }}
                            className="ml-2 text-gray-600 hover:text-gray-900"
                          >
                            {expandedCountry === country.id ? (
                              <FiChevronUp className="inline" />
                            ) : (
                              <FiChevronDown className="inline" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedCountry === country.id && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="mb-2">
                              <h4 className="font-medium text-gray-900">Description:</h4>
                              <p className="text-gray-600">{country.description}</p>
                            </div>
                            <div className="mb-2">
                              <h4 className="font-medium text-gray-900">Requirements:</h4>
                              <ul className="list-disc pl-5 text-gray-600">
                                {country.requirements.split('\n').map((req, i) => (
                                  req.trim() && <li key={i}>{req}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Visa Types:</h4>
                              {visaTypesByCountry[country.id]?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {visaTypesByCountry[country.id].map((type) => (
                                    <div key={type.id} className="border rounded-lg p-4 bg-white">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="font-medium text-gray-900">{type.type}</h5>
                                          <p className="text-sm text-gray-600">{type.description}</p>
                                        </div>
                                        <div className="text-sm font-medium">BDT {type.fee}</div>
                                      </div>
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="text-gray-500">Processing:</span> {type.processing_time}
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Validity:</span> {type.validity}
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Entry:</span> {type.entry_type}
                                        </div>
                                      </div>
                                      <div className="mt-3 flex justify-end space-x-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentVisaType(type);
                                            setVisaTypeForm({
                                              country: type.country,
                                              type: type.type,
                                              description: type.description,
                                              processing_time: type.processing_time,
                                              validity: type.validity,
                                              entry_type: type.entry_type,
                                              fee: type.fee,
                                              image: type.image,
                                              requirements: Array.isArray(type.requirements) 
                                                  ? type.requirements.join('\n')
                                                  : (typeof type.requirements === 'string' 
                                                      ? (() => {
                                                          try {
                                                            return JSON.parse(type.requirements).join('\n');
                                                          } catch {
                                                            return type.requirements;
                                                          }
                                                        })()
                                                      : ''),
                                              policies: Array.isArray(type.policies)
                                                  ? type.policies.join('\n')
                                                  : (typeof type.policies === 'string' 
                                                      ? (() => {
                                                          try {
                                                            return JSON.parse(type.policies).join('\n');
                                                          } catch {
                                                            return type.policies;
                                                          }
                                                        })()
                                                      : '')
                                            });
                                            setShowVisaTypeModal(true);
                                          }}
                                          className="text-[#5A53A7] hover:text-[#445494] text-sm"
                                        >
                                          <FiEdit2 className="inline mr-1" /> Edit
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteVisaType(type.id);
                                          }}
                                          className="text-red-600 hover:text-red-900 text-sm"
                                        >
                                          <FiTrash2 className="inline mr-1" /> Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500">No visa types for this country</p>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentVisaType(null);
                                  setVisaTypeForm({
                                    country: country.id,
                                    type: '',
                                    description: '',
                                    processing_time: '',
                                    validity: '',
                                    entry_type: 'single',
                                    fee: '',
                                    image: '',
                                    requirements: '',
                                    policies: ''
                                  });
                                  setShowVisaTypeModal(true);
                                }}
                                className="mt-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#5A53A7] hover:bg-[#445494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7]"
                              >
                                <FiPlus className="-ml-0.5 mr-1 h-3 w-3" />
                                Add Visa Type
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No countries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showApplicationModal && currentApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowApplicationModal(false)}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  Application #{currentApplication.reference_number}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusOptions.find(s => s.value === currentApplication.status)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {statusOptions.find(s => s.value === currentApplication.status)?.label || currentApplication.status}
                  </span>
                  <button 
                    onClick={() => setShowApplicationModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Applicant Information */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Applicant Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{currentApplication.contact_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{currentApplication.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{currentApplication.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Passport Number</p>
                        <p className="font-medium">{currentApplication.passport_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Passport Expiry</p>
                        <p className="font-medium">
                          {currentApplication.passport_expiry ? new Date(currentApplication.passport_expiry).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Application Details */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Application Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="font-medium">{currentApplication.country?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Visa Type</p>
                        <p className="font-medium">{currentApplication.visa_type?.type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Departure Date</p>
                        <p className="font-medium">
                          {currentApplication.departure_date ? new Date(currentApplication.departure_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Number of Travelers</p>
                        <p className="font-medium">{currentApplication.travelers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Application Date</p>
                        <p className="font-medium">
                          {new Date(currentApplication.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Documents Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Documents</h4>
                  {currentApplication.documents?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentApplication.documents.map((doc, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="font-medium text-sm truncate">{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.type}</div>
                          <button 
                            onClick={() => window.open(doc.url, '_blank')}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Document
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No documents uploaded</p>
                  )}
                  <button
                    onClick={() => handleDownloadDocuments(currentApplication.id)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiDownload className="-ml-1 mr-2 h-5 w-5" />
                    Download All Documents
                  </button>
                </div>
                
                {/* Additional Information */}
                {currentApplication.additional_info && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Additional Information</h4>
                    <p className="text-gray-700 whitespace-pre-line">{currentApplication.additional_info}</p>
                  </div>
                )}
                
                {/* Status History */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Status History</h4>
                  <div className="space-y-4">
                    {/* This would come from your API */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiCheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Application Submitted</div>
                        <div className="text-sm text-gray-500">
                          {new Date(currentApplication.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {/* Add more status history items here */}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between items-center">
                <div>
                  <select
                    value={currentApplication.status}
                    onChange={(e) => {
                      handleStatusUpdate(currentApplication.id, e.target.value);
                      setCurrentApplication({
                        ...currentApplication,
                        status: e.target.value
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusOptions.find(s => s.value === currentApplication.status)?.color || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setCurrentApplication(currentApplication);
                      setShowMessageModal(true);
                    }}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiMail className="-ml-1 mr-2 h-5 w-5" />
                    Send Message
                  </button>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && currentApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowMessageModal(false)}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  Send Message to {currentApplication.contact_name}
                </h3>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Template
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) => {
                        if (e.target.value) {
                          setMessageContent(e.target.value);
                        }
                      }}
                    >
                      <option value="">Select a template</option>
                      <option value="Dear Applicant,\n\nWe have received your visa application and it is currently under review. We will notify you once the processing is complete.\n\nBest regards,\nVisa Team">
                        Application Received
                      </option>
                      <option value="Dear Applicant,\n\nWe require additional documents to process your visa application. Please upload the following documents:\n\n- Updated passport copy\n- Proof of accommodation\n\nBest regards,\nVisa Team">
                        Document Request
                      </option>
                      <option value="Dear Applicant,\n\nCongratulations! Your visa application has been approved. You can download your visa from the link below.\n\nBest regards,\nVisa Team">
                        Approval Notice
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send Via
                    </label>
                    <div className="flex space-x-2">
                      <label className="inline-flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Email</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                        <span className="ml-2 text-sm text-gray-700">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Country Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowCountryModal(false)}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5A53A7] to-[#445494] px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  {currentCountry ? 'Edit Visa Country' : 'Add New Visa Country'}
                </h3>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <form onSubmit={currentCountry ? handleUpdateCountry : handleCreateCountry}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country Name */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={countryForm.name}
                        onChange={(e) => setCountryForm({...countryForm, name: e.target.value})}
                        required
                        placeholder="Enter country name"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={countryForm.description}
                        onChange={(e) => setCountryForm({...countryForm, description: e.target.value})}
                        placeholder="Brief description about the country visa"
                      />
                    </div>

                    {/* Cover Image Upload */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Image (Hero Banner)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCountryForm({...countryForm, cover_image: file});
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {countryForm.cover_image && (
                        <div className="mt-2 w-full h-48 relative rounded-md overflow-hidden">
                          <img 
                            src={
                              typeof countryForm.cover_image === 'string' ? 
                              `${process.env.NEXT_PUBLIC_API_URL}${countryForm.cover_image}` : 
                              URL.createObjectURL(countryForm.cover_image)
                            }
                            alt="Cover Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Processing Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Time
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={countryForm.processing_time}
                        onChange={(e) => setCountryForm({...countryForm, processing_time: e.target.value})}
                        placeholder="e.g., 5-7 working days"
                      />
                    </div>

                    {/* Validity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validity
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={countryForm.validity}
                        onChange={(e) => setCountryForm({...countryForm, validity: e.target.value})}
                        placeholder="e.g., 30 days"
                      />
                    </div>

                    {/* Entry Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entry Type
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={countryForm.entry_type}
                        onChange={(e) => setCountryForm({...countryForm, entry_type: e.target.value})}
                      >
                        <option value="single">Single Entry</option>
                        <option value="multiple">Multiple Entry</option>
                      </select>
                    </div>

                    {/* Fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fee (BDT)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">৳</span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                          value={countryForm.fee}
                          onChange={(e) => setCountryForm({...countryForm, fee: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image Upload
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCountryForm({...countryForm, image: file});
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {countryForm.cover_image && typeof countryForm.cover_image === 'string' && (
                        <div className="mt-2 w-20 h-20">
                          <img 
                            src={countryForm.cover_image} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requirements
                      </label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <textarea
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition bg-white"
                          value={countryForm.requirements}
                          onChange={(e) => setCountryForm({...countryForm, requirements: e.target.value})}
                          placeholder="Enter requirements, one per line..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Separate each requirement with a new line
                        </p>
                      </div>
                    </div>

                    {/* Featured Toggle */}
                    <div className="col-span-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={countryForm.is_featured}
                            onChange={(e) => setCountryForm({...countryForm, is_featured: e.target.checked})}
                          />
                          <div className={`block w-10 h-6 rounded-full transition ${countryForm.is_featured ? 'bg-[#5A53A7]' : 'bg-gray-300'}`}></div>
                          <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition transform ${countryForm.is_featured ? 'translate-x-4 bg-white' : 'bg-white'}`}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Featured Country
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCountryModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition"
                    >
                      {currentCountry ? 'Update Country' : 'Create Country'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visa Type Modal */}
      {showVisaTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowVisaTypeModal(false)}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5A53A7] to-[#445494] px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  {currentVisaType ? 'Edit Visa Type' : 'Add New Visa Type'}
                </h3>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <form onSubmit={currentVisaType ? handleUpdateVisaType : handleCreateVisaType}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country Selection */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={visaTypeForm.country}
                        onChange={(e) => setVisaTypeForm({...visaTypeForm, country: e.target.value})}
                        required
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.id} value={country.id}>{country.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Visa Type */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visa Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={visaTypeForm.type}
                        onChange={(e) => setVisaTypeForm({...visaTypeForm, type: e.target.value})}
                        required
                        placeholder="e.g., Tourist Visa, Business Visa"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={visaTypeForm.description}
                        onChange={(e) => setVisaTypeForm({...visaTypeForm, description: e.target.value})}
                        placeholder="Description about this visa type"
                      />
                    </div>

                    {/* Processing Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Time
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={visaTypeForm.processing_time}
                        onChange={(e) => setVisaTypeForm({...visaTypeForm, processing_time: e.target.value})}
                        placeholder="e.g., 5-7 working days"
                      />
                    </div>

                    {/* Validity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validity
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={visaTypeForm.validity}
                        onChange={(e) => setVisaTypeForm({...visaTypeForm, validity: e.target.value})}
                        placeholder="e.g., 30 days"
                      />
                    </div>

                    {/* Entry Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entry Type
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={visaTypeForm.entry_type}
                        onChange={(e) => setVisaTypeForm({...visaTypeForm, entry_type: e.target.value})}
                      >
                        <option value="single">Single Entry</option>
                        <option value="multiple">Multiple Entry</option>
                      </select>
                    </div>

                    {/* Fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fee (BDT)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">৳</span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                          value={visaTypeForm.fee}
                          onChange={(e) => setVisaTypeForm({...visaTypeForm, fee: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image Upload
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setVisaTypeForm({...visaTypeForm, image: file});
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {visaTypeForm.image && typeof visaTypeForm.image === 'string' && (
                        <div className="mt-2 w-20 h-20">
                          <img 
                            src={visaTypeForm.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>    

                    {/* Requirements */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requirements
                      </label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <textarea
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition bg-white"
                          value={visaTypeForm.requirements}
                          onChange={(e) => setVisaTypeForm({
                            ...visaTypeForm, 
                            requirements: e.target.value
                          })}
                          placeholder="Enter requirements, one per line..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Separate each requirement with a new line
                        </p>
                      </div>
                    </div>

                    {/* Policies */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Policies
                      </label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <textarea
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition bg-white"
                          value={visaTypeForm.policies}
                          onChange={(e) => setVisaTypeForm({
                            ...visaTypeForm, 
                            policies: e.target.value
                          })}
                          placeholder="Enter policies, one per line..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Separate each policy with a new line
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowVisaTypeModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition"
                    >
                      {currentVisaType ? 'Update Visa Type' : 'Create Visa Type'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}