import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';
import useSocket from './hooks/useSocket';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleTrackingPage from './pages/VehicleTrackingPage';
import RouteMonitoringPage from './pages/RouteMonitoringPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import VehicleManagementPage from './pages/VehicleManagementPage';
import DriverManagementPage from './pages/DriverManagementPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

const pageTitles = {
  '/': 'Dashboard',
  '/tracking': 'Live Vehicle Tracking',
  '/routes': 'Route Monitoring',
  '/analytics': 'Waste Collection Analytics',
  '/vehicles': 'Vehicle Management',
  '/drivers': 'Driver Management',
  '/reports': 'Reports & Export',
  '/settings': 'Settings',
};

function ProtectedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = window.location.pathname;
  const title = pageTitles[pathname] || 'KMC SwachthTrack';
  useSocket();

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="app-main">
        <Header title={title} onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tracking" element={<VehicleTrackingPage />} />
          <Route path="/routes" element={<RouteMonitoringPage />} />
          <Route path="/analytics" element={<AnalyticsDashboardPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
          <Route path="/vehicles" element={<VehicleManagementPage />} />
          <Route path="/drivers" element={<DriverManagementPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
