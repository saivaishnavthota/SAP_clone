/**
 * Main App Component with Routing
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TopNavLayout from './components/TopNavLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import PM from './pages/PM';
import MM from './pages/MM';
import FI from './pages/FI';
import AllTickets from './pages/AllTickets';
import UserManagement from './pages/UserManagement';
import PMWorkflowHome from './pages/PMWorkflowHome';
import PMWorkflowScreen1 from './pages/PMWorkflowScreen1';
import PMWorkflowScreen2 from './pages/PMWorkflowScreen2';
import PMWorkflowScreen3 from './pages/PMWorkflowScreen3';
import PMWorkflowScreen4 from './pages/PMWorkflowScreen4';
import PMWorkflowScreen5 from './pages/PMWorkflowScreen5';
import PMWorkflowScreen6 from './pages/PMWorkflowScreen6';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* All pages with top navigation */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TopNavLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="home" element={<Home />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="pm" element={<PM />} />
        <Route path="mm" element={<MM />} />
        <Route path="fi" element={<FI />} />
        <Route path="all-tickets" element={<AllTickets />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="pm-workflow" element={<PMWorkflowHome />} />
        <Route path="pm-workflow/screen1" element={<PMWorkflowScreen1 />} />
        <Route path="pm-workflow/screen2/:orderNumber" element={<PMWorkflowScreen2 />} />
        <Route path="pm-workflow/screen3" element={<PMWorkflowScreen3 />} />
        <Route path="pm-workflow/screen4" element={<PMWorkflowScreen4 />} />
        <Route path="pm-workflow/screen5/:orderNumber" element={<PMWorkflowScreen5 />} />
        <Route path="pm-workflow/screen6/:orderNumber" element={<PMWorkflowScreen6 />} />
        <Route path="analytics" element={<div style={{padding: '20px'}}>Analytics Page</div>} />
        <Route path="billing" element={<div style={{padding: '20px'}}>Billing Page</div>} />
        <Route path="bpm" element={<div style={{padding: '20px'}}>Business Process Management</div>} />
        <Route path="credit" element={<div style={{padding: '20px'}}>Credit Management</div>} />
        <Route path="returns" element={<div style={{padding: '20px'}}>Customer Returns</div>} />
        <Route path="employee" element={<div style={{padding: '20px'}}>Employee Situation Handling</div>} />
        <Route path="sales" element={<div style={{padding: '20px'}}>Internal Sales</div>} />
        <Route path="sales-pro" element={<div style={{padding: '20px'}}>Internal Sales - Professional Services</div>} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
