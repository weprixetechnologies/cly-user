"use client"
import React from 'react'
import { RxCross2 } from "react-icons/rx";

const BreakdownCart = ({ breakdownData, couponDiscount, appliedCoupon, onRemoveCoupon, cart = [] }) => {
    const {
        subtotal = 0,
        deliveryFee = 0,
        total = 0,
        itemCount = 0
    } = breakdownData || {};

    // Calculate total units from cart items
    const totalUnits = cart.reduce((total, item) => {
        return total + (item.boxQty || 0) + (item.units || 0);
    }, 0);

    const finalTotal = total - couponDiscount;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

            <div className="space-y-3">
                {/* Item Count and Units */}
                <div className="flex justify-between text-sm">
                    <span>Items ({cart.length})</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Total Units */}
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Units ({totalUnits})</span>
                    <span></span>
                </div>


                {/* Applied Coupon */}
                {appliedCoupon && (
                    <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">Coupon Applied</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {appliedCoupon.couponCode}
                            </span>
                            {onRemoveCoupon && (
                                <button
                                    onClick={onRemoveCoupon}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <RxCross2 size={14} />
                                </button>
                            )}
                        </div>
                        <span className="text-green-600">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Total */}
                <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                </div>
            </div>


            {/* Savings message */}
            {appliedCoupon && couponDiscount > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700 font-medium">
                        💰 You saved ₹{couponDiscount.toFixed(2)} with this coupon!
                    </p>
                </div>
            )}
        </div>
    );
};

export default BreakdownCart;
