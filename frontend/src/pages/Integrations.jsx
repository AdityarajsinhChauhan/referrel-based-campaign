import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Integrations() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIntegration, setNewIntegration] = useState({
        type: 'zapier',
        name: '',
        config: {
            apiKey: '',
            webhookUrl: ''
        }
    });

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/integrations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIntegrations(response.data);
        } catch (error) {
            console.error('Error fetching integrations:', error);
            toast.error('Failed to fetch integrations');
        } finally {
            setLoading(false);
        }
    };

    const handleAddIntegration = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/integrations',
                newIntegration,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setIntegrations([...integrations, response.data]);
            setShowAddModal(false);
            setNewIntegration({
                type: 'zapier',
                name: '',
                config: {
                    apiKey: '',
                    webhookUrl: ''
                }
            });
            toast.success('Integration added successfully');
        } catch (error) {
            console.error('Error adding integration:', error);
            toast.error('Failed to add integration');
        }
    };

    const handleSync = async (integrationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/integrations/${integrationId}/sync`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success(`Synced ${response.data.contactsCount} contacts`);
            fetchIntegrations();
        } catch (error) {
            console.error('Error syncing contacts:', error);
            toast.error('Failed to sync contacts');
        }
    };

    const handleDelete = async (integrationId) => {
        if (!window.confirm('Are you sure you want to delete this integration?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/integrations/${integrationId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setIntegrations(integrations.filter(i => i._id !== integrationId));
            toast.success('Integration deleted successfully');
        } catch (error) {
            console.error('Error deleting integration:', error);
            toast.error('Failed to delete integration');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">CRM Integrations</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Integration
                </button>
            </div>

            {integrations.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No integrations found. Add your first CRM integration!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration) => (
                        <div
                            key={integration._id}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                                    <p className="text-sm text-gray-600 capitalize">{integration.type}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${
                                        integration.config.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {integration.config.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Contacts: {integration.metadata.contactsCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Last Sync:{' '}
                                    {integration.config.lastSync
                                        ? new Date(integration.config.lastSync).toLocaleString()
                                        : 'Never'}
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleSync(integration._id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Sync Now
                                </button>
                                <button
                                    onClick={() => handleDelete(integration._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Integration</h2>
                        <form onSubmit={handleAddIntegration}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Integration Type
                                </label>
                                <select
                                    value={newIntegration.type}
                                    onChange={(e) =>
                                        setNewIntegration({ ...newIntegration, type: e.target.value })
                                    }
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="zapier">Zapier</option>
                                    <option value="hubspot">HubSpot</option>
                                    <option value="salesforce">Salesforce</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Integration Name
                                </label>
                                <input
                                    type="text"
                                    value={newIntegration.name}
                                    onChange={(e) =>
                                        setNewIntegration({ ...newIntegration, name: e.target.value })
                                    }
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="My CRM Integration"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="text"
                                    value={newIntegration.config.apiKey}
                                    onChange={(e) =>
                                        setNewIntegration({
                                            ...newIntegration,
                                            config: {
                                                ...newIntegration.config,
                                                apiKey: e.target.value
                                            }
                                        })
                                    }
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Enter API Key"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Webhook URL
                                </label>
                                <input
                                    type="url"
                                    value={newIntegration.config.webhookUrl}
                                    onChange={(e) =>
                                        setNewIntegration({
                                            ...newIntegration,
                                            config: {
                                                ...newIntegration.config,
                                                webhookUrl: e.target.value
                                            }
                                        })
                                    }
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="https://hooks.zapier.com/..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add Integration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Integrations; 