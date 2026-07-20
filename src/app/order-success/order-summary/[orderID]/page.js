'use client';

import { use, useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import Link from 'next/link';
import ReviewExperienceModal from '@/components/site-reviews/ReviewExperienceModal';

export default function OrderSummary({ params }) {
    const { orderID } = use(params);
    const [data, setData] = useState({ items: [], info: null, payments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const [orderRes, paymentRes] = await Promise.all([
                    axiosInstance.get(`/order/user/${orderID}`),
                    axiosInstance.get(`/order/user/${orderID}/payment`).catch(() => ({ data: { data: [] } }))
                ]);

                if (!orderRes?.data?.success) throw new Error(orderRes?.data?.message || 'Failed to fetch order');
                const rows = orderRes?.data?.data || [];
                const payments = paymentRes?.data?.data || [];
                setData({ items: rows, info: rows[0] || null, payments });

                // Prompt for an experience review once per order (skip on refresh/revisit).
                try {
                    const key = `review_prompted_${orderID}`;
                    if (rows.length > 0 && !sessionStorage.getItem(key)) {
                        sessionStorage.setItem(key, '1');
                        setTimeout(() => setShowReviewModal(true), 1200);
                    }
                } catch (_) { /* sessionStorage unavailable — skip */ }
            } catch (e) {
                setError(e?.response?.data?.message || e?.message || 'Failed to fetch order');
            } finally { setLoading(false); }
        }
        load();
    }, [orderID]);

    const copyOrderID = () => {
        navigator.clipboard.writeText(orderID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] grid place-items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-[#EF6A22] mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !data.info) {
        return (
            <div className="min-h-screen bg-[#f8fafc] grid place-items-center p-6 text-center">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-md w-full">
                    <div className="text-5xl mb-4">📦</div>
                    <div className="text-xl font-bold text-slate-800 mb-2">Order Not Found</div>
                    <div className="text-slate-500 mb-6 text-sm">{error || 'Unable to load this order.'}</div>
                    <Link href="/account" className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-[#EF6A22] text-white rounded-lg text-sm font-semibold hover:bg-[#d85d1c] transition">
                        ← Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    const info = data.info;
    const status = (info.orderStatus || 'pending').toLowerCase();

    // Calculate subtotal
    const subtotal = data.items.reduce((s, it) => {
        const unitPrice = Number(it.final_price ?? it.pItemPrice ?? it.productPrice ?? 0);
        const acceptedQty = (it.accepted_units || 0);
        const requestedQty = (it.requested_units || it.units || 0);
        const qty = acceptedQty > 0 ? acceptedQty : requestedQty;
        return s + (unitPrice * qty);
    }, 0);

    const shippingCharge = Number(info.shipping_charge || 0);
    const total = subtotal + shippingCharge;
    const totalPaid = data.payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
    const remaining = total - totalPaid;

    // Order progress steps based on actual status
    const getProgressSteps = () => {
        const placedDate = info.createdAt ? new Date(info.createdAt) : null;
        const updatedDate = info.updatedAt ? new Date(info.updatedAt) : null;

        const formatDate = (d) => d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const formatTime = (d) => d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

        const steps = [
            {
                label: 'Order Received',
                description: placedDate ? `${formatDate(placedDate)}, ${formatTime(placedDate)}` : '',
                status: 'completed',
                icon: (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                )
            },
            {
                label: 'Under Review',
                description: status === 'pending' ? 'Reviewing availability' : 'Review completed',
                status: status === 'pending' ? 'active' : 'completed',
                icon: status === 'pending' ? (
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                )
            }
        ];

        if (status === 'rejected') {
            steps.push({
                label: 'Order Rejected',
                description: updatedDate ? `Rejected on ${formatDate(updatedDate)}` : 'Cancelled',
                status: 'rejected',
                icon: (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            });
        } else {
            steps.push({
                label: 'Order Accepted',
                description: status === 'accepted' ? (updatedDate ? `Accepted on ${formatDate(updatedDate)}` : 'Confirmed') : 'Awaiting review',
                status: status === 'accepted' ? 'completed' : 'upcoming',
                icon: status === 'accepted' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                )
            });

            // Dispatch step
            steps.push({
                label: 'Dispatched',
                description: info.isDispatched
                    ? `Shipped via ${info.companyName || 'Courier'}`
                    : 'Awaiting dispatch',
                status: info.isDispatched ? 'completed' : 'upcoming',
                icon: info.isDispatched ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                )
            });

            // Payment step
            const isFullyPaid = totalPaid >= total;
            const paymentLabel = isFullyPaid ? 'Payment Received' : totalPaid > 0 ? 'Partially Paid' : 'Pending Payment';
            const paymentDesc = isFullyPaid
                ? `Received ₹${totalPaid.toFixed(2)}`
                : totalPaid > 0
                    ? `Paid ₹${totalPaid.toFixed(2)} of ₹${total.toFixed(2)}`
                    : 'Awaiting payment';

            steps.push({
                label: paymentLabel,
                description: paymentDesc,
                status: isFullyPaid ? 'completed' : totalPaid > 0 ? 'active' : 'upcoming',
                icon: isFullyPaid ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : totalPaid > 0 ? (
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                ) : (
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                )
            });
        }

        return steps;
    };

    const steps = getProgressSteps();

    // Color mapper for order status badge
    const statusBadges = {
        pending: 'bg-amber-50 text-amber-700 border border-amber-200',
        accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border border-red-200',
    };
    const statusLabels = {
        pending: 'Pending Review',
        accepted: 'Order Accepted',
        rejected: 'Order Rejected',
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

                {/* ── 1. Header Card (Banner Layout matching design) ── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* Left Side: Circular Success/Status Indicator and Message */}
                        <div className="flex items-start md:items-center gap-5">
                            {/* Conic Ring Wrapper around dot */}
                            <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                        {status === 'rejected' ? (
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    {/* Small outer decorative sparkles/dots */}
                                    <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
                                    <span className="absolute bottom-1 right-2 w-2 h-2 bg-emerald-200 rounded-full"></span>
                                    <span className="absolute top-4 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                                        Order {status === 'accepted' ? 'Confirmed!' : status === 'rejected' ? 'Rejected' : 'Received!'}
                                    </h1>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {status === 'pending' && `Thank you, ${info.userName || 'Customer'}! We've received your order and will notify you when it ships.`}
                                    {status === 'accepted' && `Thank you, ${info.userName || 'Customer'}! Your order has been confirmed and is being processed.`}
                                    {status === 'rejected' && `Sorry, your order could not be accepted. Please contact support for more details.`}
                                </p>
                                <div className="pt-2">
                                    <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Order Number metadata and quick info (mockup match) */}
                        <div className="lg:border-l border-slate-200 lg:pl-8 py-2 min-w-full lg:min-w-[400px]">
                            
                            {/* Order Number Box */}
                            <div className="space-y-1 mb-5">
                                <div className="text-xs font-semibold text-slate-400">Order Number</div>
                                <div className="flex items-center gap-2.5">
                                    <span className="font-sans text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{orderID}</span>
                                    <button
                                        onClick={copyOrderID}
                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm"
                                        title="Copy Order ID"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    {copied && <span className="text-[10px] text-green-600 font-semibold bg-white border border-green-150 px-2 py-0.5 rounded shadow-sm">Copied!</span>}
                                </div>
                            </div>

                            {/* Sub-grid of Placed On, Estimated Delivery, and Order Status */}
                            <div className="grid grid-cols-3 divide-x divide-slate-200 gap-2 items-center">
                                
                                {/* Placed On */}
                                <div className="flex items-center gap-3 pr-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-50/70 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placed On</div>
                                        <div className="text-xs font-bold text-slate-800">
                                            {info.createdAt ? new Date(info.createdAt).toLocaleDateString('en-US', {
                                                month: 'long', day: 'numeric', year: 'numeric'
                                            }) : '—'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {info.createdAt ? new Date(info.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit', minute: '2-digit', hour12: true
                                            }) : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Ordered By */}
                                <div className="flex items-center gap-3 px-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9m-9-9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordered By</div>
                                        <div className="text-xs font-bold text-slate-800">
                                            WEBSITE
                                        </div>
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div className="pl-4">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className={`w-2 h-2 rounded-full ${
                                            status === 'accepted' ? 'bg-emerald-500' :
                                            status === 'rejected' ? 'bg-red-500' :
                                            'bg-amber-500'
                                        }`}></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Status</span>
                                    </div>
                                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold ${
                                        status === 'accepted'
                                            ? (remaining > 0 ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' : 'bg-[#D1FAE5] text-[#065F46] border border-[#10B981]')
                                            : status === 'rejected'
                                                ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                                                : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                                    }`}>
                                        {status === 'accepted'
                                            ? (remaining > 0 ? 'Pending Payment' : 'Paid & Confirmed')
                                            : status === 'rejected'
                                                ? 'Order Rejected'
                                                : 'Pending Review'}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>

                {/* ── 2. Two-Column Main Content Section ── */}
                <div className="grid lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left & Center: Combined Items & Progress Panel */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-150">
                            
                            {/* Left Column: Order Progress timeline sidebar */}
                            <div className="p-6 md:col-span-1 bg-slate-50/50">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Order Progress</h3>
                                
                                <div className="relative flex flex-col gap-6 pl-2">
                                    {/* Connecting Line */}
                                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                                    
                                    {steps.map((step, idx) => {
                                        const isLast = idx === steps.length - 1;
                                        
                                        const dotColors = {
                                            completed: 'bg-emerald-500 ring-4 ring-emerald-50',
                                            active: 'bg-[#EF6A22] ring-4 ring-orange-100',
                                            rejected: 'bg-red-500 ring-4 ring-red-50',
                                            upcoming: 'bg-slate-200',
                                        };
                                        const textColors = {
                                            completed: 'text-slate-800 font-semibold',
                                            active: 'text-[#EF6A22] font-semibold',
                                            rejected: 'text-red-600 font-semibold',
                                            upcoming: 'text-slate-400',
                                        };
                                        
                                        return (
                                            <div key={idx} className="flex gap-4 items-start relative z-10">
                                                {/* Step Circle */}
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white ${dotColors[step.status] || dotColors.upcoming}`}>
                                                    {step.status === 'completed' && (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    )}
                                                    {step.status === 'rejected' && (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    )}
                                                    {step.status === 'active' && (
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    )}
                                                    {step.status === 'upcoming' && (
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                                    )}
                                                </div>
                                                
                                                {/* Text Info */}
                                                <div className="space-y-0.5">
                                                    <div className={`text-xs ${textColors[step.status]}`}>{step.label}</div>
                                                    {step.description && (
                                                        <div className="text-[10px] text-slate-400 font-medium leading-normal">{step.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Right Area: Items list and Footer Support */}
                            <div className="md:col-span-3 flex flex-col justify-between min-h-[400px]">
                                
                                {/* Items Header and List */}
                                <div>
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                        <h2 className="font-bold text-slate-800 text-sm">Order Items ({data.items.length})</h2>
                                    </div>
                                    
                                    <div className="divide-y divide-slate-100">
                                        {data.items.map((it, idx) => {
                                            const unitPrice = Number(it.final_price ?? it.pItemPrice ?? it.productPrice ?? 0);
                                            const requestedQty = (it.requested_units || it.units || 0);
                                            const acceptedQty = (it.accepted_units || 0);
                                            const qty = acceptedQty > 0 ? acceptedQty : requestedQty;
                                            const lineTotal = unitPrice * qty;
                                            const isPartial = acceptedQty > 0 && acceptedQty < requestedQty;
                                            const isRejected = acceptedQty === 0 && it.acceptance_status === 'rejected';

                                            return (
                                                <div key={idx} className="p-6 flex items-start gap-4 hover:bg-slate-50/30 transition">
                                                    <img
                                                        src={it.featuredImage || ''}
                                                        alt={it.productName}
                                                        className="w-20 h-20 object-cover rounded-xl border border-slate-200/80 flex-shrink-0 bg-slate-50"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">{it.productName}</h3>
                                                        <div className="text-xs text-slate-400 mb-2">SKU: {it.sku || '—'}</div>
                                                        
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {/* Show requested units always */}
                                                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
                                                                Requested: {requestedQty}
                                                            </span>
                                                            
                                                            {/* Show accepted units if order is accepted or partial */}
                                                            {status === 'accepted' && (
                                                                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                                                                    Accepted: {acceptedQty}
                                                                </span>
                                                            )}

                                                            {isRejected && (
                                                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                                                                    Item rejected
                                                                </span>
                                                            )}
                                                        </div>
                                                        {it.admin_notes && (
                                                            <div className="mt-2 text-xs text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border-l-2 border-indigo-400">
                                                                {it.admin_notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-xs text-slate-400">₹{unitPrice.toFixed(2)} × {qty}</div>
                                                        <div className="text-base font-extrabold text-slate-900">₹{lineTotal.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar segment (Summary, Payment, Address) */}
                    <div className="space-y-6">
                        
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-150 flex items-center gap-2">
                                <span className="text-base">📋</span>
                                <h2 className="font-bold text-slate-800 text-sm">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-3.5 text-xs font-semibold text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span className="text-slate-800">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Shipping</span>
                                    <span className={shippingCharge > 0 ? 'text-slate-800' : 'text-green-600 font-bold'}>
                                        {shippingCharge > 0 ? `₹${shippingCharge.toFixed(2)}` : 'FREE'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Discount</span>
                                    <span className="text-slate-800">− ₹0.00</span>
                                </div>
                                <div className="border-t border-slate-100 my-2"></div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Amount Paid</span>
                                    <span className="text-green-600 font-bold">₹{totalPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Amount Remaining</span>
                                    <span className={remaining > 0 ? 'text-orange-600 font-bold animate-pulse' : 'text-green-600 font-bold'}>
                                        ₹{remaining.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-extrabold text-slate-900">Total Amount</span>
                                        <span className="text-xl font-black text-indigo-600">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                                <span className="text-base">💳</span>
                                Payment Method
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs text-slate-500">
                                    {info.paymentMode === 'COD' ? 'COD' : 'ONL'}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">
                                        {info.paymentMode === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {info.paymentMode === 'COD' ? 'Pay when package arrives' : 'Paid online'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipment Tracking Card */}
                        {info.isDispatched && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
                                <h3 className="font-bold text-blue-900 text-sm mb-4 flex items-center gap-2">
                                    <span className="text-base">📦</span>
                                    Shipment Tracking
                                </h3>
                                <div className="text-xs space-y-2 font-semibold text-slate-700">
                                    {info.companyName && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Courier Partner</span>
                                            <span className="text-slate-900 font-extrabold">{info.companyName}</span>
                                        </div>
                                    )}
                                    {info.awbNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">AWB No</span>
                                            <span className="text-slate-900 font-mono font-extrabold">{info.awbNumber}</span>
                                        </div>
                                    )}
                                    {info.trackingLink && (
                                        <div className="pt-2">
                                            <a
                                                href={info.trackingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#EF6A22] text-white rounded-lg text-xs font-bold hover:bg-[#d85d1c] transition"
                                            >
                                                Track Shipment 🔗
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Delivery Address Card */}
                        {info.addressName && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                                    <span className="text-base">📍</span>
                                    Delivery Address
                                </h3>
                                <div className="text-xs space-y-1.5 font-semibold text-slate-600">
                                    <div className="font-extrabold text-slate-900 text-sm">{info.addressName}</div>
                                    {info.addressPhone && (
                                        <div className="text-slate-400 flex items-center gap-1">
                                            <span>📞</span>
                                            {info.addressPhone}
                                        </div>
                                    )}
                                    <div className="text-slate-500 leading-relaxed">
                                        {info.addressLine1}{info.addressLine2 ? `, ${info.addressLine2}` : ''}
                                    </div>
                                    <div className="text-slate-500">
                                        {info.addressCity}, {info.addressState} - {info.addressPincode}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Remarks Card (only show if present) */}
                        {(info.remarks || (info.remarks_photos && info.remarks_photos.length > 0)) && (
                            <div className="bg-blue-50/50 rounded-2xl border border-blue-200 p-6 shadow-sm">
                                <h3 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
                                    <span>📝</span>
                                    Admin Remarks
                                </h3>
                                {info.remarks && (
                                    <div className="text-xs text-blue-800 leading-relaxed font-semibold mb-3 whitespace-pre-wrap">{info.remarks}</div>
                                )}
                                {info.remarks_photos && (() => {
                                    let photos = [];
                                    if (Array.isArray(info.remarks_photos)) {
                                        photos = info.remarks_photos;
                                    } else if (typeof info.remarks_photos === 'string') {
                                        try { photos = JSON.parse(info.remarks_photos); } catch { photos = []; }
                                    }
                                    return photos.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {photos.map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={photo}
                                                    alt={`Remarks photo ${index + 1}`}
                                                    className="w-full h-16 object-cover rounded-lg border border-blue-200/60 cursor-pointer hover:opacity-85 transition"
                                                    onClick={() => window.open(photo, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        {/* Payment Transactions Card (only show if present) */}
                        {data.payments && data.payments.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 text-sm mb-4">Payment Transactions</h3>
                                <div className="space-y-3">
                                    {data.payments.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-bold text-slate-800">₹{Number(p.paid_amount).toFixed(2)}</div>
                                                <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            {p.notes && <span className="text-[10px] text-slate-400 italic max-w-[120px] truncate">{p.notes}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Back actions */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowReviewModal(true)}
                                className="w-full flex items-center justify-center px-5 py-3 bg-white border border-[#EF6A22] text-[#EF6A22] rounded-xl text-sm font-bold hover:bg-orange-50 transition"
                            >
                                ★ Review Your Experience
                            </button>
                            <Link href="/account" className="w-full flex items-center justify-center px-5 py-3 bg-[#EF6A22] text-white rounded-xl text-sm font-bold hover:bg-[#d85d1c] transition shadow-sm">
                                My Orders
                            </Link>
                        </div>

                    </div>

                </div>

            </div>

            <ReviewExperienceModal open={showReviewModal} onClose={() => setShowReviewModal(false)} />
        </div>
    );
}
