import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function BusinessProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    businessName: '',
    industry: '',
    website: ''
  });
  const [zapier, setZapier] = useState({
    webhookUrl: '',
    apiKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/business/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setProfile({
          businessName: response.data.businessName || '',
          industry: response.data.industry || '',
          website: response.data.website || ''
        });
        if (response.data.zapierIntegration) {
          setZapier({
            webhookUrl: response.data.zapierIntegration.webhookUrl || '',
            apiKey: response.data.zapierIntegration.apiKey || ''
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/business/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleZapierSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/business/zapier/connect`, zapier, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Zapier integration successful!');
    } catch (error) {
      setMessage('Error connecting Zapier');
      console.error('Error connecting Zapier:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Business Profile</h1>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Industry
            </label>
            <input
              type="text"
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Website
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Profile
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">CRM Integration (Zapier)</h2>
        <form onSubmit={handleZapierSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Zapier Webhook URL
            </label>
            <input
              type="url"
              value={zapier.webhookUrl}
              onChange={(e) => setZapier({ ...zapier, webhookUrl: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              API Key
            </label>
            <input
              type="text"
              value={zapier.apiKey}
              onChange={(e) => setZapier({ ...zapier, apiKey: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Connect CRM
          </button>
        </form>
      </div>
    </div>
  );
}

export default BusinessProfile; 