import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DashboardLayout } from './layouts/DashboardLayout';

import { EnvironmentalLayout } from './features/environmental/layouts/EnvironmentalLayout';
import { EnvironmentalPage } from './features/environmental/pages/EnvironmentalPage';

import { SocialLayout } from './features/social/layouts/SocialLayout';
import { SocialPage } from './features/social/pages/SocialPage';

import { GovernanceLayout } from './features/governance/layouts/GovernanceLayout';
import { PoliciesPage } from './features/governance/pages/PoliciesPage';
import { GamificationLayout } from './features/gamification/layouts/GamificationLayout';
import { GamificationPage } from './features/gamification/pages/GamificationPage';
import { SettingsLayout } from './features/settings/layouts/SettingsLayout';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { ReportsLayout } from './features/reports/layouts/ReportsLayout';
import { ReportsPage } from './features/reports/pages/ReportsPage';

import './index.css';

// Placeholder for nested routes to show they exist
const PlaceholderContent = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-slate-100">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#0D3B3E] mb-2">{title}</h2>
      <p className="text-slate-500">This module is under construction.</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          
          {/* Environmental Routes — all point to unified EnvironmentalPage */}
          <Route path="environmental" element={<EnvironmentalLayout />}>
            <Route index element={<Navigate to="emissions" replace />} />
            <Route path="emissions"    element={<EnvironmentalPage />} />
            <Route path="products"     element={<EnvironmentalPage />} />
            <Route path="transactions" element={<EnvironmentalPage />} />
            <Route path="goals"        element={<EnvironmentalPage />} />
          </Route>

          {/* Social Routes — all point to unified SocialPage */}
          <Route path="social" element={<SocialLayout />}>
            <Route index element={<Navigate to="csr" replace />} />
            <Route path="csr"           element={<SocialPage />} />
            <Route path="participation" element={<SocialPage />} />
            <Route path="diversity"     element={<SocialPage />} />
          </Route>

          {/* Governance Routes — all point to unified PoliciesPage */}
          <Route path="governance" element={<GovernanceLayout />}>
            <Route index element={<Navigate to="policies" replace />} />
            <Route path="policies"         element={<PoliciesPage />} />
            <Route path="acknowledgements" element={<PoliciesPage />} />
            <Route path="audits"           element={<PoliciesPage />} />
            <Route path="compliance"       element={<PoliciesPage />} />
          </Route>

          {/* Gamification Routes */}
          <Route path="gamification" element={<GamificationLayout />}>
            <Route index element={<Navigate to="challenges" replace />} />
            <Route path="challenges"    element={<GamificationPage />} />
            <Route path="participation" element={<GamificationPage />} />
            <Route path="badges"        element={<GamificationPage />} />
            <Route path="rewards"       element={<GamificationPage />} />
            <Route path="leaderboard"   element={<GamificationPage />} />
          </Route>

          {/* Reports Routes */}
          <Route path="reports" element={<ReportsLayout />}>
            <Route index element={<Navigate to="environmental" replace />} />
            <Route path="environmental" element={<ReportsPage />} />
            <Route path="social"        element={<ReportsPage />} />
            <Route path="governance"    element={<ReportsPage />} />
            <Route path="summary"       element={<ReportsPage />} />
            <Route path="builder"       element={<ReportsPage />} />
          </Route>

          {/* Settings Routes */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="departments" replace />} />
            <Route path="departments"   element={<SettingsPage />} />
            <Route path="categories"    element={<SettingsPage />} />
            <Route path="esg"           element={<SettingsPage />} />
            <Route path="notifications" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
