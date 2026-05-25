import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import DashboardLayout from './layouts/DashboardLayout';
import EventListing from './pages/EventListing';
import Login from './pages/Login';
import Register from './pages/Register';
import ManageEvents from './pages/ManageEvents';
import MyCertificates from './pages/MyCertificates';

import Profile from './pages/Profile';

const Home = () => <Navigate to="/dashboard/events" />;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar can go here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="events" />} />
            <Route path="events" element={<EventListing />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="manage" element={<ManageEvents />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
