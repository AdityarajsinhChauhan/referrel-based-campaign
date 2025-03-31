import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CampaignList() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCampaigns(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete the campaign "${name}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteSuccess('Campaign deleted successfully');
            setCampaigns(campaigns.filter(campaign => campaign._id !== id));
            setTimeout(() => setDeleteSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting campaign');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Campaigns</h1>
                <Link
                    to="/campaigns/create"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create New Campaign
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {deleteSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {deleteSuccess}
                </div>
            )}

            {campaigns.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium text-gray-600">No campaigns yet</h3>
                    <p className="text-gray-500 mt-2">Create your first campaign to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                        <div
                            key={campaign._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Task:</span> {campaign.taskType}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Reward:</span>{' '}
                                        {campaign.rewardType} - {campaign.rewardValue}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={`capitalize ${
                                            campaign.status === 'active' ? 'text-green-600' : 
                                            campaign.status === 'draft' ? 'text-yellow-600' :
                                            campaign.status === 'completed' ? 'text-blue-600' :
                                            'text-red-600'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Duration:</span>{' '}
                                        {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                                        {new Date(campaign.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Total Referrals:</span>{' '}
                                        {campaign.totalReferrals || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Rewards Given:</span>{' '}
                                        {campaign.totalRewardsGiven || 0}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                    <Link
                                        to={`/campaigns/${campaign._id}/referrals`}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex-grow text-center"
                                    >
                                        Manage Referrals
                                    </Link>
                                    <Link
                                        to={`/campaigns/edit/${campaign._id}`}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(campaign._id, campaign.name)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CampaignList; 