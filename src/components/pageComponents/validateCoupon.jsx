"use client"
import React, { useState } from 'react'
import { HiTicket } from "react-icons/hi";
import { HiCheck } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import { HiPlus } from "react-icons/hi";
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';

const ValidateCoupon = ({ onCouponApplied, appliedCoupon, onRemoveCoupon }) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/coupon/validate', {
                couponCode: couponCode.trim()
            });

            if (response.data.success) {
                const couponData = {
                    couponCode: couponCode.trim(),
                    discount: response.data.discount,
                    description: response.data.description || 'Coupon applied successfully'
                };
                onCouponApplied(couponData);
                toast.success('Coupon applied successfully!');
                setCouponCode('');
                setShowInput(false);
            } else {
                toast.error(response.data.message || 'Invalid coupon code');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error(error?.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        onRemoveCoupon();
        toast.success('Coupon removed');
    };

    if (appliedCoupon) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <HiCheck className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-green-800 text-sm">
                                Coupon Applied: {appliedCoupon.couponCode}
                            </p>
                            <p className="text-green-600 text-xs">
                                You saved ₹{appliedCoupon.discount}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <RxCross2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            {!showInput ? (
                <button
                    onClick={() => setShowInput(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                    <HiTicket className="text-gray-400" size={20} />
                    <span className="text-gray-600 font-medium">Have a coupon code?</span>
                    <HiPlus className="text-gray-400" size={16} />
                </button>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HiTicket className="text-blue-500" size={20} />
                        <span className="font-medium text-sm">Enter Coupon Code</span>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={loading || !couponCode.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setShowInput(false);
                                setCouponCode('');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidateCoupon;
