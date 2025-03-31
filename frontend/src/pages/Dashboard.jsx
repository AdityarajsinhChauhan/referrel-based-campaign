// Main dashboard component displaying campaign statistics and recent activity
// Shows key metrics, active campaigns, and customer engagement data
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    // State for managing dashboard data and loading states
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalCustomers: 0,
        totalReferrals: 0
    });
    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch dashboard data including stats and recent campaigns
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, campaignsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`, { headers }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/recent`, { headers })
                ]);

                setStats(statsRes.data);
                setRecentCampaigns(campaignsRes.data);
                setLoading(false);
            } catch (error) {
                setError('Error fetching dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Link
                    to="/campaigns/new"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create Campaign
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Campaigns</h3>
                    <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Active Campaigns</h3>
                    <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
                    <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Referrals</h3>
                    <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Recent Campaigns</h2>
                </div>
                <div className="divide-y">
                    {recentCampaigns.map(campaign => (
                        <div key={campaign._id} className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        <Link to={`/campaigns/${campaign._id}`} className="text-blue-600 hover:text-blue-800">
                                            {campaign.name}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600">{campaign.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <div className="mt-4 flex space-x-4 text-sm">
                                <span className="text-gray-500">
                                    Start: {new Date(campaign.startDate).toLocaleDateString()}
                                </span>
                                <span className="text-gray-500">
                                    End: {new Date(campaign.endDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 