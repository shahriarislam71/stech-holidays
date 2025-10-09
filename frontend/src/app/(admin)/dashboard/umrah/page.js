// app/(admin)/umrah/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiEye,
  FiFileText,
} from "react-icons/fi";
import Image from "next/image";

export default function UmrahAdminPage() {
  const [activeTab, setActiveTab] = useState("packages");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-blue-100 text-blue-800",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (activeTab === "packages") {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-packages/`,
            {
              headers: { Authorization: `Token ${token}` },
            }
          );
          const data = await res.json();
          setPackages(Array.isArray(data) ? data : []);
        } else {
          let url = `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-bookings/`;
          const params = new URLSearchParams();
          if (statusFilter !== "all") params.append("status", statusFilter);
          if (dateFilter !== "all") params.append("date_range", dateFilter);
          if (searchTerm) params.append("search", searchTerm);

          if (params.toString()) url += `?${params.toString()}`;

          const res = await fetch(url, {
            headers: { Authorization: `Token ${token}` },
          });
          const data = await res.json();
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error:", error);
        setPackages([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, statusFilter, dateFilter, searchTerm]);

  const handleStatusUpdate = async (id, newStatus, type = "booking") => {
    try {
      const token = localStorage.getItem("authToken");
      const endpoint =
        type === "booking"
          ? `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-bookings/${id}/`
          : `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-packages/${id}/`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        if (type === "booking") {
          setBookings(
            bookings.map((b) => (b.id === updatedItem.id ? updatedItem : b))
          );
        } else {
          setPackages(
            packages.map((p) => (p.id === updatedItem.id ? updatedItem : p))
          );
        }
        toast.success("Status updated successfully");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeletePackage = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this package? All associated bookings will be kept."
      )
    ) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-packages/${id}/`,
          {
            method: "DELETE",
            headers: { Authorization: `Token ${token}` },
          }
        );

        if (response.ok) {
          setPackages(packages.filter((p) => p.id !== id));
          toast.success("Package deleted successfully");
        } else {
          throw new Error("Failed to delete package");
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      // Append all fields
      Object.keys(currentPackage).forEach((key) => {
        if (key !== "image" && key !== "featured_image") {
          formData.append(key, currentPackage[key]);
        }
      });

      if (currentPackage.featured_image instanceof File) {
        formData.append("featured_image", currentPackage.featured_image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-packages/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const newPackage = await response.json();
        setPackages([...packages, newPackage]);
        toast.success("Package created successfully");
        setShowPackageModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create package");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdatePackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      Object.keys(currentPackage).forEach((key) => {
        if (key !== "image" && key !== "featured_image") {
          formData.append(key, currentPackage[key]);
        }
      });

      if (currentPackage.featured_image instanceof File) {
        formData.append("featured_image", currentPackage.featured_image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/holidays-visa/umrah-packages/${currentPackage.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedPackage = await response.json();
        setPackages(
          packages.map((p) => (p.id === updatedPackage.id ? updatedPackage : p))
        );
        setShowPackageModal(false);
        toast.success("Package updated successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update package");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#445494]">Umrah Management</h1>
        <p className="text-gray-600">Manage Umrah packages and bookings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("packages")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === "packages"
                ? "border-[#5A53A7] text-[#5A53A7]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Packages
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === "bookings"
                ? "border-[#5A53A7] text-[#5A53A7]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Bookings
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

        {activeTab === "packages" && (
          <button
            onClick={() => {
              setCurrentPackage({
                title: "",
                slug: "",
                description: "",
                duration: "",
                nights: 7,
                days: 8,
                max_people: 2,
                price: 0,
                discount_price: 0,
                availability_start: "",
                availability_end: "",
                includes_flight: false,
                includes_hotel: true,
                includes_transport: true,
                includes_visa: true,
                featured_image: null,
              });
              setShowPackageModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5A53A7] hover:bg-[#445494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A53A7]"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Package
          </button>
        )}

        {activeTab === "bookings" && (
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

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
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A53A7]"></div>
        </div>
      ) : activeTab === "packages" ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Package
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Includes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.length > 0 ? (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {pkg.featured_image && (
                              <Image
                                src={pkg.featured_image}
                                alt={pkg.title}
                                width={40} // h-10 = 40px
                                height={40} // w-10 = 40px
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pkg.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Max: {pkg.max_people} people
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pkg.nights} Nights / {pkg.days} Days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pkg.discount_price > 0 ? (
                            <>
                              BDT {pkg.discount_price.toLocaleString()}
                              <span className="ml-2 text-xs text-red-500 line-through">
                                BDT {pkg.price.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <>BDT {pkg.price.toLocaleString()}</>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {pkg.includes_flight && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Flight
                            </span>
                          )}
                          {pkg.includes_hotel && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Hotel
                            </span>
                          )}
                          {pkg.includes_transport && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Transport
                            </span>
                          )}
                          {pkg.includes_visa && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Visa
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pkg.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pkg.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentPackage(pkg);
                            setShowPackageModal(true);
                          }}
                          className="text-[#5A53A7] hover:text-[#445494] mr-3"
                        >
                          <FiEdit2 className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No packages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-blue-800 font-medium">Total Bookings</div>
                <div className="text-3xl font-bold mt-2">{bookings.length}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-yellow-800 font-medium">Pending</div>
                <div className="text-3xl font-bold mt-2">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-green-800 font-medium">Confirmed</div>
                <div className="text-3xl font-bold mt-2">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-red-800 font-medium">Cancelled</div>
                <div className="text-3xl font-bold mt-2">
                  {bookings.filter((b) => b.status === "cancelled").length}
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Booking #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Package
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Departure
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Travelers
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          UM{booking.id.toString().padStart(6, "0")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.contact_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {booking.package?.title || "Package deleted"}
                        </div>
                        <div className="text-sm text-gray-500">
                          BDT {booking.package?.price?.toLocaleString() || "0"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.departure_date
                            ? new Date(
                                booking.departure_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.travelers}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              booking.id,
                              e.target.value,
                              "booking"
                            )
                          }
                          className={`text-xs leading-5 font-semibold rounded-full px-3 py-1 ${
                            statusOptions.find(
                              (s) => s.value === booking.status
                            )?.color || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setCurrentBooking(booking);
                            setShowBookingModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FiEye className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No bookings found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && currentPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPackageModal(false)}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5A53A7] to-[#445494] px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  {currentPackage.id
                    ? "Edit Umrah Package"
                    : "Add New Umrah Package"}
                </h3>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <form
                  onSubmit={
                    currentPackage.id
                      ? handleUpdatePackage
                      : handleCreatePackage
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Package Title */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.title}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            title: e.target.value,
                          })
                        }
                        required
                        placeholder="Enter package title"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.description}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            description: e.target.value,
                          })
                        }
                        required
                        placeholder="Detailed description of the package"
                      />
                    </div>

                    {/* Featured Image */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Featured Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCurrentPackage({
                              ...currentPackage,
                              featured_image: file,
                            });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {currentPackage.featured_image && (
                        <div className="mt-2 w-full h-48 relative rounded-md overflow-hidden">
                          <Image
                            src={
                              typeof currentPackage.featured_image === "string"
                                ? currentPackage.featured_image
                                : URL.createObjectURL(
                                    currentPackage.featured_image
                                  )
                            }
                            alt="Package Preview"
                            width={500} // adjust as needed
                            height={500} // adjust as needed
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nights <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.nights}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            nights: parseInt(e.target.value) || 0,
                          })
                        }
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Days <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.days}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            days: parseInt(e.target.value) || 0,
                          })
                        }
                        required
                        min="1"
                      />
                    </div>

                    {/* Max People */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max People <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.max_people}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            max_people: parseInt(e.target.value) || 1,
                          })
                        }
                        required
                        min="1"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.status || "active"}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            status: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Pricing */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (BDT) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          ৳
                        </span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                          value={currentPackage.price}
                          onChange={(e) =>
                            setCurrentPackage({
                              ...currentPackage,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Price (BDT)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          ৳
                        </span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                          value={currentPackage.discount_price}
                          onChange={(e) =>
                            setCurrentPackage({
                              ...currentPackage,
                              discount_price: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Availability Dates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability Start{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.availability_start}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            availability_start: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability End <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A53A7] focus:border-[#5A53A7] transition"
                        value={currentPackage.availability_end}
                        onChange={(e) =>
                          setCurrentPackage({
                            ...currentPackage,
                            availability_end: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* Inclusions */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Inclusions
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                            checked={currentPackage.includes_flight}
                            onChange={(e) =>
                              setCurrentPackage({
                                ...currentPackage,
                                includes_flight: e.target.checked,
                              })
                            }
                          />
                          <span>Includes Flight</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                            checked={currentPackage.includes_hotel}
                            onChange={(e) =>
                              setCurrentPackage({
                                ...currentPackage,
                                includes_hotel: e.target.checked,
                              })
                            }
                          />
                          <span>Includes Hotel</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                            checked={currentPackage.includes_transport}
                            onChange={(e) =>
                              setCurrentPackage({
                                ...currentPackage,
                                includes_transport: e.target.checked,
                              })
                            }
                          />
                          <span>Includes Transport</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#5A53A7] focus:ring-[#5A53A7] border-gray-300 rounded"
                            checked={currentPackage.includes_visa}
                            onChange={(e) =>
                              setCurrentPackage({
                                ...currentPackage,
                                includes_visa: e.target.checked,
                              })
                            }
                          />
                          <span>Includes Visa</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPackageModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#5A53A7] to-[#445494] text-white rounded-lg hover:opacity-90 transition"
                    >
                      {currentPackage.id ? "Update Package" : "Create Package"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showBookingModal && currentBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowBookingModal(false)}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5A53A7] to-[#445494] px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  Umrah Booking #UM
                  {currentBooking.id.toString().padStart(6, "0")}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusOptions.find(
                        (s) => s.value === currentBooking.status
                      )?.color || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusOptions.find(
                      (s) => s.value === currentBooking.status
                    )?.label || currentBooking.status}
                  </span>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                      Customer Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">
                          {currentBooking.contact_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{currentBooking.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{currentBooking.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                      Booking Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Package</p>
                        <p className="font-medium">
                          {currentBooking.package?.title || "Package deleted"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">
                          BDT{" "}
                          {currentBooking.package?.price?.toLocaleString() ||
                            "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Departure Date</p>
                        <p className="font-medium">
                          {currentBooking.departure_date
                            ? new Date(
                                currentBooking.departure_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Travelers</p>
                        <p className="font-medium">
                          {currentBooking.travelers}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booking Date</p>
                        <p className="font-medium">
                          {new Date(
                            currentBooking.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Inclusions */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                    Package Inclusions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentBooking.package?.includes_flight && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        Flight
                      </span>
                    )}
                    {currentBooking.package?.includes_hotel && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Hotel
                      </span>
                    )}
                    {currentBooking.package?.includes_transport && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        Transport
                      </span>
                    )}
                    {currentBooking.package?.includes_visa && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                        Visa
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Requests */}
                {currentBooking.custom_request && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                      Special Requests
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {currentBooking.custom_request}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between items-center">
                <div>
                  <select
                    value={currentBooking.status}
                    onChange={(e) => {
                      handleStatusUpdate(
                        currentBooking.id,
                        e.target.value,
                        "booking"
                      );
                      setCurrentBooking({
                        ...currentBooking,
                        status: e.target.value,
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusOptions.find(
                        (s) => s.value === currentBooking.status
                      )?.color || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBookingModal(false)}
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
    </div>
  );
}
