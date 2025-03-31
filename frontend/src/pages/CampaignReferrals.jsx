import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CampaignReferrals = () => {
    const [campaign, setCampaign] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { campaignId } = useParams();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const campaignRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${campaignId}`, { headers });
            setCampaign(campaignRes.data);

            const customersRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/business/customers`, { headers });
            setCustomers(customersRes.data);

            const statsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/referrals/stats/${campaignId}`, { headers });
            setStats(statsRes.data);

            setLoading(false);
        } catch (error) {
            setError('Error fetching data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    const generateReferralCode = async () => {
        if (!selectedCustomer) {
            setError('Please select a customer');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/referrals/generate`, 
                {
                    campaignId,
                    customerId: selectedCustomer
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            fetchData();
            setSelectedCustomer('');
        } catch (error) {
            setError('Error generating referral code');
        }
    };

    const completeTask = async (referralCode, conversionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/referrals/complete-task/${referralCode}`,
                {
                    conversionId,
                    completed: true
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchData();
        } catch (error) {
            setError('Error marking task as complete');
        }
    };

    const claimReward = async (referralCode, conversionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/referrals/claim-reward/${referralCode}`,
                { conversionId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchData();
        } catch (error) {
            setError('Error claiming reward');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!campaign) return <div>Campaign not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{campaign.name} - Referrals</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Campaign Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="text-gray-600">Total Referrals</p>
                        <p className="text-2xl font-bold">{stats.totalReferrals || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="text-gray-600">Successful Conversions</p>
                        <p className="text-2xl font-bold">{stats.successfulConversions || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="text-gray-600">Rewards Claimed</p>
                        <p className="text-2xl font-bold">{stats.rewardsClaimed || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Generate New Referral Code</h2>
                <div className="flex gap-4">
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="flex-1 p-2 border rounded"
                    >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                            <option key={customer._id} value={customer._id}>
                                {customer.name} ({customer.email})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={generateReferralCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Generate Code
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl font-semibold p-6 bg-gray-50">Referral List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Referrer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaign.referrals?.map((referral) => (
                                <tr key={referral._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {customers.find(c => c._id === referral.referrerId)?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{referral.referralCode}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            referral.status === 'active' ? 'bg-green-100 text-green-800' :
                                            referral.status === 'converted' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {referral.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {referral.conversions?.map((conversion) => (
                                            <div key={conversion._id} className="flex space-x-2">
                                                {!conversion.taskCompleted && (
                                                    <button
                                                        onClick={() => completeTask(referral.referralCode, conversion._id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Complete Task
                                                    </button>
                                                )}
                                                {conversion.taskCompleted && !conversion.rewardClaimed && (
                                                    <button
                                                        onClick={() => claimReward(referral.referralCode, conversion._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Claim Reward
                                                    </button>
                                                )}
                                                {conversion.rewardClaimed && (
                                                    <span className="text-gray-500">Completed</span>
                                                )}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CampaignReferrals; 