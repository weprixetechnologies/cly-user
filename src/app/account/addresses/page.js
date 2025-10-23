"use client"
import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiPlus, HiPencil, HiTrash, HiCheck } from 'react-icons/hi';
import { getUserAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/utils/addressService';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const AddressesPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const response = await getUserAddresses();
            setAddresses(response.data || []);
        } catch (error) {
            console.error('Error loading addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAddress = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.addressLine1 ||
                !formData.city || !formData.state || !formData.pincode) {
                toast.error('Please fill in all required fields');
                return;
            }

            await createAddress(formData);
            toast.success('Address created successfully');
            await loadAddresses();
            resetForm();
        } catch (error) {
            console.error('Error creating address:', error);
            toast.error('Failed to create address');
        }
    };

    const handleUpdateAddress = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.addressLine1 ||
                !formData.city || !formData.state || !formData.pincode) {
                toast.error('Please fill in all required fields');
                return;
            }

            await updateAddress(editingAddress.addressID, formData);
            toast.success('Address updated successfully');
            await loadAddresses();
            resetForm();
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Failed to update address');
        }
    };

    const handleDeleteAddress = async (addressID) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await deleteAddress(addressID);
            toast.success('Address deleted successfully');
            await loadAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (addressID) => {
        try {
            await setDefaultAddress(addressID);
            toast.success('Default address updated');
            await loadAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Failed to update default address');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        });
        setEditingAddress(null);
        setShowForm(false);
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            name: address.name,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault
        });
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <ClipLoader color="#3B82F6" size={40} />
                <span className="ml-2 text-gray-600">Loading addresses...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <HiPlus size={20} />
                    Add New Address
                </button>
            </div>

            {/* Address form */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1 *
                            </label>
                            <input
                                type="text"
                                value={formData.addressLine1}
                                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Street address, building, house number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                value={formData.addressLine2}
                                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Apartment, suite, unit, etc. (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter city"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter state"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter pincode"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                                Set as default address
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={editingAddress ? handleUpdateAddress : handleCreateAddress}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Address list */}
            {addresses.length > 0 ? (
                <div className="grid gap-4">
                    {addresses.map((address) => (
                        <div key={address.addressID} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <HiLocationMarker className="text-red-500" size={20} />
                                        <h3 className="font-semibold text-gray-900">{address.name}</h3>
                                        {address.isDefault && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">{address.phone}</p>
                                    <p className="text-gray-700 mb-1">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-gray-600">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address.addressID)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <HiCheck size={16} />
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        <HiPencil size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(address.addressID)}
                                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <HiTrash size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <HiLocationMarker className="mx-auto text-gray-400" size={64} />
                    <h3 className="text-lg font-medium text-gray-900 mt-4">No addresses found</h3>
                    <p className="text-gray-500 mt-2">Add your first address to get started</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Address
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddressesPage;
