import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddCustomer = ({ onCustomerAdded }) => {
    const { user } = useAuth();
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/customers', {
                ...customer,
                businessId: user.id // Assuming user.id is the business ID
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Customer added successfully!');
            setCustomer({ name: '', email: '', phone: '' }); // Reset form
            onCustomerAdded(); // Call the callback to refresh the customer list
        } catch (error) {
            // Check if error response exists and set the error message accordingly
            const errorMessage = error.response ? error.response.data.message : 'An unexpected error occurred';
            setError('Error adding customer: ' + errorMessage);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Add Customer</h1>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={customer.name}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                        Phone
                    </label>
                    <input
                        type="text"
                        name="phone"
                        value={customer.phone}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Add Customer
                </button>
            </form>
        </div>
    );
};

export default AddCustomer; 