"use client"
import React, { useState } from 'react'
import { HiCreditCard } from "react-icons/hi";
import { HiCash } from "react-icons/hi";
import { HiCheck } from "react-icons/hi";
import { HiPhone } from "react-icons/hi";

const SelectPayment = ({ onSelect }) => {
    const [selectedPayment, setSelectedPayment] = useState('cod');

    const paymentMethods = [
        {
            id: 'cod',
            name: 'Advance Payment',
            description: 'Pay when your order arrives',
            icon: <HiCash className="text-green-600" size={24} />,
            available: true
        },
        {
            id: 'phonepe',
            name: 'PhonePe',
            description: 'Pay securely with PhonePe',
            icon: <HiPhone className="text-purple-600" size={24} />,
            available: false
        },
        {
            id: 'card',
            name: 'Credit/Debit Card',
            description: 'Pay with your card',
            icon: <HiCreditCard className="text-blue-600" size={24} />,
            available: false
        }
    ];

    const handlePaymentSelect = (method) => {
        if (!method.available) return;

        setSelectedPayment(method.id);
        onSelect(method.id);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Select Payment Method</h3>

            <div className="space-y-3">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : method.available
                                ? 'border-gray-200 hover:border-gray-300'
                                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                            }`}
                        onClick={() => handlePaymentSelect(method)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {method.icon}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{method.name}</span>
                                        {!method.available && (
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{method.description}</p>
                                </div>
                            </div>
                            {selectedPayment === method.id && (
                                <HiCheck className="text-blue-500" size={20} />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedPayment && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                        ✓ Selected: {paymentMethods.find(m => m.id === selectedPayment)?.name}
                    </p>
                </div>
            )}

            {/* Payment Security Note */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700">
                    🔒 Your payment information is secure and encrypted. We never store your card details.
                </p>
            </div>
        </div>
    );
};

export default SelectPayment;
