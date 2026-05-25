import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, LayoutDashboard, LogOut, Award, User } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 text-white flex flex-col transition-all duration-300 shadow-xl">
        <div className="p-6 border-b border-dark-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center font-bold shrink-0">
            EDC
          </div>
          <span className="text-base font-bold tracking-wide leading-tight">Entrepreneurship Development Cell</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
            <LayoutDashboard size={20} className="group-hover:text-primary-400" />
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/events" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
            <Calendar size={20} className="group-hover:text-primary-400" />
            <span>Browse Events</span>
          </Link>
          {user?.role === 'STUDENT' && (
            <Link to="/dashboard/certificates" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
              <Award size={20} className="group-hover:text-primary-400" />
              <span>Certificates</span>
            </Link>
          )}
          {(user?.role === 'COMMITTEE_HEAD' || user?.role === 'SUPER_ADMIN') && (
            <Link to="/dashboard/manage" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white">
              <Users size={20} className="group-hover:text-primary-400" />
              <span>Manage Events</span>
            </Link>
          )}
          <Link to="/dashboard/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors group text-gray-300 hover:text-white mt-4 border-t border-dark-800 pt-4">
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-gray-800">Welcome, {user?.name || 'User'}</h1>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-primary-100 text-primary-700 font-bold flex items-center justify-center shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
