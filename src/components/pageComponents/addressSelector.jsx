"use client"
import React, { useState, useEffect } from 'react'
import { HiLocationMarker, HiPlus, HiCheck, HiPencil, HiTrash } from "react-icons/hi";
import { getUserAddresses, createAddress, setDefaultAddress, deleteAddress } from '@/utils/addressService';
import { toast } from 'react-toastify';

const AddressSelector = ({ onSelect, showAll = false }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newAddress, setNewAddress] = useState({
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
            if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 ||
                !newAddress.city || !newAddress.state || !newAddress.pincode) {
                toast.error('Please fill in all required fields');
                return;
            }

            const response = await createAddress(newAddress);
            toast.success('Address created successfully');

            // Reload addresses
            await loadAddresses();

            // Select the new address
            const createdAddress = response.data;
            setSelectedAddress(createdAddress);
            onSelect(createdAddress);

            // Reset form
            setNewAddress({
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false
            });
            setIsCreating(false);
        } catch (error) {
            console.error('Error creating address:', error);
            toast.error('Failed to create address');
        }
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        onSelect(address);
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

    const handleDeleteAddress = async (addressID) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await deleteAddress(addressID);
            toast.success('Address deleted successfully');
            await loadAddresses();

            // If deleted address was selected, clear selection
            if (selectedAddress?.addressID === addressID) {
                setSelectedAddress(null);
                onSelect(null);
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading addresses...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <HiLocationMarker className="text-red-500" size={20} />
                    Delivery Address
                </h3>
                <button
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50"
                    onClick={() => setIsCreating(!isCreating)}
                >
                    <HiPlus size={16} />
                    {isCreating ? 'Cancel' : 'Add New Address'}
                </button>
            </div>

            {/* Create new address form */}
            {isCreating && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Address</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
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
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
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
                                value={newAddress.addressLine1}
                                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
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
                                value={newAddress.addressLine2}
                                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
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
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
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
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
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
                                    value={newAddress.pincode}
                                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter pincode"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={newAddress.isDefault}
                                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                                Set as default address
                            </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleCreateAddress}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Save Address
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
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
                <div className="space-y-3">
                    {addresses.map((address) => (
                        <div
                            key={address.addressID}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress?.addressID === address.addressID
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleAddressSelect(address)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium text-gray-900">{address.name}</h4>
                                        {address.isDefault && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Default
                                            </span>
                                        )}
                                        {selectedAddress?.addressID === address.addressID && (
                                            <HiCheck className="text-blue-600" size={20} />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                                    <p className="text-sm text-gray-700">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {!address.isDefault && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetDefault(address.addressID);
                                            }}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Set as default"
                                        >
                                            <HiPencil size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAddress(address.addressID);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete address"
                                    >
                                        <HiTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <HiLocationMarker className="mx-auto text-gray-400" size={48} />
                    <p className="text-gray-500 mt-2">No addresses found</p>
                    <p className="text-sm text-gray-400 mt-1">Add your first address to get started</p>
                </div>
            )}

            {selectedAddress && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                        ✓ Selected: {selectedAddress.name} - {selectedAddress.city}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AddressSelector;
