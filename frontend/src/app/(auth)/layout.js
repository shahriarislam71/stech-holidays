//(auth)/layout.js
export const metadata = {
  title: 'Login - TravelEase',
  description: 'Login to your TravelEase account',
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}