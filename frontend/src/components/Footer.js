"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';
import { Pencil, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import useEditableComponent from '@/hooks/useEditableComponent';

const FALLBACK_DATA = {
  logo: '/Stech-Holodays (1).webp',
  tagline: 'Let us be your trusted travel companion every step of the way.',
  socialLinks: [
    { platform: 'facebook', url: '#' },
    { platform: 'twitter', url: '#' },
    { platform: 'instagram', url: '#' },
    { platform: 'youtube', url: '#' },
    { platform: 'linkedin', url: '#' },
  ],
  exploreLinks: [
    { label: 'Flight', url: '/#flights' },
    { label: 'Hotel', url: '/#hotels' },
    { label: 'Holidays', url: '/#holidays' },
    { label: 'Visa', url: '/#visa' },
    { label: 'Promotions', url: '/promotions' },
  ],
  usefulLinks: [
    { label: 'About Us', url: '/about-us' },
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy-policy' },
  ],
  addressLine1: 'House- 31 Rd No 17, Dhaka 1213',
  addressLine2: 'Banani, Dhaka-1213.',
  phone: '09613-131415',
  email: 'info@stechholidays.com',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=House+31+Rd+No+17+Banani+Dhaka+1213',
  authorizedByLabel: 'Verified by',
  authorizedByValue: 'BAS15',
  copyrightText: '© 2025 Stech Holidays. All Rights Reserved',
};

const SOCIAL_ICON_PATHS = {
  facebook: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  twitter: 'M8.29 16.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
  instagram: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.630c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z',
  youtube: 'M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.920-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

const SOCIAL_ICON_COLORS = {
  facebook: '#3b5998',
  twitter: '#1DA1F2',
  instagram: '#E1306C',
  youtube: '#FF0000',
  linkedin: '#0077B5',
};

const Footer = () => {
  const {
    data,
    tempData,
    setTempData,
    isAdmin,
    editMode,
    startEdit,
    cancelEdit,
    save,
    saving,
    uploadImage,
  } = useEditableComponent('footer', FALLBACK_DATA);

  const logoInputRef = useRef(null);

  const view = editMode ? tempData : data;

  const updateField = (field, value) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (field, index, itemField, value) => {
    setTempData((prev) => {
      const list = [...prev[field]];
      list[index] = { ...list[index], [itemField]: value };
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field, newItem) => {
    setTempData((prev) => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const removeListItem = (field, index) => {
    setTempData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file, 'footer-logo');
    if (url) updateField('logo', url);
  };

  return (
    <footer className="w-full text-center bg-gradient-to-br from-[#5A53A7] via-[#55C3A9] to-[#54ACA4] text-white border-t border-gray-200 relative">
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg disabled:opacity-60"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-700 hover:bg-gray-800 text-white p-2 rounded-full shadow-lg"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="bg-white text-[#5A53A7] p-2 rounded-full shadow-lg hover:bg-gray-100"
              title="Edit footer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-16 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
          {/* Logo and tagline with social icons - CENTERED */}
          <div className="w-full md:w-1/4 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center justify-center mb-4 relative">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl border border-white border-opacity-30 shadow-lg relative">
                <Image
                  src={view.logo}
                  alt="stech holidays logo"
                  width={58}
                  height={8}
                  className="object-contain"
                />
                {editMode && (
                  <>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-[#5A53A7] text-white rounded-full p-1.5 shadow"
                      title="Change logo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="file"
                      ref={logoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </>
                )}
              </div>
            </div>

            {editMode ? (
              <textarea
                value={view.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className="text-sm text-[#2b2860] mb-6 max-w-xs w-full bg-white/90 rounded p-2"
                rows={2}
              />
            ) : (
              <p className="text-sm text-white text-opacity-80 mb-6 max-w-xs">{view.tagline}</p>
            )}

            <div className="flex flex-col gap-2 items-center md:items-start w-full">
              <div className="flex space-x-3 justify-center md:justify-start flex-wrap gap-y-2">
                {view.socialLinks.map((social, index) => (
                  <div key={index} className="relative">
                    {editMode ? (
                      <div className="flex items-center gap-1 bg-white/90 rounded-full pl-1 pr-2 py-1">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: SOCIAL_ICON_COLORS[social.platform] || '#5A53A7' }}
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d={SOCIAL_ICON_PATHS[social.platform] || SOCIAL_ICON_PATHS.facebook} />
                          </svg>
                        </span>
                        <select
                          value={social.platform}
                          onChange={(e) => updateListItem('socialLinks', index, 'platform', e.target.value)}
                          className="text-xs text-[#2b2860] bg-transparent"
                        >
                          {Object.keys(SOCIAL_ICON_PATHS).map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={social.url}
                          onChange={(e) => updateListItem('socialLinks', index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="text-xs text-[#2b2860] bg-transparent border-l border-gray-300 pl-1 w-24"
                        />
                        <button
                          onClick={() => removeListItem('socialLinks', index)}
                          className="text-red-500"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-opacity-90 transition"
                        style={{ color: SOCIAL_ICON_COLORS[social.platform] || '#5A53A7' }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d={SOCIAL_ICON_PATHS[social.platform] || SOCIAL_ICON_PATHS.facebook} />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <button
                  onClick={() => addListItem('socialLinks', { platform: 'facebook', url: '#' })}
                  className="flex items-center gap-1 text-xs text-white/90 border border-white/40 rounded-full px-3 py-1 hover:bg-white/10"
                >
                  <Plus className="w-3 h-3" /> Add social link
                </button>
              )}
            </div>
          </div>

          {/* Explore section */}
          <div className="w-full md:w-1/4 mt-6 md:mt-0 text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Explore</h3>
            <ul className="space-y-2">
              {view.exploreLinks.map((link, index) => (
                <li key={index} className="flex items-center justify-center md:justify-start gap-2">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateListItem('exploreLinks', index, 'label', e.target.value)}
                        className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-24"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateListItem('exploreLinks', index, 'url', e.target.value)}
                        className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-28"
                      />
                      <button onClick={() => removeListItem('exploreLinks', index)} className="text-red-200" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <Link href={link.url} className="hover:text-[#54ACA4] transition text-white text-opacity-80 hover:text-opacity-100">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {editMode && (
                <li>
                  <button
                    onClick={() => addListItem('exploreLinks', { label: 'New Link', url: '#' })}
                    className="flex items-center gap-1 text-xs text-white/90 border border-white/40 rounded-full px-3 py-1 hover:bg-white/10 mx-auto md:mx-0"
                  >
                    <Plus className="w-3 h-3" /> Add link
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Useful Links section */}
          <div className="w-full md:w-1/4 mt-6 md:mt-0 text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Useful Links</h3>
            <ul className="space-y-2">
              {view.usefulLinks.map((link, index) => (
                <li key={index} className="flex items-center justify-center md:justify-start gap-2">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateListItem('usefulLinks', index, 'label', e.target.value)}
                        className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-24"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateListItem('usefulLinks', index, 'url', e.target.value)}
                        className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-28"
                      />
                      <button onClick={() => removeListItem('usefulLinks', index)} className="text-red-200" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <Link href={link.url} className="hover:text-[#54ACA4] transition text-white text-opacity-80 hover:text-opacity-100">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {editMode && (
                <li>
                  <button
                    onClick={() => addListItem('usefulLinks', { label: 'New Link', url: '#' })}
                    className="flex items-center gap-1 text-xs text-white/90 border border-white/40 rounded-full px-3 py-1 hover:bg-white/10 mx-auto md:mx-0"
                  >
                    <Plus className="w-3 h-3" /> Add link
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Us section */}
          <div className="w-full md:w-1/4 mt-6 md:mt-0 text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <address className="not-italic text-white text-opacity-80">
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={view.addressLine1}
                    onChange={(e) => updateField('addressLine1', e.target.value)}
                    className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 mb-2 w-full"
                  />
                  <input
                    type="text"
                    value={view.addressLine2}
                    onChange={(e) => updateField('addressLine2', e.target.value)}
                    className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 mb-4 w-full"
                  />
                </>
              ) : (
                <>
                  <p className="mb-2">{view.addressLine1}</p>
                  <p className="mb-4">{view.addressLine2}</p>
                </>
              )}

              <div className="flex items-center justify-center md:justify-start mb-2">
                <svg className="w-4 h-4 mr-2 text-[#54ACA4] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {editMode ? (
                  <input
                    type="text"
                    value={view.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                  />
                ) : (
                  <span>{view.phone}</span>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start mb-2">
                <svg className="w-4 h-4 mr-2 text-[#54ACA4] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {editMode ? (
                  <input
                    type="text"
                    value={view.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                  />
                ) : (
                  <span>{view.email}</span>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-2 text-[#54ACA4] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {editMode ? (
                  <input
                    type="text"
                    value={view.mapUrl}
                    onChange={(e) => updateField('mapUrl', e.target.value)}
                    className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                  />
                ) : (
                  <a href={view.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#54ACA4] transition">
                    View Map
                  </a>
                )}
              </div>
            </address>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-20 my-8"></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Authorized by section */}
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 w-full md:w-auto">
            <div className="text-center md:text-left">
              <h4 className="text-sm font-medium mb-2 text-white">Authorized by</h4>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-white text-opacity-80">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={view.authorizedByLabel}
                      onChange={(e) => updateField('authorizedByLabel', e.target.value)}
                      className="text-xs bg-white/90 text-[#2b2860] rounded px-2 py-1 w-24"
                    />
                    <input
                      type="text"
                      value={view.authorizedByValue}
                      onChange={(e) => updateField('authorizedByValue', e.target.value)}
                      className="text-xs bg-white/90 text-[#2b2860] rounded px-2 py-1 w-24 font-bold"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-xs">{view.authorizedByLabel}</span>
                    <span className="font-bold">{view.authorizedByValue}</span>
                  </>
                )}
              </div>
            </div>

            {/* Payment methods (static — not part of admin-edited data) */}
            <div className="w-full md:w-auto">
              <h4 className="text-sm font-medium mb-3 text-white text-center md:text-left">Payment Method</h4>
              <div className="flex justify-center md:justify-start flex-wrap gap-2">
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center p-1">
                  <span className="text-[#1A1F71] text-xs font-bold">VISA</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center p-1">
                  <span className="text-[#EB001B] text-xs font-bold">MC</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center p-1">
                  <span className="text-[#016FD0] text-xs font-bold">AMEX</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center p-1">
                  <span className="text-[#FFC439] text-xs font-bold">PP</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center p-1">
                  <span className="text-[#E2136E] text-xs font-bold">BKASH</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center p-1">
                  <span className="text-[#27AAE1] text-xs font-bold">NAGAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright at very bottom with full width background */}
      <div className="bg-[#5A53A7] w-full py-4 border-t border-white border-opacity-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-16 text-center text-sm text-white text-opacity-80">
          {editMode ? (
            <input
              type="text"
              value={view.copyrightText}
              onChange={(e) => updateField('copyrightText', e.target.value)}
              className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full max-w-md mx-auto text-center"
            />
          ) : (
            view.copyrightText
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
