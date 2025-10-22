"use client"
import React from 'react'
import { ClipLoader } from "react-spinners";
import { HiCreditCard } from "react-icons/hi";
import { HiShieldCheck } from "react-icons/hi";

const CheckoutLoadingModal = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <div className="mb-6">
                    <div className="relative mx-auto w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="absolute inset-4 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <HiCreditCard className="text-blue-600" size={32} />
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Processing Payment
                </h3>

                <p className="text-gray-600 mb-6">
                    Please wait while we process your payment securely...
                </p>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <ClipLoader color="#3B82F6" size={20} speedMultiplier={1} />
                    <span className="text-sm text-gray-500">Processing</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <HiShieldCheck className="text-green-500" size={16} />
                    <span>Your payment is secure and encrypted</span>
                </div>

                <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                        ⚠️ Please do not close this window or refresh the page during payment processing.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutLoadingModal;
