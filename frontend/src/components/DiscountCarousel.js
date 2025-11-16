"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Edit, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const DiscountCarousel = () => {
  const carouselRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [data, setData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const scrollInterval = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  const ENDPOINT = `${API_BASE}/home/carousel/`;
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
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
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
          title: "Save Big with Limited-Time Travel Offers",
          filters: [
            { id: 1, name: "All", is_active: true },
            { id: 2, name: "Flight", is_active: true },
            { id: 3, name: "Holidays", is_active: true }
          ],
          offers: [
            {
              id: 1,
              title: "FLY NONSTOP",
              route: "DHAKA TO RIYADH",
              airline: "US-BANGLA AIRLINES",
              discount: "30% OFF",
              image: "https://www.shutterstock.com/image-photo/bangkok-thailand-dec-14-2019-260nw-1591194475.jpg",
              buttonText: "Activate Mindcase",
              type: "Flight",
              order: 1
            },
            {
              id: 2,
              title: "EUROPE SPECIAL",
              route: "PARIS TO ROME",
              airline: "EMIRATES",
              discount: "25% OFF",
              image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
              buttonText: "Book Now",
              type: "Flight",
              order: 2
            },
            {
              id: 3,
              title: "ASIA DISCOUNT",
              route: "BANGKOK TO BALI",
              airline: "THAI AIRWAYS",
              discount: "40% OFF",
              image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
              buttonText: "View Deal",
              type: "Flight",
              order: 3
            },
            {
              id: 4,
              title: "CARIBBEAN ESCAPE",
              route: "MIAMI TO NASSAU",
              airline: "AMERICAN AIRLINES",
              discount: "35% OFF",
              image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
              buttonText: "Explore",
              type: "Holidays",
              order: 4
            },
            {
              id: 5,
              title: "MIDDLE EAST TOUR",
              route: "DUBAI TO ISTANBUL",
              airline: "TURKISH AIRLINES",
              discount: "20% OFF",
              image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
              buttonText: "Get Offer",
              type: "Holidays",
              order: 5
            },
            {
              id: 6,
              title: "TROPICAL GETAWAY",
              route: "SYDNEY TO FIJI",
              airline: "QANTAS",
              discount: "15% OFF",
              image: "https://images.unsplash.com/photo-1470114716159-e389f8712fda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
              buttonText: "Book Package",
              type: "Holidays",
              order: 6
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
        confirmButtonColor: '#55C3A9',
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

  // Handle offer changes
  const handleOfferChange = (index, field, value) => {
    setTempData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => 
        i === index ? { ...offer, [field]: value } : offer
      )
    }));
  };

  // Handle filter changes
  const handleFilterChange = (index, field, value) => {
    setTempData(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };

  // Add new offer
  const addNewOffer = () => {
    const newId = Math.max(...tempData.offers.map(o => o.id), 0) + 1;
    const newOffer = {
      id: newId,
      title: "NEW OFFER",
      route: "CITY TO CITY",
      airline: "AIRLINE NAME",
      discount: "10% OFF",
      image: "https://via.placeholder.com/500x300?text=Upload+Image",
      buttonText: "Get Offer",
      type: "Flight",
      order: tempData.offers.length + 1
    };

    setTempData(prev => ({
      ...prev,
      offers: [...prev.offers, newOffer]
    }));
  };

  // Remove offer with confirmation
  const removeOffer = async (offerId) => {
    if (tempData.offers.length <= 1) {
      Swal.fire({
        title: 'Cannot Remove',
        text: 'You must have at least one offer',
        icon: 'warning',
        confirmButtonColor: '#55C3A9',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This offer will be removed permanently!',
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
        offers: prev.offers.filter(offer => offer.id !== offerId)
      }));
      
      Swal.fire({
        title: 'Removed!',
        text: 'Offer has been removed.',
        icon: 'success',
        confirmButtonColor: '#55C3A9',
      });
    }
  };

  // Handle image upload
  const handleImageUpload = async (event, offerId) => {
    const file = event.target.files[0];
    if (!file) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to upload images',
        icon: 'warning',
        confirmButtonColor: '#55C3A9',
      });
      return;
    }

    event.target.value = '';
    setUploadingImage(offerId);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", "carousel-offer");

    try {
      const response = await fetch(`${API_BASE}/images/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${authToken}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Image upload failed");

      const result = await response.json();
      
      setTempData(prev => ({
        ...prev,
        offers: prev.offers.map(offer => 
          offer.id === offerId 
            ? { ...offer, image: result.image }
            : offer
        )
      }));

      Swal.fire({
        title: 'Success!',
        text: 'Image uploaded successfully',
        icon: 'success',
        confirmButtonColor: '#55C3A9',
        timer: 2000
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        title: 'Upload Failed',
        text: 'Failed to upload image. Please try again.',
        icon: 'error',
        confirmButtonColor: '#55C3A9',
      });
    } finally {
      setUploadingImage(null);
    }
  };

  // Save changes with confirmation
  const saveChanges = async () => {
    if (!isAdmin) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to save changes',
        icon: 'warning',
        confirmButtonColor: '#55C3A9',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'All modifications will be updated on the website.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#55C3A9',
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
        confirmButtonColor: '#55C3A9',
      });
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        title: 'Save Failed',
        text: 'Failed to save changes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#55C3A9',
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
      confirmButtonColor: '#55C3A9',
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

  // Edit offer in modal
  const editOfferInModal = async (offer) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Offer',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Title" value="${offer.title}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Route" value="${offer.route}">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Airline" value="${offer.airline}">` +
        `<input id="swal-input4" class="swal2-input" placeholder="Discount" value="${offer.discount}">` +
        `<input id="swal-input5" class="swal2-input" placeholder="Button Text" value="${offer.buttonText}">` +
        `<select id="swal-input6" class="swal2-input">
          <option value="Flight" ${offer.type === 'Flight' ? 'selected' : ''}>Flight</option>
          <option value="Holidays" ${offer.type === 'Holidays' ? 'selected' : ''}>Holidays</option>
        </select>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#55C3A9',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          title: document.getElementById('swal-input1').value,
          route: document.getElementById('swal-input2').value,
          airline: document.getElementById('swal-input3').value,
          discount: document.getElementById('swal-input4').value,
          buttonText: document.getElementById('swal-input5').value,
          type: document.getElementById('swal-input6').value
        };
      }
    });

    if (formValues) {
      const offerIndex = tempData.offers.findIndex(o => o.id === offer.id);
      if (offerIndex !== -1) {
        setTempData(prev => ({
          ...prev,
          offers: prev.offers.map((o, i) => 
            i === offerIndex ? { ...o, ...formValues } : o
          )
        }));
      }
    }
  };

  // Carousel functionality
  const filteredOffers = tempData ? (
    activeFilter === "All"
      ? tempData.offers
      : tempData.offers.filter((offer) => offer.type === activeFilter)
  ) : [];

  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = isMobile ? 280 : 300;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
    resetAutoScroll();
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = isMobile ? 280 : 300;
      if (
        carouselRef.current.scrollLeft + carouselRef.current.clientWidth >=
        carouselRef.current.scrollWidth - 10
      ) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
    resetAutoScroll();
  };

  const startAutoScroll = () => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);

    // Don't start auto-scroll in edit mode
    if (editMode) return;

    scrollInterval.current = setInterval(() => {
      if (carouselRef.current) {
        const scrollAmount = isMobile ? 280 : 300;
        if (
          carouselRef.current.scrollLeft + carouselRef.current.clientWidth >=
          carouselRef.current.scrollWidth - 10
        ) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }, 3000);
  };

  const resetAutoScroll = () => {
    setIsAutoScrolling(false);
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    
    // Don't restart auto-scroll in edit mode
    if (editMode) return;
    
    setTimeout(() => {
      setIsAutoScrolling(true);
      startAutoScroll();
    }, 10000);
  };

  useEffect(() => {
    // Clear any existing interval when edit mode changes
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }

    if (isAutoScrolling && tempData && !editMode) {
      startAutoScroll();
    }
    
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [isAutoScrolling, filteredOffers, isMobile, tempData, editMode]);

  if (isLoading) {
    return (
      <div className="bg-white py-8 md:py-12 px-4 sm:px-6 lg:px-8 xl:px-44 2xl:px-60">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#55C3A9]"></div>
          <p className="mt-4 text-gray-600">Loading travel offers...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white py-8 md:py-12 px-4 sm:px-6 lg:px-8 xl:px-44 2xl:px-60">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">Failed to load travel offers. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 md:py-12 px-4 sm:px-6 lg:px-8 xl:px-44 2xl:px-60 relative">
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

      <div className="max-w-7xl mx-auto relative">
        {/* Title Section with Filter Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-5 mt-5 gap-4 md:gap-0">
          <div className="w-full md:w-auto">
            {editMode ? (
              <div 
                onClick={() => editTextInModal('title', tempData.title, 'Edit Title', 'Update the main title text')}
                className="cursor-pointer bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-white/20 transition-all duration-300"
              >
                <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold text-center md:text-left" style={{ color: "#445494" }}>
                  {tempData.title}
                </h1>
              </div>
            ) : (
              <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold text-center md:text-left" style={{ color: "#445494" }}>
                {data.title}
              </h1>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
            {tempData.filters.map((filter, index) => (
              <button
                key={filter.id}
                onClick={() => !editMode && setActiveFilter(filter.name)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-sm md:text-base ${
                  activeFilter === filter.name ? "text-white" : "text-gray-600"
                } ${editMode ? 'cursor-pointer border-2 border-dashed border-gray-300' : ''}`}
                style={{
                  backgroundColor: activeFilter === filter.name ? "#55C3A9" : "#f3f4f6",
                }}
                onClickCapture={editMode ? () => editTextInModal(`filters[${index}].name`, filter.name, 'Edit Filter Name', 'Update the filter name') : undefined}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-center md:justify-end mb-4 space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            style={{ color: "#5A53A7" }}
            aria-label="Previous offers"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            style={{ color: "#5A53A7" }}
            aria-label="Next offers"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Discount Cards Carousel */}
        {filteredOffers.length > 0 ? (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide pb-6 gap-4 md:gap-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", scrollPadding: "0 1rem" }}
          >
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="flex-shrink-0 relative rounded-xl overflow-hidden shadow-lg w-72 sm:w-80 transform transition-all hover:scale-105 snap-start"
                style={{
                  border: "1px solid #e2e8f0",
                  minHeight: isMobile ? "380px" : "400px",
                }}
              >
                {/* Edit Mode Overlay for Offer */}
                {editMode && (
                  <div className="absolute top-2 left-2 flex gap-1 z-20">
                    <button 
                      onClick={() => editOfferInModal(offer)}
                      className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                      title="Edit offer"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => removeOffer(offer.id)}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove offer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Discount Badge */}
                <div
                  className="absolute top-4 right-4 z-10 bg-white px-3 py-1 rounded-full shadow-md font-bold text-sm md:text-base"
                  style={{ color: "#5A53A7" }}
                >
                  {offer.discount}
                </div>

                {/* Card Image with Upload Option */}
                <div 
                  className="h-40 sm:h-48 relative overflow-hidden cursor-pointer"
                  onClick={editMode ? () => document.getElementById(`image-upload-${offer.id}`)?.click() : undefined}
                >
                  {uploadingImage === offer.id && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#55C3A9]"></div>
                    </div>
                  )}
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  {editMode && (
                    <>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <input
                        id={`image-upload-${offer.id}`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, offer.id)}
                      />
                    </>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-6 bg-white">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-2"
                    style={{ color: "#445494" }}
                  >
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {offer.route}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    {offer.airline}
                  </p>

                  <button
                    className="w-full py-2 sm:py-3 rounded-lg font-bold text-white transition-all hover:opacity-90 text-sm sm:text-base"
                    style={{ backgroundColor: "#55C3A9" }}
                  >
                    {offer.buttonText}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add New Offer Button */}
            {editMode && (
              <div 
                className="flex-shrink-0 w-72 sm:w-80 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-300"
                style={{ minHeight: isMobile ? "380px" : "400px" }}
                onClick={addNewOffer}
              >
                <Plus className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-gray-500 text-lg font-medium">Add New Offer</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No offers available for this category
            </p>
          </div>
        )}

        {/* Mobile indicator dots */}
        {isMobile && !editMode && (
          <div className="flex justify-center mt-4 space-x-2">
            {filteredOffers.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300"
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCarousel;