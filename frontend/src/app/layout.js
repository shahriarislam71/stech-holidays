import Navbar from '@/components/Navbar';
import './globals.css';
import { Suspense } from "react";

export const metadata = {
  title: 'STECH Holidays - Your Perfect Travel Companion',
  description: 'Discover amazing destinations with STECH Holidays',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

      <script src="https://accounts.google.com/gsi/client" async defer></script>


        {/* Optional: Add more formats if needed */}
        <link rel="icon" type="image/webp" sizes="32x32" href="/holidays.webp" />
      </head>
      <body className="min-h-screen bg-gray-50">

    <Suspense fallback={null}>
          {children}
        </Suspense>
        
              </body>
    </html>
  );
}
