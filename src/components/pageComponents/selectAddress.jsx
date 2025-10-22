"use client"
import React, { useState } from 'react'
import { HiLocationMarker } from "react-icons/hi";
import { HiCheck } from "react-icons/hi";

const SelectAddress = ({ onSelect, showAll = false }) => {
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [manualAddress, setManualAddress] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    const handleManualAddressChange = (field, value) => {
        setManualAddress(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleManualAddressSubmit = () => {
        if (!manualAddress.name || !manualAddress.phone || !manualAddress.addressLine1 ||
            !manualAddress.city || !manualAddress.state || !manualAddress.pincode) {
            alert('Please fill in all required fields');
            return;
        }

        const address = {
            addressID: 'manual_' + Date.now(),
            ...manualAddress,
            isDefault: false
        };

        setSelectedAddress(address);
        onSelect(address);
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        onSelect(address);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <HiLocationMarker className="text-red-500" size={20} />
                    Delivery Address
                </h3>
                <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setIsManualEntry(!isManualEntry)}
                >
                    {isManualEntry ? 'Cancel' : 'Enter Address'}
                </button>
            </div>

            {!isManualEntry ? (
                <div className="text-center py-8">
                    <HiLocationMarker className="mx-auto text-gray-400" size={48} />
                    <p className="text-gray-500 mt-2">Enter your delivery address</p>
                    <button
                        className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => setIsManualEntry(true)}
                    >
                        Enter Address
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={manualAddress.name}
                                onChange={(e) => handleManualAddressChange('name', e.target.value)}
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
                                value={manualAddress.phone}
                                onChange={(e) => handleManualAddressChange('phone', e.target.value)}
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
                            value={manualAddress.addressLine1}
                            onChange={(e) => handleManualAddressChange('addressLine1', e.target.value)}
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
                            value={manualAddress.addressLine2}
                            onChange={(e) => handleManualAddressChange('addressLine2', e.target.value)}
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
                                value={manualAddress.city}
                                onChange={(e) => handleManualAddressChange('city', e.target.value)}
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
                                value={manualAddress.state}
                                onChange={(e) => handleManualAddressChange('state', e.target.value)}
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
                                value={manualAddress.pincode}
                                onChange={(e) => handleManualAddressChange('pincode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter pincode"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={handleManualAddressSubmit}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Use This Address
                        </button>
                        <button
                            onClick={() => setIsManualEntry(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
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

export default SelectAddress;
