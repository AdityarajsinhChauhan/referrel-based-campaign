import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ReferralLanding() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState(null);

    useEffect(() => {
        trackReferral();
    }, [code]);

    const trackReferral = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/referrals/track/${code}`);
            setCampaign(response.data.campaign);
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid referral link');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        navigate(`/signup/${code}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-2xl w-full mx-4">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-blue-500 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            {campaign.name}
                        </h1>
                    </div>
                    
                    <div className="p-6">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Task to Complete</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700">
                                    {campaign.taskDescription}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Your Reward</h2>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-lg font-medium text-gray-900">
                                            {campaign.rewardType === 'discount' ? 'Discount' :
                                             campaign.rewardType === 'cashback' ? 'Cashback' :
                                             campaign.rewardType === 'gift' ? 'Gift' : 'Reward'}
                                        </p>
                                        <p className="text-gray-700">
                                            {campaign.rewardValue} {campaign.rewardType === 'discount' ? '% off' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <button
                                onClick={handleSignup}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full"
                            >
                                Sign up to Claim Reward
                            </button>
                            <p className="text-sm text-gray-600">

                                Already have an account? <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-600">Log in</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReferralLanding; 