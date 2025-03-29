import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function CampaignReferrals() {
    const { id: campaignId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [customers, setCustomers] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [rewardEligibility, setRewardEligibility] = useState({});

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch campaign details
            const campaignRes = await axios.get(`http://localhost:5000/api/campaigns/${campaignId}`, { headers });
            setCampaign(campaignRes.data);

            // Fetch customers
            const customersRes = await axios.get('http://localhost:5000/api/business/customers', { headers });
            setCustomers(customersRes.data);

            // Fetch referral stats
            const statsRes = await axios.get(`http://localhost:5000/api/referrals/stats/${campaignId}`, { headers });
            setStats(statsRes.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const generateReferralLink = async () => {
        if (!selectedCustomer) {
            setError('Please select a customer');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/referrals/generate', 
                {
                    campaignId,
                    customerId: selectedCustomer
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess('Referral link generated successfully!');
            // Refresh stats
            fetchData();
            // Clear selection
            setSelectedCustomer('');
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error generating referral link');
            setTimeout(() => setError(''), 3000);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(''), 1500);
    };

    const handleCompleteTask = async (referralCode, conversionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/referrals/complete-task/${referralCode}`,
                {
                    conversionId,
                    taskCompletionProof: 'Task completed via dashboard'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setSuccess('Task marked as completed');
            fetchData(); // Refresh the data
        } catch (error) {
            setError(error.response?.data?.message || 'Error completing task');
        }
    };

    const checkRewardEligibility = (referral) => {
        const completedUnclaimedConversions = referral.convertedUsers.filter(
            conv => conv.status === 'completed' && !conv.rewardClaimed
        ).length;
        return completedUnclaimedConversions >= 3;
    };

    const handleClaimReward = async (referralCode, conversionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/referrals/claim-reward/${referralCode}`,
                { conversionId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setSuccess('Reward claimed successfully');
            fetchData(); // Refresh the data
        } catch (error) {
            setError(error.response?.data?.message || 'Error claiming reward');
            setTimeout(() => setError(''), 5000);
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
            <h1 className="text-3xl font-bold mb-8">Campaign Referrals</h1>
            
            {campaign && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">{campaign.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Total Referrals</p>
                            <p className="text-2xl font-bold text-blue-600">{stats?.totalReferrals || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Total Clicks</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.totalClicks || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Total Conversions</p>
                            <p className="text-2xl font-bold text-purple-600">{stats?.totalConversions || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Generate New Referral Link</h3>
                <div className="flex gap-4">
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="flex-1 shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                            <option key={customer._id} value={customer._id}>
                                {customer.name} ({customer.email})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={generateReferralLink}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Generate Link
                    </button>
                </div>
            </div>

            {stats?.referrals && stats.referrals.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Referrer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Referral Link
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Clicks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Conversions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Converted Users
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.referrals.map((referral) => {
                                const isEligibleForReward = checkRewardEligibility(referral);
                                return (
                                    <tr key={referral.referralCode}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {referral.referrer.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {referral.referrer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-500">
                                                    {`${window.location.origin}/r/${referral.referralCode}`}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(`${window.location.origin}/r/${referral.referralCode}`)}
                                                    className="text-blue-500 hover:text-blue-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {referral.clicks}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {referral.conversions}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {isEligibleForReward && (
                                                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                        <p className="text-sm text-green-700">
                                                            🎉 Eligible for reward! You have 3+ completed referrals.
                                                        </p>
                                                    </div>
                                                )}
                                                {referral.convertedUsers && referral.convertedUsers.map((conversion, idx) => (
                                                    <div key={idx} className="text-sm border rounded-lg p-3 bg-gray-50">
                                                        <div className="font-medium text-gray-900">
                                                            {conversion.user?.name || 'Unknown User'}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {conversion.user?.email}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                conversion.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                conversion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {conversion.status}
                                                            </span>
                                                            {conversion.status === 'completed' && !conversion.rewardClaimed && isEligibleForReward && (
                                                                <button
                                                                    onClick={() => handleClaimReward(referral.referralCode, conversion._id)}
                                                                    className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                                >
                                                                    Claim Reward
                                                                </button>
                                                            )}
                                                            {conversion.status === 'completed' && conversion.rewardClaimed && (
                                                                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                                    Reward Claimed ({conversion.rewardAmount} {conversion.rewardType})
                                                                </span>
                                                            )}
                                                            {conversion.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleCompleteTask(referral.referralCode, conversion._id)}
                                                                    className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 hover:bg-green-200"
                                                                >
                                                                    Mark Task Complete
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {conversion.taskCompletedAt ? (
                                                                <span>Completed: {new Date(conversion.taskCompletedAt).toLocaleDateString()}</span>
                                                            ) : (
                                                                <span>Converted: {new Date(conversion.timestamp).toLocaleDateString()}</span>
                                                            )}
                                                            {conversion.rewardClaimedAt && (
                                                                <span className="ml-2">
                                                                    • Reward Claimed: {new Date(conversion.rewardClaimedAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!referral.convertedUsers || referral.convertedUsers.length === 0) && (
                                                    <span className="text-sm text-gray-500">No conversions yet</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(referral.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CampaignReferrals; 