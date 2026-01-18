// app/(admin)/visa/page.js
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiGlobe, FiFileText, FiUsers, FiCalendar, FiDollarSign,
  FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiDownload,
  FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiChevronUp,
  FiMail, FiMessageSquare, FiPrinter, FiRefreshCw, FiEye,
  FiExternalLink, FiUser, FiCreditCard, FiFile, FiAlertCircle,
  FiCheck, FiX, FiArchive, FiTrendingUp, FiPackage,
  FiTag, FiMapPin, FiUpload, FiImage, FiInfo
} from 'react-icons/fi';
import {
  MdOutlinePendingActions,
  MdOutlineCheckCircle,
  MdOutlineCancel,
  MdOutlineMoreVert,
  MdOutlineVisibility,
  MdOutlineVisibilityOff
} from 'react-icons/md';
import { AiOutlineExport } from 'react-icons/ai';

// ============================================
// COMPONENTS
// ============================================

// Loading Components
const LoadingSpinner = ({ size = 'medium', className = '', color = '#5A53A7' }) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-2',
    xlarge: 'h-16 w-16 border-3'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent`}
        style={{ borderColor: color }}
      ></div>
    </div>
  );
};

const SkeletonLoader = ({ type = 'table', count = 5, className = '' }) => {
  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Status Badge Component
const StatusBadge = ({ status, size = 'normal', className = '' }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
      icon: <FiClock className="text-yellow-600" />, 
      label: 'Pending' 
    },
    processing: { 
      color: 'bg-blue-50 border-blue-200 text-blue-800', 
      icon: <FiRefreshCw className="text-blue-600" />, 
      label: 'Processing' 
    },
    document_review: { 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      icon: <FiFileText className="text-purple-600" />, 
      label: 'Document Review' 
    },
    approved: { 
      color: 'bg-green-50 border-green-200 text-green-800', 
      icon: <FiCheckCircle className="text-green-600" />, 
      label: 'Approved' 
    },
    rejected: { 
      color: 'bg-red-50 border-red-200 text-red-800', 
      icon: <FiXCircle className="text-red-600" />, 
      label: 'Rejected' 
    },
    completed: { 
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      icon: <FiCheck className="text-indigo-600" />, 
      label: 'Completed' 
    },
    on_hold: { 
      color: 'bg-orange-50 border-orange-200 text-orange-800', 
      icon: <FiAlertCircle className="text-orange-600" />, 
      label: 'On Hold' 
    },
    cancelled: { 
      color: 'bg-gray-50 border-gray-200 text-gray-800', 
      icon: <FiX className="text-gray-600" />, 
      label: 'Cancelled' 
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClass = size === 'small' ? 'px-2 py-1 text-xs' : size === 'large' ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-2 rounded-lg border ${sizeClass} ${config.color} ${className}`}>
      {config.icon}
      <span className="font-medium">{config.label}</span>
    </span>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, trend, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${color?.border || 'border-gray-200'} transition-all hover:shadow-md hover:scale-[1.02] duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`inline-flex items-center mt-2 text-sm ${trend.color}`}>
              {trend.icon}
              <span className="ml-1 font-medium">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color?.iconBg || 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md', loading = false }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={loading ? undefined : onClose}
        />
        
        {/* Modal Container */}
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} mx-auto transform transition-all duration-300 scale-100 opacity-100`}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#5A53A7] to-[#445494] px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-white/80 hover:text-white disabled:opacity-50"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dropdown Component
const Dropdown = ({ children, trigger, position = 'right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionClasses = {
    right: 'right-0',
    left: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`absolute z-10 mt-1 ${positionClasses[position]} min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function VisaAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState({
    applications: false,
    countries: false,
    stats: false,
    modal: false
  });
  
  // Data states
  const [applications, setApplications] = useState([]);
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revenue: 0,
    monthly: 0,
    popular_countries: []
  });
  
  // Selection states
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  
  // Modal states
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showVisaTypeModal, setShowVisaTypeModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  
  // Current item states
  const [currentApplication, setCurrentApplication] = useState(null);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [currentVisaType, setCurrentVisaType] = useState(null);
  
  // Form states
  const [countryForm, setCountryForm] = useState({
    name: '',
    cover_image: null,
    is_featured: false
  });
  
  const [visaTypeForm, setVisaTypeForm] = useState({
    country: '',
    type: '',
    description: '',
    processing_time: '5-7 working days',
    validity: '30 days',
    entry_type: 'single',
    visa_fee: '',
    processing_fee: '',
    service_fee: '0',
    image: null,
    requirements: '',
    policies: '',
    is_popular: false
  });
  
  const [messageContent, setMessageContent] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  
  // UI states
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'document_review', label: 'Document Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' }
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { 
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      if (activeTab === 'applications') {
        setLoading(prev => ({ ...prev, applications: true, stats: true }));
        
        // Fetch applications
        let appsUrl = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/`;
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (dateFilter !== 'all') params.append('date_range', dateFilter);
        if (debouncedSearch) params.append('search', debouncedSearch);
        params.append('ordering', '-created_at');
        
        const appsRes = await fetch(`${appsUrl}?${params.toString()}`, { headers });
        
        if (!appsRes.ok) throw new Error('Failed to fetch applications');
        
        const appsData = await appsRes.json();
        setApplications(Array.isArray(appsData) ? appsData : []);
        
        // Calculate stats
        const statsData = {
          total: appsData.length,
          pending: appsData.filter(a => a.status === 'pending').length,
          approved: appsData.filter(a => a.status === 'approved').length,
          rejected: appsData.filter(a => a.status === 'rejected').length,
          revenue: appsData.reduce((sum, app) => sum + (parseFloat(app.total_amount) || 0), 0),
          monthly: appsData.filter(a => {
            const appDate = new Date(a.created_at);
            const now = new Date();
            return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
          }).length,
          popular_countries: Object.entries(
            appsData.reduce((acc, app) => {
              const country = app.country?.name || 'Unknown';
              acc[country] = (acc[country] || 0) + 1;
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1]).slice(0, 5)
        };
        
        setStats(statsData);
        setLoading(prev => ({ ...prev, applications: false, stats: false }));
      } else {
        setLoading(prev => ({ ...prev, countries: true }));
        
        // Fetch countries and visa types
        const [countriesRes, typesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/`, { headers })
        ]);
        
        if (!countriesRes.ok || !typesRes.ok) throw new Error('Failed to fetch data');
        
        const [countriesData, typesData] = await Promise.all([
          countriesRes.json(),
          typesRes.json()
        ]);
        
        setCountries(Array.isArray(countriesData) ? countriesData : []);
        setVisaTypes(Array.isArray(typesData) ? typesData : []);
        setLoading(prev => ({ ...prev, countries: false }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to fetch data');
      setLoading(prev => ({
        ...prev,
        applications: false,
        countries: false,
        stats: false
      }));
    }
  }, [activeTab, statusFilter, dateFilter, debouncedSearch, router]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Application handlers
  const handleStatusUpdate = async (applicationId, newStatus) => {
    setLoading(prev => ({ ...prev, modal: true }));
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
        
        if (currentApplication?.id === applicationId) {
          setCurrentApplication(updatedApp);
        }
        
        toast.success('Status updated successfully');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedApplications.length === 0 || !bulkAction) {
      toast.warning('Please select applications and an action');
      return;
    }

    setLoading(prev => ({ ...prev, modal: true }));
    try {
      const token = localStorage.getItem('authToken');
      
      // Update all selected applications
      for (const appId of selectedApplications) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-applications/${appId}/`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: bulkAction })
          }
        );
      }
      
      // Refresh data
      await fetchData();
      setSelectedApplications([]);
      setBulkAction('');
      setShowBulkActionModal(false);
      toast.success(`${selectedApplications.length} applications updated`);
    } catch (error) {
      toast.error('Failed to update applications');
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

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
        a.download = `visa-documents-${applicationId}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Documents downloaded successfully');
      } else {
        throw new Error('Failed to download documents');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!currentApplication || !messageContent.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    setLoading(prev => ({ ...prev, modal: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  // Country handlers
  const handleSubmitCountry = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, modal: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      formData.append('name', countryForm.name);
      formData.append('is_featured', countryForm.is_featured);
      if (countryForm.cover_image instanceof File) {
        formData.append('cover_image', countryForm.cover_image);
      }

      const url = currentCountry 
        ? `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/${currentCountry.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-countries/`;
      
      const method = currentCountry ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Token ${token}` },
        body: formData
      });

      if (response.ok) {
        const countryData = await response.json();
        
        if (currentCountry) {
          setCountries(countries.map(c => c.id === countryData.id ? countryData : c));
          toast.success('Country updated successfully');
        } else {
          setCountries([...countries, countryData]);
          toast.success('Country created successfully');
        }
        
        setShowCountryModal(false);
        setCountryForm({ name: '', cover_image: null, is_featured: false });
        setCurrentCountry(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save country');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this country? All associated visa types will also be deleted.')) {
      return;
    }

    setLoading(prev => ({ ...prev, modal: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  // Visa Type handlers
  const handleSubmitVisaType = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, modal: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(visaTypeForm).forEach(key => {
        if (key !== 'image' && key !== 'requirements' && key !== 'policies') {
          formData.append(key, visaTypeForm[key]);
        }
      });

      // Process requirements and policies
      const requirementsArray = visaTypeForm.requirements
        ? visaTypeForm.requirements.split('\n').filter(line => line.trim() !== '')
        : [];
      const policiesArray = visaTypeForm.policies
        ? visaTypeForm.policies.split('\n').filter(line => line.trim() !== '')
        : [];

      formData.append('requirements', JSON.stringify(requirementsArray));
      formData.append('policies', JSON.stringify(policiesArray));

      // Handle image upload
      if (visaTypeForm.image instanceof File) {
        formData.append('image', visaTypeForm.image);
      }

      const url = currentVisaType 
        ? `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/${currentVisaType.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/visa-types/`;
      
      const method = currentVisaType ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Token ${token}` },
        body: formData
      });

      if (response.ok) {
        const visaTypeData = await response.json();
        
        if (currentVisaType) {
          setVisaTypes(visaTypes.map(vt => vt.id === visaTypeData.id ? visaTypeData : vt));
          toast.success('Visa type updated successfully');
        } else {
          setVisaTypes([...visaTypes, visaTypeData]);
          toast.success('Visa type created successfully');
        }
        
        setShowVisaTypeModal(false);
        setVisaTypeForm({
          country: '',
          type: '',
          description: '',
          processing_time: '5-7 working days',
          validity: '30 days',
          entry_type: 'single',
          visa_fee: '',
          processing_fee: '',
          service_fee: '0',
          image: null,
          requirements: '',
          policies: '',
          is_popular: false
        });
        setCurrentVisaType(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save visa type');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  const handleDeleteVisaType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visa type? Applications using this type will be kept.')) {
      return;
    }

    setLoading(prev => ({ ...prev, modal: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  // Export handlers
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/export/${activeTab}/`,
        {
          headers: { 'Authorization': `Token ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visa-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Data exported successfully');
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle handlers
  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const toggleSelectAllApplications = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  const toggleCountryExpansion = (countryId) => {
    setExpandedCountry(expandedCountry === countryId ? null : countryId);
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.contact_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      app.reference_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      app.country?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      app.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter countries
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Group visa types by country
  const visaTypesByCountry = visaTypes.reduce((acc, type) => {
    const countryId = type.country;
    if (!acc[countryId]) acc[countryId] = [];
    acc[countryId].push(type);
    return acc;
  }, {});

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render Application Detail Modal
  const renderApplicationModal = () => (
    <Modal
      isOpen={showApplicationModal}
      onClose={() => setShowApplicationModal(false)}
      title={`Application #${currentApplication?.reference_number || ''}`}
      size="lg"
      loading={loading.modal}
    >
      {currentApplication && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Applicant Information</h4>
              <div className="space-y-3">
                <InfoItem label="Full Name" value={currentApplication.contact_name} />
                <InfoItem label="Email" value={currentApplication.email} />
                <InfoItem label="Phone" value={currentApplication.phone} />
                <InfoItem label="Passport Number" value={currentApplication.passport_number} />
                <InfoItem label="Passport Expiry" value={formatDate(currentApplication.passport_expiry)} />
                <InfoItem label="Travelers" value={currentApplication.travelers} />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Application Details</h4>
              <div className="space-y-3">
                <InfoItem label="Country" value={currentApplication.country?.name} />
                <InfoItem label="Visa Type" value={currentApplication.visa_type?.type} />
                <InfoItem label="Departure Date" value={formatDate(currentApplication.departure_date)} />
                <InfoItem label="Application Date" value={formatDate(currentApplication.created_at)} />
                <InfoItem label="Status" value={<StatusBadge status={currentApplication.status} />} />
                <InfoItem label="Total Amount" value={formatCurrency(currentApplication.total_amount)} />
              </div>
            </div>
          </div>
          
          {currentApplication.additional_info && (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Additional Information</h4>
              <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {currentApplication.additional_info}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={() => {
                setCurrentApplication(currentApplication);
                setShowMessageModal(true);
              }}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              <FiMail className="-ml-1 mr-2 h-5 w-5" />
              Send Message
            </button>
            <button
              onClick={() => setShowApplicationModal(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  // Render Message Modal
  const renderMessageModal = () => (
    <Modal
      isOpen={showMessageModal}
      onClose={() => setShowMessageModal(false)}
      title={`Send Message to ${currentApplication?.contact_name || 'Applicant'}`}
      loading={loading.modal}
    >
      {currentApplication && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || loading.modal}
              className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading.modal ? <LoadingSpinner size="small" /> : 'Send Message'}
            </button>
            <button
              onClick={() => setShowMessageModal(false)}
              disabled={loading.modal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  // Render Bulk Action Modal
  const renderBulkActionModal = () => (
    <Modal
      isOpen={showBulkActionModal}
      onClose={() => setShowBulkActionModal(false)}
      title="Bulk Update Applications"
      loading={loading.modal}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Action <span className="text-red-500">*</span>
          </label>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
          >
            <option value="">Choose an action...</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                Mark as {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This action will update <span className="font-semibold">{selectedApplications.length}</span> selected applications.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkAction || loading.modal}
            className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading.modal ? <LoadingSpinner size="small" /> : 'Update Applications'}
          </button>
          <button
            onClick={() => setShowBulkActionModal(false)}
            disabled={loading.modal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );

  // Info Item Component
  const InfoItem = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 relative min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#445494]">Visa Management</h1>
            <p className="text-gray-600">Manage visa applications, countries, and visa types</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchData}
              disabled={loading.applications || loading.countries}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${loading.applications || loading.countries ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportData}
              disabled={isExporting || (activeTab === 'applications' && applications.length === 0) || (activeTab === 'countries' && countries.length === 0)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <AiOutlineExport className={`mr-2 ${isExporting ? 'animate-spin' : ''}`} />
              Export {activeTab}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {activeTab === 'applications' && (
        <div className="mb-6">
          {loading.stats ? (
            <SkeletonLoader type="stats" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Applications"
                value={stats.total}
                icon={<FiFileText className="text-2xl text-blue-600" />}
                color={{ border: 'border-blue-100', iconBg: 'bg-blue-100' }}
              />
              <StatsCard
                title="Pending"
                value={stats.pending}
                icon={<MdOutlinePendingActions className="text-2xl text-yellow-600" />}
                color={{ border: 'border-yellow-100', iconBg: 'bg-yellow-100' }}
              />
              <StatsCard
                title="Approved"
                value={stats.approved}
                icon={<MdOutlineCheckCircle className="text-2xl text-green-600" />}
                color={{ border: 'border-green-100', iconBg: 'bg-green-100' }}
              />
              <StatsCard
                title="Rejected"
                value={stats.rejected}
                icon={<MdOutlineCancel className="text-2xl text-red-600" />}
                color={{ border: 'border-red-100', iconBg: 'bg-red-100' }}
              />
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats.revenue)}
                icon={<FiTrendingUp className="text-2xl text-indigo-600" />}
                color={{ border: 'border-indigo-100', iconBg: 'bg-indigo-100' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'applications'
                ? 'border-[#5A53A7] text-[#5A53A7]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiFileText />
              <span>Applications</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === 'applications' ? 'bg-[#5A53A7] text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {applications.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`py-3 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'countries'
                ? 'border-[#5A53A7] text-[#5A53A7]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiGlobe />
              <span>Countries & Visa Types</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === 'countries' ? 'bg-[#5A53A7] text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {countries.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab === 'applications' ? 'applications...' : 'countries...'}`}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {activeTab === 'applications' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] text-sm min-w-[140px]"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] text-sm min-w-[140px]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>

              {selectedApplications.length > 0 && (
                <button
                  onClick={() => setShowBulkActionModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 text-sm font-medium"
                >
                  Bulk Actions ({selectedApplications.length})
                </button>
              )}
            </>
          )}

          {activeTab === 'countries' && (
            <button
              onClick={() => {
                setCurrentCountry(null);
                setShowCountryModal(true);
                setCountryForm({ name: '', cover_image: null, is_featured: false });
              }}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-[#5A53A7] to-[#445494] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7]"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Country
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading.applications && activeTab === 'applications' ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={8} />
          </div>
        ) : loading.countries && activeTab === 'countries' ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : activeTab === 'applications' ? (
          <>
            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                        onChange={toggleSelectAllApplications}
                        className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                      />
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fees
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(app.id)}
                            onChange={() => toggleApplicationSelection(app.id)}
                            className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{app.reference_number}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(app.created_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {app.travelers} traveler{app.travelers > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{app.contact_name}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                          <div className="text-sm text-gray-500">{app.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{app.country?.name}</div>
                          <div className="text-sm text-gray-500">{app.visa_type?.type}</div>
                          <div className="text-xs text-gray-500">
                            Departure: {formatDate(app.departure_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(app.total_amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Visa: {formatCurrency(app.visa_fee)} + Processing: {formatCurrency(app.processing_fee)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setCurrentApplication(app);
                                setShowApplicationModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentApplication(app);
                                setShowMessageModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 p-1.5 rounded-lg hover:bg-purple-50 transition"
                              title="Send Message"
                            >
                              <FiMail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocuments(app.id)}
                              className="text-green-600 hover:text-green-900 p-1.5 rounded-lg hover:bg-green-50 transition"
                              title="Download Documents"
                            >
                              <FiDownload className="h-4 w-4" />
                            </button>
                            <Dropdown
                              trigger={
                                <button className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-50 transition">
                                  <FiChevronDown className="h-4 w-4" />
                                </button>
                              }
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'approved')}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                                >
                                  <FiCheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Approved
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                                >
                                  <FiXCircle className="mr-2 h-4 w-4" />
                                  Mark as Rejected
                                </button>
                                <div className="border-t my-1"></div>
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'processing')}
                                  className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                >
                                  Mark as Processing
                                </button>
                              </div>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiFileText className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 font-medium">No applications found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? 'Try a different search term' : 'Start by creating your first visa application'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredApplications.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold">{filteredApplications.length}</span> of{' '}
                    <span className="font-semibold">{applications.length}</span> applications
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-sm">1</span>
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Countries Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Types
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <React.Fragment key={country.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {country.cover_image ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={country.cover_image}
                                  alt={country.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <FiGlobe className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  {country.name}
                                  {country.is_featured && (
                                    <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{country.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              country.is_featured 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {country.is_featured ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {visaTypesByCountry[country.id]?.length || 0} visa types
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentCountry(country);
                                  setCountryForm({
                                    name: country.name,
                                    cover_image: null,
                                    is_featured: country.is_featured
                                  });
                                  setShowCountryModal(true);
                                }}
                                className="text-[#5A53A7] hover:text-[#445494] p-1.5 rounded-lg hover:bg-purple-50 transition"
                                title="Edit Country"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleCountryExpansion(country.id)}
                                className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-50 transition"
                                title={expandedCountry === country.id ? "Collapse" : "Expand"}
                              >
                                {expandedCountry === country.id ? (
                                  <FiChevronUp className="h-4 w-4" />
                                ) : (
                                  <FiChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteCountry(country.id)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition"
                                title="Delete Country"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedCountry === country.id && (
                          <tr className="bg-gray-50">
                            <td colSpan="4" className="px-6 py-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">Visa Types</h4>
                                  <button
                                    onClick={() => {
                                      setCurrentVisaType(null);
                                      setVisaTypeForm({
                                        country: country.id,
                                        type: '',
                                        description: '',
                                        processing_time: '5-7 working days',
                                        validity: '30 days',
                                        entry_type: 'single',
                                        visa_fee: '',
                                        processing_fee: '',
                                        service_fee: '0',
                                        image: null,
                                        requirements: '',
                                        policies: '',
                                        is_popular: false
                                      });
                                      setShowVisaTypeModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#5A53A7] to-[#445494] hover:opacity-90"
                                  >
                                    <FiPlus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Visa Type
                                  </button>
                                </div>
                                {visaTypesByCountry[country.id]?.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {visaTypesByCountry[country.id].map((type) => (
                                      <div key={type.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <h5 className="font-medium text-gray-900">{type.type}</h5>
                                            {type.is_popular && (
                                              <span className="inline-block px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full mt-1">
                                                Popular
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-sm font-semibold text-[#5A53A7]">
                                            {formatCurrency(type.total_fee)}
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                          {type.description}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                          <div className="flex items-center gap-1">
                                            <FiClock className="text-gray-400" />
                                            <span className="text-gray-500">Processing:</span>
                                            <span className="font-medium">{type.processing_time}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <FiCalendar className="text-gray-400" />
                                            <span className="text-gray-500">Validity:</span>
                                            <span className="font-medium">{type.validity}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <FiGlobe className="text-gray-400" />
                                            <span className="text-gray-500">Entry:</span>
                                            <span className="font-medium">{type.entry_type}</span>
                                          </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => {
                                              setCurrentVisaType(type);
                                              setVisaTypeForm({
                                                country: type.country,
                                                type: type.type,
                                                description: type.description,
                                                processing_time: type.processing_time,
                                                validity: type.validity,
                                                entry_type: type.entry_type,
                                                visa_fee: type.visa_fee,
                                                processing_fee: type.processing_fee,
                                                service_fee: type.service_fee || '0',
                                                image: null,
                                                requirements: Array.isArray(type.requirements) 
                                                  ? type.requirements.join('\n')
                                                  : type.requirements || '',
                                                policies: Array.isArray(type.policies)
                                                  ? type.policies.join('\n')
                                                  : type.policies || '',
                                                is_popular: type.is_popular
                                              });
                                              setShowVisaTypeModal(true);
                                            }}
                                            className="text-[#5A53A7] hover:text-[#445494] text-xs flex items-center"
                                          >
                                            <FiEdit2 className="mr-1" /> Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteVisaType(type.id)}
                                            className="text-red-600 hover:text-red-900 text-xs flex items-center"
                                          >
                                            <FiTrash2 className="mr-1" /> Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No visa types for this country</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                      Add your first visa type to get started
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiGlobe className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 font-medium">No countries found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? 'Try a different search term' : 'Add your first country to get started'}
                          </p>
                          <button
                            onClick={() => {
                              setCurrentCountry(null);
                              setShowCountryModal(true);
                              setCountryForm({ name: '', cover_image: null, is_featured: false });
                            }}
                            className="mt-4 inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#5A53A7] to-[#445494] rounded-lg hover:opacity-90"
                          >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Your First Country
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Country Modal */}
      <Modal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        title={currentCountry ? 'Edit Country' : 'Add New Country'}
        loading={loading.modal}
      >
        <form onSubmit={handleSubmitCountry}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={countryForm.name}
                onChange={(e) => setCountryForm({...countryForm, name: e.target.value})}
                required
                disabled={loading.modal}
                placeholder="Enter country name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <div className="mt-1">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {countryForm.cover_image ? (
                        <div className="relative">
                          <img
                            src={countryForm.cover_image instanceof File ? URL.createObjectURL(countryForm.cover_image) : countryForm.cover_image}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCountryForm({...countryForm, cover_image: null});
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCountryForm({...countryForm, cover_image: file});
                        }
                      }}
                      className="hidden"
                      disabled={loading.modal}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                checked={countryForm.is_featured}
                onChange={(e) => setCountryForm({...countryForm, is_featured: e.target.checked})}
                disabled={loading.modal}
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Mark as Featured Country
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCountryModal(false)}
              disabled={loading.modal}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.modal || !countryForm.name}
              className="px-4 py-2.5 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {loading.modal ? (
                <LoadingSpinner size="small" color="#ffffff" />
              ) : currentCountry ? 'Update Country' : 'Create Country'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Visa Type Modal */}
      <Modal
        isOpen={showVisaTypeModal}
        onClose={() => setShowVisaTypeModal(false)}
        title={currentVisaType ? 'Edit Visa Type' : 'Add New Visa Type'}
        size="lg"
        loading={loading.modal}
      >
        <form onSubmit={handleSubmitVisaType}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.country}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, country: e.target.value})}
                required
                disabled={loading.modal}
              >
                <option value="">Select a country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.type}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, type: e.target.value})}
                required
                disabled={loading.modal}
                placeholder="e.g., Tourist Visa, Business Visa"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.description}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, description: e.target.value})}
                disabled={loading.modal}
                placeholder="Description about this visa type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Time
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.processing_time}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, processing_time: e.target.value})}
                disabled={loading.modal}
                placeholder="e.g., 5-7 working days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.validity}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, validity: e.target.value})}
                disabled={loading.modal}
                placeholder="e.g., 30 days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Type
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.entry_type}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, entry_type: e.target.value})}
                disabled={loading.modal}
              >
                <option value="single">Single Entry</option>
                <option value="multiple">Multiple Entry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Fee (BDT) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">৳</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                  value={visaTypeForm.visa_fee}
                  onChange={(e) => setVisaTypeForm({...visaTypeForm, visa_fee: e.target.value})}
                  required
                  disabled={loading.modal}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Fee (BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">৳</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                  value={visaTypeForm.processing_fee}
                  onChange={(e) => setVisaTypeForm({...visaTypeForm, processing_fee: e.target.value})}
                  disabled={loading.modal}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Fee (BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">৳</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                  value={visaTypeForm.service_fee}
                  onChange={(e) => setVisaTypeForm({...visaTypeForm, service_fee: e.target.value})}
                  disabled={loading.modal}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {visaTypeForm.image ? (
                      <div className="relative">
                        <img
                          src={visaTypeForm.image instanceof File ? URL.createObjectURL(visaTypeForm.image) : visaTypeForm.image}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisaTypeForm({...visaTypeForm, image: null});
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVisaTypeForm({...visaTypeForm, image: file});
                      }
                    }}
                    className="hidden"
                    disabled={loading.modal}
                  />
                </label>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.requirements}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, requirements: e.target.value})}
                disabled={loading.modal}
                placeholder="Enter requirements, one per line..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate each requirement with a new line
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policies
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                value={visaTypeForm.policies}
                onChange={(e) => setVisaTypeForm({...visaTypeForm, policies: e.target.value})}
                disabled={loading.modal}
                placeholder="Enter policies, one per line..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate each policy with a new line
              </p>
            </div>

            <div className="col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_popular"
                  className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                  checked={visaTypeForm.is_popular}
                  onChange={(e) => setVisaTypeForm({...visaTypeForm, is_popular: e.target.checked})}
                  disabled={loading.modal}
                />
                <label htmlFor="is_popular" className="ml-2 text-sm text-gray-700">
                  Mark as Popular Visa Type
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowVisaTypeModal(false)}
              disabled={loading.modal}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.modal || !visaTypeForm.country || !visaTypeForm.type || !visaTypeForm.visa_fee}
              className="px-4 py-2.5 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {loading.modal ? (
                <LoadingSpinner size="small" color="#ffffff" />
              ) : currentVisaType ? 'Update Visa Type' : 'Create Visa Type'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Render Modals */}
      {renderApplicationModal()}
      {renderMessageModal()}
      {renderBulkActionModal()}

      {/* Loading Overlay */}
      {(loading.applications || loading.countries || loading.stats) && (
        <div className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <LoadingSpinner size="xlarge" />
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      )}
    </div>
  );
}