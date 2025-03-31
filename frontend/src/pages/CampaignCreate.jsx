import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampaignCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [campaign, setCampaign] = useState({
        name: '',
        taskType: 'review',
        taskDescription: '',
        rewardType: 'discount',
        rewardValue: '',
        rewardDetails: '',
        startDate: '',
        endDate: '',
        notificationMessage: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns`, campaign, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(true);
            // Wait for 1.5 seconds to show the success message before redirecting
            setTimeout(() => {
                navigate('/campaigns');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating campaign');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaign(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Campaign created successfully! Redirecting...
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Campaign Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={campaign.name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Task Type
                    </label>
                    <select
                        name="taskType"
                        value={campaign.taskType}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="review">Leave a Review</option>
                        <option value="purchase">Make a Purchase</option>
                        <option value="form">Fill Out Form</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Task Description
                    </label>
                    <textarea
                        name="taskDescription"
                        value={campaign.taskDescription}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="3"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Reward Type
                        </label>
                        <select
                            name="rewardType"
                            value={campaign.rewardType}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="discount">Discount</option>
                            <option value="cashback">Cashback</option>
                            <option value="gift">Gift</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Reward Value
                        </label>
                        <input
                            type="number"
                            name="rewardValue"
                            value={campaign.rewardValue}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Reward Details
                    </label>
                    <textarea
                        name="rewardDetails"
                        value={campaign.rewardDetails}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="2"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={campaign.startDate}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={campaign.endDate}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Notification Message
                    </label>
                    <textarea
                        name="notificationMessage"
                        value={campaign.notificationMessage}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="3"
                        placeholder="Message to send to existing customers about this campaign"
                        required
                    />
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/campaigns')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${
                            loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white px-4 py-2 rounded flex items-center`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Campaign'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CampaignCreate; 