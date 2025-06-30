export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#f0fdfa] via-[#f8fafc] to-[#f0f7ff]">
      {/* Left Sidebar - Fixed width */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Sidebar Content */}
        <div className="p-4 h-full flex flex-col">
          {/* Logo Area (Minimal) */}
          <div className="mb-8 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#55C3A9] to-[#5A53A7] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <NavItem href="/admin/dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
              Dashboard
            </NavItem>
            <NavItem href="#" icon="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2">
              Flight
            </NavItem>
            <NavItem href="#" icon="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2">
              Hotel
            </NavItem>
            <NavItem href="#" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
              Holidays
            </NavItem>
            <NavItem href="#" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
              Visa
            </NavItem>
            <NavItem href="/admin/customers" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
              Customers
            </NavItem>
          </nav>

          {/* Bottom Help Section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <NavItem href="#" icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z">
              Help
            </NavItem>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-[190px]">
          <div></div> {/* Empty div for spacing */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#55C3A9] to-[#5A53A7] flex items-center justify-center text-white font-medium">
                AM
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with 190px padding */}
        <main className="flex-1 overflow-y-auto px-[190px] py-6 bg-gradient-to-br from-[#f0fdfa] via-[#f8fafc] to-[#f0f7ff]">
          {children}
        </main>
      </div>
    </div>
  );
}

// NavItem Component
function NavItem({ href, icon, children }) {
  return (
    <a
      href={href}
      className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-[#54ACA4] hover:text-white transition-colors duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d={icon} clipRule="evenodd" />
      </svg>
      {children}
    </a>
  );
}