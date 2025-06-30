import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ActiveSectionProvider } from '@/context/ActiveSectionContext';

export default function MainLayout({ children }) {
  return (
    <>
    <ActiveSectionProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </ActiveSectionProvider>
      
    </>
  );
}