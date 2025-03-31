import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import BusinessProfile from './pages/BusinessProfile';
import CustomerList from './pages/CustomerList';
import CampaignCreate from './pages/CampaignCreate';
import CampaignList from './pages/CampaignList';
import CampaignEdit from './pages/CampaignEdit';
import CampaignReferrals from './pages/CampaignReferrals';
import ReferralLanding from './pages/ReferralLanding';
import ReferredSignup from './pages/ReferredSignup';
import CustomerCampaigns from './pages/CustomerCampaigns';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Integrations from './pages/Integrations';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <BusinessProfile />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <CustomerList />
                </ProtectedRoute>
              } />
              <Route path="/campaigns/create" element={
                <ProtectedRoute>
                  <CampaignCreate />
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <CampaignList />
                </ProtectedRoute>
              } />
              <Route path="/campaigns/edit/:id/" element={
                <ProtectedRoute>
                  <CampaignEdit />
                </ProtectedRoute>
              } />
              <Route path="/campaigns/:id/referrals" element={
                <ProtectedRoute>
                  <CampaignReferrals />
                </ProtectedRoute>
              } />
              <Route path="/customer/campaigns" element={
                  <CustomerCampaigns />
              } />
              <Route path="/r/:code" element={<ReferralLanding />} />
              <Route path="/signup/:code" element={<ReferredSignup />} />
              <Route path="/integrations" element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
