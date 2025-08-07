
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function useAuth({ redirectToLogin = true, adminOnly = false } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Fetch user profile

const fetchUser = async () => {
  setIsLoading(true);
  setErrorMsg('');
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return null;  // Return null instead of throwing error
    }

    const response = await fetch('http://localhost:8000/api/auth/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const userData = await response.json();
    setUser(userData);
    return userData;
  } catch (error) {
    console.error('fetchUser error:', error.message);
    setUser(null);
    setErrorMsg(error.message);
    return null;
  } finally {
    setIsLoading(false);
  }
};


// In useAuth.js
useEffect(() => {
  const checkAuth = async () => {
    if (redirectToLogin) {
      const userData = await fetchUser();
      if (userData) {
        router.push('/profile');
      } else if (redirectToLogin) {
        router.push('/login');
      }
    } else {
      // Always try to fetch user, but don't redirect
      await fetchUser();
      setIsLoading(false);
    }
  };

  checkAuth();
}, [redirectToLogin, router]);



  // Initialize Google Sign-In
  const initGoogleLogin = () => {
    if (!window.google && !document.getElementById('google-identity')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-identity';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderGoogleLogin();
      };
      document.body.appendChild(script);
    } else if (window.google) {
      renderGoogleLogin();
    }
  };

const renderGoogleLogin = () => {
  if (googleLoaded || !window.google) return;

  const btnDiv = document.getElementById('google-btn');
  if (!btnDiv) {
    console.warn('Google button container not found');
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: '1046154388534-g632sm5bqumahr72i0184j4sg00c2o3e.apps.googleusercontent.com',
      callback: handleGoogleResponse,
      auto_select: false,
      ux_mode: 'popup',
    });

    window.google.accounts.id.renderButton(btnDiv, {
      theme: 'filled_blue',
      size: 'large',
      width: 320,
      text: 'continue_with',
      shape: 'pill',
    });

    setGoogleLoaded(true);
  } catch (error) {
    console.error('Error rendering Google button:', error);
    toast.error('Failed to load Google Sign-In');
  }
};

  // Handle Google login response
const handleGoogleResponse = async (response) => {
  try {
    setIsLoading(true);
    setErrorMsg('');

    const res = await fetch('http://localhost:8000/api/auth/social/google/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: response.credential }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('authToken', data.token);
      await fetchUser();
      
      // Check for pending booking
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        localStorage.removeItem('pendingBooking');
        const bookingData = JSON.parse(pendingBooking);
        // Redirect to booking confirmation or auto-submit
        router.push(`/holidays/${bookingData.destination}/${bookingData.packageId}/book`);
      } else {
        router.push('/profile');
      }
    } else {
      const err = await res.json();
      setErrorMsg(err.detail || 'Google login failed');
      toast.error(err.detail || 'Login failed');
    }
  } catch (err) {
    setErrorMsg('Network error: ' + err.message);
    toast.error('Network error');
  } finally {
    setIsLoading(false);
  }
};

  // Logout function
const logout = () => {
  localStorage.removeItem('authToken');
  setUser(null);
  window.location.href = '/login';
};


  // Update user profile
const updateProfile = async (data) => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No token found');

    const response = await fetch('http://localhost:8000/api/auth/profile/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,  
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return true;
    } else {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }
  } catch (error) {
    toast.error(error.message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};


  
  // Check auth status on mount



  return {
    user,
    setUser,
    isLoading,
    errorMsg,
    logout,
    initGoogleLogin,
    updateProfile,
    fetchUser, // Add fetchUser to allow manual refresh
  };
}