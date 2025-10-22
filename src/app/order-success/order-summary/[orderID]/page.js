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
    const subtotal = data.items.reduce((s, it) => s + (Number(it.productPrice || 0) * ((it.boxQty || 0) + (it.packQty || 0) + (it.units || 0))), 0);
    const delivery = subtotal >= 499 ? 0 : 50;
    const total = subtotal + delivery;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white border rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-sm text-gray-500">Order ID</div>
                        <div className="text-xl font-semibold">{orderID}</div>
                    </div>
                    <div>
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">{info.orderStatus || 'pending'}</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="md:col-span-2 space-y-4">
                        {data.items.map((it, idx) => (
                            <div key={idx} className="border rounded-lg p-4 flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={it.featuredImage || ''} alt={it.productName} className="w-20 h-20 object-cover rounded" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{it.productName}</div>
                                    <div className="text-sm text-gray-500">SKU: {it.sku || '—'}</div>
                                    <div className="text-xs text-gray-500 mt-1">Qty: {(it.boxQty || 0) + (it.packQty || 0) + (it.units || 0)}</div>
                                </div>
                                <div className="font-semibold">₹ {Number(it.productPrice || 0).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <div className="font-semibold mb-2">Summary</div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>₹ {subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span>{delivery === 0 ? 'Free' : `₹ ${delivery.toFixed(2)}`}</span></div>
                            <div className="border-t mt-3 pt-3 flex justify-between font-semibold"><span>Total</span><span>₹ {total.toFixed(2)}</span></div>
                        </div>
                        <div className="border rounded-lg p-4">
                            <div className="font-semibold mb-2">Payment</div>
                            <div className="text-sm">{info.paymentMode || 'COD'}</div>
                        </div>
                        {info.addressName && (
                            <div className="border rounded-lg p-4">
                                <div className="font-semibold mb-2">Delivery Address</div>
                                <div className="text-sm">
                                    <div className="font-medium">{info.addressName}</div>
                                    <div className="text-gray-600">{info.addressPhone}</div>
                                    <div className="text-gray-600 mt-1">{info.addressLine1}{info.addressLine2 ? `, ${info.addressLine2}` : ''}</div>
                                    <div className="text-gray-600">{info.addressCity}, {info.addressState} - {info.addressPincode}</div>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Link href="/account" className="px-4 py-2 bg-black text-white rounded-md text-center flex-1">My Orders</Link>
                            <Link href="/products" className="px-4 py-2 border rounded-md text-center flex-1">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
