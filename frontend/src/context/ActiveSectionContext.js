// context/ActiveSectionContext.js
"use client"
import { createContext, useState, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ActiveSectionContext = createContext();

export function ActiveSectionProvider({ children }) {
  const [activeSection, setActiveSection] = useState('flights');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (['flights', 'hotels', 'holidays', 'visa'].includes(hash)) {
        setActiveSection(hash);
      }
    };

    // Handle initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pathname]);

  return (
    <ActiveSectionContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection() {
  return useContext(ActiveSectionContext);
}