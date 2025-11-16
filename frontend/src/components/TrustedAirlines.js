"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Edit, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const AirlineCard = ({ airline, editMode, onEdit, onRemove, onLogoChange, uploadingLogo }) => {
  const logoFileInputRef = useRef(null);

  const handleLogoClick = () => {
    if (editMode && logoFileInputRef.current) {
      logoFileInputRef.current.click();
    }
  };

  return (
    <div className="relative">
      {editMode && uploadingLogo === airline.id && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#445494]"></div>
        </div>
      )}
      
      <div 
        className={`w-40 h-40 flex items-center justify-center p-4 bg-white rounded-2xl shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)] border border-gray-100 ${
          editMode ? 'cursor-pointer' : ''
        }`}
        onClick={handleLogoClick}
      >
        <img 
          src={airline.logo} 
          alt={airline.name}
          className="max-w-full max-h-full object-contain"
        />
        
        {editMode && (
          <input
            type="file"
            ref={logoFileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => onLogoChange(e, airline.id)}
          />
        )}
      </div>

      {editMode && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(airline);
            }}
            className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
            title="Edit airline"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(airline.id);
            }}
            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Remove airline"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {editMode && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              logoFileInputRef.current?.click();
            }}
            className="bg-[#445494] text-white text-xs px-3 py-1 rounded-full hover:bg-[#3a4780] transition-colors flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Change Logo
          </button>
        </div>
      )}
    </div>
  );
};

const TrustedAirlines = () => {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const ENDPOINT = `${API_BASE}/home/airlines/`;
  const PROFILE_ENDPOINT = `${API_BASE}/auth/profile/`;

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch(PROFILE_ENDPOINT, {
          headers: {
            "Authorization": `Token ${authToken}`
          }
        });

        if (response.ok) {
          const profile = await response.json();
          setIsAdmin(profile.is_admin === true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ENDPOINT);
        if (!response.ok) throw new Error("Failed to fetch data");
        const jsonData = await response.json();
        setData(jsonData);
        setTempData(jsonData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to default data if API fails
        const defaultData = {
          title: "Trusted Airline Alliances",
          subtitle: "With RAWASY, your journey begins with the best names in the sky",
          airlines: [
            {
              id: 1,
              name: "US Bangla Airlines",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fc440b503-b9a6-4d88-bbc0-d9461a1a9cda.svg&w=750&q=75",
              order: 1
            },
            {
              id: 2,
              name: "Air Astra",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fd8f1d7b4-493f-465d-a08e-9d66220aa377.svg&w=750&q=75",
              order: 2
            },
            {
              id: 3,
              name: "Novo Air",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F14817391-5ee1-4dc3-9d42-2cdda1d11b1d.svg&w=750&q=75",
              order: 3
            },
            {
              id: 4,
              name: "Biman Bangladesh Airlines",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F32d1df32-cced-483b-ba5a-8d3c8ca450cc.svg&w=750&q=75",
              order: 4
            },
            {
              id: 5,
              name: "Qatar Airways",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2Fabfdc8d7-603f-471f-850e-24222d85c7fd.svg&w=750&q=75",
              order: 5
            },
            {
              id: 6,
              name: "Emirates",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F5c59aaf5-aa7b-45db-9b7c-eef2f59baead.svg&w=750&q=75",
              order: 6
            },
            {
              id: 7,
              name: "Singapore Airlines",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F0b966fe9-f217-4603-a666-d05206870bbc.svg&w=750&q=75",
              order: 7
            },
            {
              id: 8,
              name: "Malaysia Airlines",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F4536b41a-9e2c-4af4-9bc6-29b7c62c03c5.svg&w=750&q=75",
              order: 8
            },
            {
              id: 9,
              name: "Turkish Airlines",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F28-Aug-2024%2F29215290-5f47-4d8e-a7d6-7700da193ca4.svg&w=750&q=75",
              order: 9
            },
            {
              id: 10,
              name: "Air India",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2Fce48e0d1-e202-4eb8-be5e-cab1c7047056.png&w=750&q=75",
              order: 10
            },
            {
              id: 11,
              name: "Cathay Pacific",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2Fce48e0d1-e202-4eb8-be5e-cab1c7047056.png&w=750&q=75",
              order: 11
            },
            {
              id: 12,
              name: "IndiGo",
              logo: "https://firsttrip.com/_next/image?url=https%3A%2F%2Fcdn.firsttrip.com%2FAdminUpload%2FTopAirline%2F05-Feb-2025%2F8a0a5bc1-cc0e-4fc0-8fae-800dacae794c.png&w=750&q=75",
              order: 12
            }
          ]
        };
        setData(defaultData);
        setTempData(defaultData);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ENDPOINT]);

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isAdmin) {
      Swal.fire({
        title: 'Access Denied',
        text: 'Admin access required. Please log in.',
        icon: 'warning',
        confirmButtonColor: '#445494',
      });
      return;
    }
    
    if (editMode) {
      // Exiting edit mode - reset temp data
      setTempData(data);
    }
    setEditMode(!editMode);
  };

  // Handle text changes
  const handleTextChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle airline logo upload - FIXED VERSION
  const handleAirlineLogoUpload = async (event, airlineId) => {
    const file = event.target.files[0];
    if (!file) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to upload images',
        icon: 'warning',
        confirmButtonColor: '#445494',
      });
      return;
    }

    // Reset the file input to allow uploading the same file again
    event.target.value = '';

    setUploadingLogo(airlineId);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", "airline-logo");

    try {
      const response = await fetch(`${API_BASE}/images/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${authToken}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Logo upload failed");

      const result = await response.json();
      
      // Update the specific airline's logo - FIXED: Properly updates the existing airline
      setTempData(prev => ({
        ...prev,
        airlines: prev.airlines.map(airline => 
          airline.id === airlineId 
            ? { ...airline, logo: result.image }
            : airline
        )
      }));

      Swal.fire({
        title: 'Success!',
        text: 'Logo uploaded successfully',
        icon: 'success',
        confirmButtonColor: '#445494',
        timer: 2000
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      Swal.fire({
        title: 'Upload Failed',
        text: 'Failed to upload logo. Please try again.',
        icon: 'error',
        confirmButtonColor: '#445494',
      });
    } finally {
      setUploadingLogo(null);
    }
  };

  // Add new airline
  const addNewAirline = () => {
    const newId = Math.max(...tempData.airlines.map(a => a.id), 0) + 1;
    const newAirline = {
      id: newId,
      name: "New Airline",
      logo: "https://via.placeholder.com/150x150?text=Upload+Logo",
      order: tempData.airlines.length + 1
    };

    setTempData(prev => ({
      ...prev,
      airlines: [...prev.airlines, newAirline]
    }));
  };

  // Remove airline with confirmation
  const removeAirline = async (airlineId) => {
    if (tempData.airlines.length <= 1) {
      Swal.fire({
        title: 'Cannot Remove',
        text: 'You must have at least one airline',
        icon: 'warning',
        confirmButtonColor: '#445494',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This airline will be removed permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setTempData(prev => ({
        ...prev,
        airlines: prev.airlines.filter(airline => airline.id !== airlineId)
      }));
      
      Swal.fire({
        title: 'Removed!',
        text: 'Airline has been removed.',
        icon: 'success',
        confirmButtonColor: '#445494',
      });
    }
  };

  // Edit airline in modal
  const editAirlineInModal = async (airline) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Airline',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Airline Name" value="${airline.name}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Logo URL" value="${airline.logo}">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Order" type="number" value="${airline.order}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#445494',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          logo: document.getElementById('swal-input2').value,
          order: parseInt(document.getElementById('swal-input3').value)
        };
      }
    });

    if (formValues) {
      setTempData(prev => ({
        ...prev,
        airlines: prev.airlines.map(a => 
          a.id === airline.id 
            ? { ...a, ...formValues }
            : a
        )
      }));
    }
  };

  // Edit text in modal
  const editTextInModal = async (field, currentValue, title, description) => {
    const { value: newValue } = await Swal.fire({
      title: title,
      input: 'textarea',
      inputLabel: description,
      inputValue: currentValue,
      inputAttributes: {
        'aria-label': `Edit ${field}`
      },
      showCancelButton: true,
      confirmButtonColor: '#445494',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'This field cannot be empty!';
        }
      }
    });

    if (newValue) {
      handleTextChange(field, newValue);
    }
  };

  // Save changes with confirmation
  const saveChanges = async () => {
    if (!isAdmin) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to save changes',
        icon: 'warning',
        confirmButtonColor: '#445494',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'All modifications will be updated on the website.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#445494',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, save changes!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsSaving(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(ENDPOINT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${authToken}`
        },
        body: JSON.stringify(tempData)
      });

      if (!response.ok) throw new Error("Failed to save changes");

      const updatedData = await response.json();
      setData(updatedData);
      setEditMode(false);
      
      Swal.fire({
        title: 'Success!',
        text: 'Changes saved successfully!',
        icon: 'success',
        confirmButtonColor: '#445494',
      });
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        title: 'Save Failed',
        text: 'Failed to save changes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#445494',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicate airlines for seamless mobile scrolling
  const duplicatedAirlines = tempData ? [...tempData.airlines, ...tempData.airlines] : [];

  if (isLoading) {
    return (
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#445494]"></div>
            <p className="mt-4 text-gray-600">Loading airlines...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Failed to load airlines. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 xl:px-44 2xl:px-60 relative">
      {/* Edit Mode Toggle Button */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20">
          {editMode ? (
            <div className="flex gap-2">
              <button 
                onClick={saveChanges}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg flex items-center justify-center"
                title="Save Changes"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={toggleEditMode}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg"
                title="Cancel Editing"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={toggleEditMode}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
              title="Edit Content"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Edit Mode Overlay Indicator */}
      {editMode && (
        <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none z-10 flex items-center justify-center">
          <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
            EDIT MODE ENABLED - Click on any content to edit
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          {editMode ? (
            <>
              <div 
                onClick={() => editTextInModal('title', tempData.title, 'Edit Title', 'Update the main title text')}
                className="cursor-pointer bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 mb-4"
              >
                <h2 className="text-[#445494] text-2xl sm:text-3xl md:text-4xl font-bold">
                  {tempData.title}
                </h2>
              </div>
              <div 
                onClick={() => editTextInModal('subtitle', tempData.subtitle, 'Edit Subtitle', 'Update the subtitle text')}
                className="cursor-pointer bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-white/20 transition-all duration-300"
              >
                <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                  {tempData.subtitle}
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[#445494] text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                {data.title}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                {data.subtitle}
              </p>
            </>
          )}
        </div>

        {/* Desktop view - grid layout */}
        <div className="hidden md:flex flex-wrap justify-center gap-6 lg:gap-8">
          {tempData.airlines.map((airline) => (
            <AirlineCard 
              key={airline.id}
              airline={airline}
              editMode={editMode}
              onEdit={editAirlineInModal}
              onRemove={removeAirline}
              onLogoChange={handleAirlineLogoUpload}
              uploadingLogo={uploadingLogo}
            />
          ))}
          
          {/* Add new airline button */}
          {editMode && (
            <div 
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-300"
              onClick={addNewAirline}
            >
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-500 text-sm font-medium">Add Airline</span>
            </div>
          )}
        </div>

        {/* Mobile view - continuously scrolling carousel */}
        <div className="md:hidden relative overflow-hidden">
          <style jsx>{`
            @keyframes smoothScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .scrolling-wrapper {
              display: flex;
              width: max-content;
              animation: smoothScroll 40s linear infinite;
            }
            
            .scrolling-wrapper:hover {
              animation-play-state: paused;
            }
            
            .scrolling-container {
              overflow: hidden;
              position: relative;
            }
          `}</style>
          
          <div className="scrolling-container">
            <div className="scrolling-wrapper flex gap-6">
              {duplicatedAirlines.map((airline, index) => (
                <div key={`${airline.id}-${index}`} className="flex-shrink-0">
                  <AirlineCard 
                    airline={airline}
                    editMode={editMode}
                    onEdit={editAirlineInModal}
                    onRemove={removeAirline}
                    onLogoChange={handleAirlineLogoUpload}
                    uploadingLogo={uploadingLogo}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient fade effects on edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent"></div>
        </div>

        {/* Add new airline button for mobile */}
        {editMode && (
          <div className="md:hidden mt-6 flex justify-center">
            <div 
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-300"
              onClick={addNewAirline}
            >
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-500 text-sm font-medium">Add Airline</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustedAirlines;