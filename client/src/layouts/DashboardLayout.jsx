import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, LayoutDashboard, LogOut, Award, User, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-dark-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out shadow-xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-dark-800 flex items-center justify-between md:justify-start space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center font-bold shrink-0">
              EDC
            </div>
            <span className="text-base font-bold tracking-wide leading-tight">Entrepreneurship Development Cell</span>
          </div>
          <button onClick={closeMenu} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
            <LayoutDashboard size={20} className="group-hover:text-primary-400" />
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/events" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
            <Calendar size={20} className="group-hover:text-primary-400" />
            <span>Browse Events</span>
          </Link>
          {user?.role === 'STUDENT' && (
            <Link to="/dashboard/certificates" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
              <Award size={20} className="group-hover:text-primary-400" />
              <span>Certificates</span>
            </Link>
          )}
          {(user?.role === 'COMMITTEE_HEAD' || user?.role === 'SUPER_ADMIN') && (
            <Link to="/dashboard/manage" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
              <Users size={20} className="group-hover:text-primary-400" />
              <span>Manage Events</span>
            </Link>
          )}
          <Link to="/dashboard/profile" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white mt-4 border-t border-dark-800 pt-4">
            <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <User size={14} />
            </div>
            <span>My Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-dark-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 shadow-sm shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="mr-4 md:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">Welcome, {user?.name || 'User'}</h1>
            <div className="flex items-center space-x-4 shrink-0 ml-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-primary-100 text-primary-700 font-bold flex items-center justify-center shadow-inner text-sm md:text-base">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
