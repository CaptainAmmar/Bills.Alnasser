import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ships from './pages/Ships';
import Bills from './pages/Bills';
import Customs from './pages/Customs';
import FreeZone from './pages/FreeZone';
import Operations from './pages/Operations';
import Headings from './pages/Headings';
import Reports from './pages/Reports';
import Cars from './pages/Cars';
import Users from './pages/Users';
import DeletedLogs from './pages/DeletedLogs';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Instructions from './pages/Instructions';
import ErrorBoundary from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/ships" element={<PrivateRoute><Ships /></PrivateRoute>} />
            <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
            <Route path="/customs" element={<PrivateRoute><Customs /></PrivateRoute>} />
            <Route path="/free-zone" element={<PrivateRoute><FreeZone /></PrivateRoute>} />
            <Route path="/operations" element={<PrivateRoute><Operations /></PrivateRoute>} />
            <Route path="/headings" element={<PrivateRoute><Headings /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/cars" element={<PrivateRoute><Cars /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/deleted-logs" element={<PrivateRoute><DeletedLogs /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/instructions" element={<PrivateRoute><Instructions /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
