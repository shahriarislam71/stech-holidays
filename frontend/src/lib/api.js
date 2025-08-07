const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchPopularDestinations = async () => {
  const response = await fetch(`${API_BASE_URL}/locations/popular-destinations/`);
  if (!response.ok) throw new Error('Failed to fetch destinations');
  return response.json();
};

export const fetchHolidayPackages = async (destination, filters = {}) => {
  const params = new URLSearchParams({ destination, ...filters });
  const response = await fetch(`${API_BASE_URL}/holiday-packages/?${params}`);
  if (!response.ok) throw new Error('Failed to fetch packages');
  return response.json();
};

export const fetchPackageDetails = async (id) => {
  const response = await fetch(`${API_BASE_URL}/holiday-packages/${id}/`);
  if (!response.ok) throw new Error('Package not found');
  return response.json();
};

export const createHolidayBooking = async (bookingData, token) => {
  const response = await fetch(`${API_BASE_URL}/holiday-bookings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });
  if (!response.ok) throw new Error('Booking failed');
  return response.json();
};

export const fetchVisaCountry = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/visa-countries/${slug}/`);
  if (!response.ok) throw new Error('Country not found');
  return response.json();
};

export const createVisaApplication = async (applicationData, token) => {
  const response = await fetch(`${API_BASE_URL}/visa-applications/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(applicationData)
  });
  if (!response.ok) throw new Error('Application failed');
  return response.json();
};