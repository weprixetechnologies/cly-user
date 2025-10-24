'use client';

import { use, useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import Link from 'next/link';

export default function OrderSummary({ params }) {
    const { orderID } = use(params);
    const [data, setData] = useState({ items: [], info: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/order/user/${orderID}`);
                if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to fetch order');
                const rows = res?.data?.data || [];
                setData({ items: rows, info: rows[0] || null });
            } catch (e) {
                setError(e?.response?.data?.message || e?.message || 'Failed to fetch order');
            } finally { setLoading(false); }
        }
        load();
    }, [orderID]);

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="text-gray-600">Loading order…</div>
            </div>
        );
    }

    if (error || !data.info) {
        return (
            <div className="min-h-screen grid place-items-center p-6 text-center">
                <div>
                    <div className="text-2xl font-semibold mb-2">Order not available</div>
                    <div className="text-gray-600 mb-4">{error || 'Unable to load this order.'}</div>
                    <Link href="/account" className="px-4 py-2 bg-black text-white rounded-md">My Orders</Link>
                </div>
            </div>
        );
    }

    const info = data.info;

    // Calculate subtotal based on accepted quantities (for partial acceptance)
    const subtotal = data.items.reduce((s, it) => {
        const unitPrice = Number(it.productPrice || 0);
        const acceptedQuantity = (it.accepted_units || 0);
        const requestedQuantity = (it.requested_units || it.units || 0);
        // Use accepted quantity if available, otherwise use requested quantity
        const quantity = acceptedQuantity > 0 ? acceptedQuantity : requestedQuantity;
        return s + (unitPrice * quantity);
    }, 0);

    const total = subtotal; // No delivery fee

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Order Confirmation</div>
                                <div className="text-3xl font-bold text-slate-900">{orderID}</div>
                                <div className="text-sm text-slate-500">
                                    Placed on {info.createdAt ? new Date(info.createdAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Unknown date'}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${info.orderStatus === 'accepted'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : info.orderStatus === 'rejected'
                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                    {info.orderStatus || 'pending'}
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Products Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {data.items.map((it, idx) => {
                                    const unitPrice = Number(it.productPrice || 0);
                                    const requestedQuantity = (it.requested_units || it.units || 0);
                                    const acceptedQuantity = (it.accepted_units || 0);
                                    const quantity = acceptedQuantity > 0 ? acceptedQuantity : requestedQuantity;
                                    const totalPrice = unitPrice * quantity;
                                    const isPartial = acceptedQuantity > 0 && acceptedQuantity < requestedQuantity;
                                    const isRejected = acceptedQuantity === 0 && it.acceptance_status === 'rejected';

                                    return (
                                        <div key={idx} className="group bg-gradient-to-r from-white to-slate-50 rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={it.featuredImage || ''}
                                                        alt={it.productName}
                                                        className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {isPartial && (
                                                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            Partial
                                                        </div>
                                                    )}
                                                    {isRejected && (
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            Rejected
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {it.productName}
                                                    </h3>
                                                    <div className="text-sm text-slate-500 mb-2">SKU: {it.sku || '—'}</div>

                                                    <div className="flex items-center gap-4 mb-3">
                                                        {isPartial ? (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                                                                    Requested: {requestedQuantity}
                                                                </span>
                                                                <span className="text-slate-400">→</span>
                                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                                                    Accepted: {acceptedQuantity}
                                                                </span>
                                                            </div>
                                                        ) : isRejected ? (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                                                                    Requested: {requestedQuantity}
                                                                </span>
                                                                <span className="text-slate-400">→</span>
                                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                                                                    Rejected
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                                                                Qty: {quantity}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {it.admin_notes && (
                                                        <div className="bg-slate-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                                            <div className="text-xs text-slate-600 font-medium mb-1">Admin Note:</div>
                                                            <div className="text-sm text-slate-700 italic">{it.admin_notes}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-slate-500 mb-1">
                                                        ₹{unitPrice.toFixed(2)} × {quantity}
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-900">
                                                        ₹{totalPrice.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Order Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                Payment Method
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <span className="text-slate-600 font-bold text-sm">
                                        {info.paymentMode === 'COD' ? 'COD' : 'ONL'}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        {info.paymentMode === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {info.paymentMode === 'COD' ? 'Pay when delivered' : 'Paid online'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {info.addressName && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    Delivery Address
                                </h3>
                                <div className="space-y-2">
                                    <div className="font-semibold text-slate-900">{info.addressName}</div>
                                    <div className="text-slate-600">{info.addressPhone}</div>
                                    <div className="text-slate-600">
                                        {info.addressLine1}{info.addressLine2 ? `, ${info.addressLine2}` : ''}
                                    </div>
                                    <div className="text-slate-600">
                                        {info.addressCity}, {info.addressState} - {info.addressPincode}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                href="/account"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                My Orders
                            </Link>
                            <Link
                                href="/products"
                                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
