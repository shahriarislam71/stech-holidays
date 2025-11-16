'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function useAuth({ redirectToLogin = true, adminOnly = false } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchUser = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return null;
      }

      const response = await fetch(`${apiUrl}/auth/profile/`, {
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

  // Handle redirect after successful login
  const handleSuccessfulLogin = async () => {
    const userData = await fetchUser();
    
    if (userData) {
      // Check for redirect parameter first
      const redirectUrl = searchParams.get('redirect');
      
      if (redirectUrl) {
        // Decode and redirect to the original page
        router.push(decodeURIComponent(redirectUrl));
        return;
      }

      // Check for pending custom holiday request
      const pendingCustomRequest = localStorage.getItem('pendingCustomRequest');
      const loginRedirect = localStorage.getItem('loginRedirect');
      
      if (pendingCustomRequest && loginRedirect === '/holidays/custom-package') {
        // Redirect back to custom package page to restore form data
        router.push('/holidays/custom-package');
        return;
      }

      // Check for pending custom umrah request
      const pendingUmrahRequest = localStorage.getItem('pendingUmrahRequest');
      const umrahLoginRedirect = localStorage.getItem('loginRedirect');
      
      if (pendingUmrahRequest && umrahLoginRedirect === '/umrah/custom-package') {
        // Redirect back to custom umrah package page to restore form data
        router.push('/umrah/custom-package');
        return;
      }

      // Check for pending booking
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        localStorage.removeItem('pendingBooking');
        const bookingData = JSON.parse(pendingBooking);
        router.push(`/holidays/${bookingData.destination}/${bookingData.packageId}/book`);
        return;
      }

      // Default redirect to profile
      router.push('/profile');
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (redirectToLogin) {
        const userData = await fetchUser();
        if (!userData && redirectToLogin) {
          // Get current path for redirect
          const currentPath = window.location.pathname + window.location.search;
          // Only redirect to login if we're not already on login page
          if (!currentPath.includes('/login')) {
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
          }
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

      const res = await fetch(`${apiUrl}/auth/social/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('authToken', data.token);
        await handleSuccessfulLogin();
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
    localStorage.removeItem('pendingCustomRequest');
    localStorage.removeItem('pendingUmrahRequest');
    localStorage.removeItem('loginRedirect');
    setUser(null);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  // Update user profile
  // In your useAuth hook - update this function
const updateProfile = async (data) => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${apiUrl}/auth/profile/`, {
      method: 'PATCH', // CHANGE FROM PUT TO PATCH
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

  return {
    user,
    setUser,
    isLoading,
    errorMsg,
    logout,
    initGoogleLogin,
    updateProfile,
    fetchUser,
    handleSuccessfulLogin,
  };
}