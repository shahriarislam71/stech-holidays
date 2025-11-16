'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';

const FlightTracker = () => {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const ENDPOINT = `${API_BASE}/home/flight-tracker/`;
  const PROFILE_ENDPOINT = `${API_BASE}/auth/profile/`;

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setIsAdmin(false);
          return;
        }

        const response = await fetch(PROFILE_ENDPOINT, {
          headers: {
            'Authorization': `Token ${authToken}`
          }
        });

        if (response.ok) {
          const profile = await response.json();
          setIsAdmin(profile.is_admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [PROFILE_ENDPOINT]);

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
          title: "Flight Tracking Made Easy",
          description1: "With Firsttrip, tracking your flight is a breeze!",
          description2: "Stay updated on your flights effortlessly using our handy flight tracker.",
          buttonText: "Open Flight Tracker",
          buttonAction: "#flight-tracker",
          colors: {
            primary: "#55C3A9",
            secondary: "#5A53A7",
            hover: "#54ACA4",
            text: "#445494"
          }
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
        confirmButtonColor: '#f1601f',
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
  const handleTextChange = (path, value) => {
    const paths = path.split('.');
    setTempData(prev => {
      const newData = {...prev};
      let current = newData;
      
      for (let i = 0; i < paths.length - 1; i++) {
        current = current[paths[i]];
      }
      
      current[paths[paths.length - 1]] = value;
      return newData;
    });
  };

  // Save changes with confirmation
  const saveChanges = async () => {
    if (!isAdmin) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to save changes',
        icon: 'warning',
        confirmButtonColor: '#f1601f',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'All modifications will be updated on the website.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f1601f',
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
        confirmButtonColor: '#f1601f',
      });
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        title: 'Save Failed',
        text: 'Failed to save changes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f1601f',
      });
    } finally {
      setIsSaving(false);
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
      confirmButtonColor: '#f1601f',
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

  // Edit button in modal
  const editButtonInModal = async (currentButton) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Button',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Button Text" value="${currentButton.text}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Button Action/Link" value="${currentButton.action}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#f1601f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          text: document.getElementById('swal-input1').value,
          action: document.getElementById('swal-input2').value
        };
      }
    });

    if (formValues) {
      handleTextChange("buttonText", formValues.text);
      handleTextChange("buttonAction", formValues.action);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] px-4 md:px-[190px] py-12" style={{ backgroundColor: 'rgb(248, 251, 254)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center w-full">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#55C3A9]"></div>
            <p className="mt-4 text-gray-600">Loading flight tracker...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] px-4 md:px-[190px] py-12" style={{ backgroundColor: 'rgb(248, 251, 254)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center w-full">
            <p className="text-gray-600">Failed to load flight tracker. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[300px] px-4 md:px-[190px] py-12 relative" style={{ backgroundColor: 'rgb(248, 251, 254)' }}>
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

      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Left Content - Will appear first on mobile */}
        <div className="flex-1 md:pr-8 order-2 md:order-1 text-center md:text-left">
          {editMode ? (
            <div 
              onClick={() => editTextInModal('title', tempData.title, 'Edit Title', 'Update the main title text')}
              className="cursor-pointer bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-all duration-300 mb-4"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-[#445494]">
                {tempData.title}
              </h1>
            </div>
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold text-[#445494] mb-4">
              {data.title}
            </h1>
          )}
          
          {editMode ? (
            <>
              <div 
                onClick={() => editTextInModal('description1', tempData.description1, 'Edit First Description', 'Update the first description text')}
                className="cursor-pointer bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-all duration-300 mb-2"
              >
                <p className="text-base md:text-lg text-gray-600">
                  {tempData.description1}
                </p>
              </div>
              <div 
                onClick={() => editTextInModal('description2', tempData.description2, 'Edit Second Description', 'Update the second description text')}
                className="cursor-pointer bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-all duration-300 mb-6 md:mb-8"
              >
                <p className="text-base md:text-lg text-gray-600">
                  {tempData.description2}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-base md:text-lg text-gray-600 mb-2">
                {data.description1}
              </p>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                {data.description2}
              </p>
            </>
          )}
          
          <div className="border-t border-gray-200 my-4 md:my-6"></div>
          
          {editMode ? (
            <div 
              onClick={() => editButtonInModal({ text: tempData.buttonText, action: tempData.buttonAction })}
              className="cursor-pointer bg-[#55C3A9] hover:bg-[#54ACA4] text-white font-semibold py-3 px-8 rounded-full transition duration-300 w-full md:w-auto inline-flex justify-center items-center border-2 border-dashed border-white/50"
            >
              {tempData.buttonText}
            </div>
          ) : (
            <button className="bg-[#55C3A9] hover:bg-[#54ACA4] text-white font-semibold py-3 px-8 rounded-full transition duration-300 w-full md:w-auto">
              {data.buttonText}
            </button>
          )}
        </div>
        
        {/* Right Content - Radar Animation - Will appear first on mobile */}
        <div className="flex-1 flex justify-center order-1 md:order-2 mb-6 md:mb-0">
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            {/* Radar Base */}
            <div className="absolute inset-0 rounded-full border-4 border-[#5A53A7] opacity-20"></div>
            
            {/* Radar Circles */}
            <div className="absolute inset-0 rounded-full border-2 border-[#5A53A7] opacity-20" style={{ top: '25%', left: '25%', right: '25%', bottom: '25%' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-[#5A53A7] opacity-20" style={{ top: '50%', left: '50%', right: '50%', bottom: '50%' }}></div>
            
            {/* Radar Sweep - Fixed position */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full">
              <div className="absolute top-0 left-1/2 w-1/2 h-full origin-left animate-radar-sweep">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#55C3A9]/20 to-transparent"></div>
              </div>
            </div>
            
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-[#55C3A9] rounded-full"></div>
            
            {/* Random Dots (flight signals) */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 md:w-3 md:h-3 bg-[#5A53A7] rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#55C3A9] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 right-1/3 w-2 h-2 md:w-3 md:h-3 bg-[#5A53A7] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#54ACA4] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>

      {/* Add custom animation keyframes */}
      <style jsx global>{`
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FlightTracker;