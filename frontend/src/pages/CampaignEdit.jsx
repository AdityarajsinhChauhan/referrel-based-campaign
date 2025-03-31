import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function CampaignEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [campaign, setCampaign] = useState({
        name: '',
        taskType: '',
        taskDescription: '',
        rewardType: '',
        rewardValue: '',
        rewardDetails: '',
        startDate: '',
        endDate: '',
        notificationMessage: '',
        status: ''
    });

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Format dates to YYYY-MM-DD for input type="date"
            const campaignData = {
                ...response.data,
                startDate: new Date(response.data.startDate).toISOString().split('T')[0],
                endDate: new Date(response.data.endDate).toISOString().split('T')[0]
            };
            setCampaign(campaignData);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching campaign');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${id}`, campaign, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/campaigns');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating campaign');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaign(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Edit Campaign</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Campaign updated successfully! Redirecting...
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

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={campaign.status}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                    </select>
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
                        disabled={saving}
                        className={`${
                            saving ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white px-4 py-2 rounded flex items-center`}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CampaignEdit; 