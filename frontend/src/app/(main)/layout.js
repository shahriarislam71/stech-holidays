"use client";

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { ActiveSectionProvider } from '@/context/ActiveSectionContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MainLayout({ children }) {
  return (
    <>
    <ActiveSectionProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
<ToastContainer
  position="top-center"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>

    </ActiveSectionProvider>
      
    </>
  );
}