import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { EnvironmentalOverview } from './features/environmental/pages/EnvironmentalOverview';
import { EmissionFactorList } from './features/environmental/pages/EmissionFactorList';
import { ProductESGProfiles } from './features/environmental/pages/ProductESGProfiles';
import { CarbonTransactions } from './features/environmental/pages/CarbonTransactions';
import { EnvironmentalGoals } from './features/environmental/pages/EnvironmentalGoals';
import { EnvironmentalLayout } from './features/environmental/layouts/EnvironmentalLayout';

import { SocialLayout } from './features/social/layouts/SocialLayout';
import { CSRActivities } from './features/social/pages/CSRActivities';
import { EmployeeParticipationDashboard } from './features/social/pages/EmployeeParticipation';
import { DiversityDashboard } from './features/social/pages/DiversityDashboard';

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
          
          {/* Environmental Routes */}
          <Route path="environmental" element={<EnvironmentalLayout />}>
            <Route index element={<Navigate to="emissions" replace />} />
            <Route path="emissions" element={<EmissionFactorList />} />
            <Route path="products" element={<ProductESGProfiles />} />
            <Route path="transactions" element={<CarbonTransactions />} />
            <Route path="goals" element={<EnvironmentalGoals />} />
          </Route>

          {/* Social Routes */}
          <Route path="social" element={<SocialLayout />}>
            <Route index element={<Navigate to="csr" replace />} />
            <Route path="csr" element={<CSRActivities />} />
            <Route path="participation" element={<EmployeeParticipationDashboard />} />
            <Route path="diversity" element={<DiversityDashboard />} />
          </Route>

          {/* Governance Routes */}
          <Route path="governance" element={<PlaceholderContent title="Governance Overview" />} />
          <Route path="governance/policies" element={<PlaceholderContent title="Policies" />} />
          <Route path="governance/acknowledgements" element={<PlaceholderContent title="Policy Acknowledgements" />} />
          <Route path="governance/audits" element={<PlaceholderContent title="Audits" />} />
          <Route path="governance/compliance" element={<PlaceholderContent title="Compliance Issues" />} />

          {/* Gamification Routes */}
          <Route path="gamification" element={<PlaceholderContent title="Gamification Overview" />} />
          <Route path="gamification/challenges" element={<PlaceholderContent title="Challenges" />} />
          <Route path="gamification/participation" element={<PlaceholderContent title="Challenge Participation" />} />
          <Route path="gamification/badges" element={<PlaceholderContent title="Badges" />} />
          <Route path="gamification/rewards" element={<PlaceholderContent title="Rewards" />} />
          <Route path="gamification/leaderboard" element={<PlaceholderContent title="Leaderboard" />} />

          {/* Reports Routes */}
          <Route path="reports" element={<PlaceholderContent title="Reports Overview" />} />
          <Route path="reports/environmental" element={<PlaceholderContent title="Environmental Report" />} />
          <Route path="reports/social" element={<PlaceholderContent title="Social Report" />} />
          <Route path="reports/governance" element={<PlaceholderContent title="Governance Report" />} />
          <Route path="reports/summary" element={<PlaceholderContent title="ESG Summary" />} />
          <Route path="reports/builder" element={<PlaceholderContent title="Custom Report Builder" />} />

          {/* Settings Routes */}
          <Route path="settings" element={<PlaceholderContent title="Settings Overview" />} />
          <Route path="settings/departments" element={<PlaceholderContent title="Departments" />} />
          <Route path="settings/categories" element={<PlaceholderContent title="Categories" />} />
          <Route path="settings/esg" element={<PlaceholderContent title="ESG Configuration" />} />
          <Route path="settings/notifications" element={<PlaceholderContent title="Notification Settings" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
