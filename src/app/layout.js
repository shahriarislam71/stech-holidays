import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: 'TravelEase - Your Perfect Getaway',
  description: 'Discover amazing destinations with TravelEase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        
        {children}
        
      </body>
    </html>
  );
}