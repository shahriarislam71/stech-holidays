"use client";
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { Edit, Save, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const DownloadApp = () => {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const screenshotFileInputRef = useRef(null);
  const qrCodeFileInputRef = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const ENDPOINT = `${API_BASE}/home/app/`;
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
          title: "Your Ultimate",
          highlightedTitle: "Travel Companion",
          description: "Discover amazing destinations, book with ease, and get exclusive offers - all in one app.",
          primaryButton: {
            text: "Download Now",
            action: "download"
          },
          appStoreBadges: {
            apple: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg",
            google: "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          },
          qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/app-download",
          screenshot: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
          promoText: "Scan to download our app and get",
          promoHighlight: "10% off",
          promoSubtext: "your first booking!",
          availability: "*Available on iOS and Android",
          features: [
            {
              icon: "clock",
              title: "Real-time Updates",
              description: "Get instant updates on your bookings"
            },
            {
              icon: "users",
              title: "Group Booking",
              description: "Easy group booking management"
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

  // Handle image upload
  const handleImageUpload = async (event, imageType) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isAdmin) {
      alert("Authentication required for image upload");
      return;
    }

    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", `app-${imageType}`);

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE}/images/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${authToken}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Image upload failed");

      const result = await response.json();
      
      if (imageType === 'screenshot') {
        handleTextChange("screenshot", result.image);
      } else if (imageType === 'qrCode') {
        handleTextChange("qrCode", result.image);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
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
      title: 'Edit Download Button',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Button Text" value="${currentButton.text}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#f1601f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          text: document.getElementById('swal-input1').value,
          action: "download"
        };
      }
    });

    if (formValues) {
      handleTextChange("primaryButton.text", formValues.text);
    }
  };

  // Edit promo text in modal
  const editPromoTextInModal = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Promo Text',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Promo Text" value="${tempData.promoText}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Promo Highlight" value="${tempData.promoHighlight}">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Promo Subtext" value="${tempData.promoSubtext}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#f1601f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          promoText: document.getElementById('swal-input1').value,
          promoHighlight: document.getElementById('swal-input2').value,
          promoSubtext: document.getElementById('swal-input3').value
        };
      }
    });

    if (formValues) {
      handleTextChange("promoText", formValues.promoText);
      handleTextChange("promoHighlight", formValues.promoHighlight);
      handleTextChange("promoSubtext", formValues.promoSubtext);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-10 md:py-16 bg-gradient-to-br from-[#f7f9ff] to-[#e8f0fe] flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading app section...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full py-10 md:py-16 bg-gradient-to-br from-[#f7f9ff] to-[#e8f0fe] flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load app section. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 md:py-16 bg-gradient-to-br from-[#f7f9ff] to-[#e8f0fe] relative">
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

      <div className="mx-auto px-4 sm:px-6 lg:px-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* App Mockup Image - Realistic iPhone mockup - Hidden on mobile, shown on tablet+ */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1 relative">
          {editMode && (
            <button
              onClick={() => screenshotFileInputRef.current?.click()}
              className="absolute top-4 left-4 bg-blue-500 text-white rounded-full p-2 z-10"
              title="Change screenshot image"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          <input
            type="file"
            ref={screenshotFileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'screenshot')}
          />
          
          <div className="relative hidden md:block">
            <div className="w-64 h-auto bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-gray-900 relative">
              {/* iPhone notch */}
              <div className="h-6 bg-gray-900 flex items-center justify-center relative">
                <div className="w-24 h-4 bg-gray-900 rounded-full absolute -bottom-1"></div>
              </div>
              {/* Screen content */}
              <div className="p-1">
                <div className="h-96 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[28px] overflow-hidden relative">
                  {/* App screenshot mockup */}
                  {uploadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <Image
                      src={editMode ? tempData.screenshot : data.screenshot}
                      alt="Travel App Screenshot"
                      width={634}
                      height={634}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* App logo overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-white bg-opacity-90 rounded-xl p-2 shadow-md w-20 h-20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Home button indicator */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <div className="w-24 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-indigo-200 opacity-30"></div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-purple-200 opacity-30"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 space-y-6 order-1 md:order-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight text-center md:text-left">
            {editMode ? (
              <div className="flex flex-col items-center md:items-start space-y-2">
                <div 
                  onClick={() => editTextInModal('title', tempData.title, 'Edit Main Title', 'Update the main title text')}
                  className="cursor-pointer bg-white/50 backdrop-blur-sm rounded-lg p-3 hover:bg-white/70 transition-all duration-300"
                >
                  <span className="text-gray-800 bg-transparent border-none text-center md:text-left focus:ring-2 focus:ring-yellow-400 rounded">
                    {tempData.title}
                  </span>
                </div>
                <div 
                  onClick={() => editTextInModal('highlightedTitle', tempData.highlightedTitle, 'Edit Highlighted Title', 'Update the highlighted subtitle text')}
                  className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-3 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  <span className="text-white bg-transparent border-none text-center md:text-left focus:ring-2 focus:ring-yellow-400 rounded">
                    {tempData.highlightedTitle}
                  </span>
                </div>
              </div>
            ) : (
              <>
                {data.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {data.highlightedTitle}
                </span>
              </>
            )}
          </h2>
          
          {editMode ? (
            <div 
              onClick={() => editTextInModal('description', tempData.description, 'Edit Description', 'Update the description text')}
              className="cursor-pointer bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 text-base md:text-lg text-gray-600 max-w-3xl mx-auto md:mx-0 w-full p-4 rounded-lg hover:bg-white/70 transition-all duration-300 text-center md:text-left"
            >
              {tempData.description}
            </div>
          ) : (
            <p className="text-base md:text-lg text-gray-600 text-center md:text-left">
              {data.description}
            </p>
          )}
          
          {/* Mobile App Mockup - Only visible on mobile */}
          <div className="md:hidden flex justify-center my-4 relative">
            {editMode && (
              <button
                onClick={() => screenshotFileInputRef.current?.click()}
                className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1 z-10"
                title="Change screenshot image"
              >
                <Upload className="w-3 h-3" />
              </button>
            )}
            <div className="relative w-48 h-auto bg-gray-900 rounded-[36px] shadow-xl overflow-hidden border-[10px] border-gray-900">
              {/* iPhone notch */}
              <div className="h-5 bg-gray-900 flex items-center justify-center relative">
                <div className="w-20 h-3 bg-gray-900 rounded-full absolute -bottom-1"></div>
              </div>
              {/* Screen content */}
              <div className="p-1">
                <div className="h-72 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[24px] overflow-hidden relative">
                  {uploadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <Image
                      src={editMode ? tempData.screenshot : data.screenshot}
                      alt="Travel App Screenshot"
                      width={634}
                      height={634}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* App logo overlay */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <div className="bg-white bg-opacity-90 rounded-lg p-1.5 shadow-md w-14 h-14 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Home button indicator */}
              <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
                <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-sm relative">
            {editMode && (
              <button
                onClick={() => qrCodeFileInputRef.current?.click()}
                className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 z-10"
                title="Change QR code image"
              >
                <Upload className="w-3 h-3" />
              </button>
            )}
            <input
              type="file"
              ref={qrCodeFileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'qrCode')}
            />
            
            {/* QR Code */}
            <div className="flex-shrink-0">
              {uploadingImage ? (
                <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-indigo-100 rounded-md flex items-center justify-center bg-gray-200">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <Image 
                  src={editMode ? tempData.qrCode : data.qrCode}
                  alt="Download App QR Code"
                  width={150}
                  height={150}
                  className="w-20 h-20 md:w-24 md:h-24 border-2 border-indigo-100 rounded-md"
                />
              )}
            </div>
            
            <div 
              onClick={editMode ? editPromoTextInModal : undefined}
              className={editMode ? "cursor-pointer text-center md:text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-300" : "text-center md:text-left"}
            >
              <p className="text-sm md:text-base text-gray-700 mb-2">
                {editMode ? tempData.promoText : data.promoText}{' '}
                <span className="font-semibold text-indigo-600">
                  {editMode ? tempData.promoHighlight : data.promoHighlight}
                </span>{' '}
                {editMode ? tempData.promoSubtext : data.promoSubtext}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {editMode ? tempData.availability : data.availability}
              </p>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col gap-4 mt-6">
            {/* Primary Download Button - Mobile Optimized */}
            {editMode ? (
              <div 
                onClick={() => editButtonInModal(tempData.primaryButton)}
                className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-6 md:py-4 md:px-8 rounded-xl flex items-center justify-center transition duration-300 shadow-lg hover:shadow-xl border-2 border-dashed border-white/50"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                {tempData.primaryButton.text}
              </div>
            ) : (
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 md:py-4 md:px-8 rounded-xl flex items-center justify-center transition duration-300 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                {data.primaryButton.text}
              </button>
            )}
            
            {/* App Store Badges - Stacked on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href="#" className="h-12 md:h-14 w-auto flex justify-center">
                <Image 
                  src={editMode ? tempData.appStoreBadges.apple : data.appStoreBadges.apple}
                  alt="Download on the App Store"
                  width={135}
                  height={40}
                  className="h-full object-contain"
                />
              </a>
              <a href="#" className="h-12 md:h-14 w-auto flex justify-center">
                <Image 
                  src={editMode ? tempData.appStoreBadges.google : data.appStoreBadges.google}
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="h-full object-contain"
                />
              </a>
            </div>
          </div>

          {/* Feature Highlights - Mobile Only */}
          <div className="md:hidden grid grid-cols-2 gap-4 mt-6">
            {(editMode ? tempData.features : data.features).map((feature, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  feature.icon === 'clock' ? 'bg-indigo-100' : 'bg-purple-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    feature.icon === 'clock' ? 'text-indigo-600' : 'text-purple-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {feature.icon === 'clock' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    )}
                  </svg>
                </div>
                <span className="text-sm font-medium">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;