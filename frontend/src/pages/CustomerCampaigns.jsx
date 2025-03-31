import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [referralLink, setReferralLink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/customers/campaigns', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setCampaigns(response.data.campaigns);
                setReferralLink(response.data.referralLink);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching campaigns');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Your Campaigns</h1>
            {referralLink && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
                    <h2 className="font-semibold">Your Referral Link</h2>
                    <p>{`http://yourwebsite.com/r/${referralLink}`}</p>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-200" key={campaign._id}>
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        <p className="text-gray-700">{campaign.taskDescription}</p>
                        <p className="text-gray-600">Reward: {campaign.rewardValue} {campaign.rewardType}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerCampaigns;