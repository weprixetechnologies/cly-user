'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import { getCookie } from '@/utils/cookieUtil';
import { getUserAddresses } from '@/utils/addressService';

const Tabs = {
    PROFILE: 'PROFILE',
    ORDERS: 'ORDERS',
    ADDRESSES: 'ADDRESSES',
};

export default function AccountPage() {
    const router = useRouter();
    const [active, setActive] = useState(Tabs.PROFILE);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState({ name: '', phoneNumber: '', gstin: '' });
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const cookieUid = getCookie('uid');
        setUid(cookieUid || null);
    }, []);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        (async () => {
            try {
                setLoading(true);
                const [uRes, oRes, aRes] = await Promise.all([
                    api.get(`/users/${uid}`),
                    api.get(`/order/user/${uid}/orders/detailed`),
                    getUserAddresses().catch(() => ({ data: [] })) // Handle addresses gracefully
                ]);
                const u = uRes?.data?.user || null;
                setUser(u);
                setForm({
                    name: u?.name || '',
                    phoneNumber: u?.phoneNumber || '',
                    gstin: u?.gstin || ''
                });
                setOrders(oRes?.data?.data || []);
                setAddresses(aRes?.data || []);
            } finally { setLoading(false); }
        })();
    }, [uid]);

    const saveProfile = async () => {
        await api.put(`/users/${uid}`, form);
        alert('Profile updated');
    };

    const handleSignOut = () => {
        router.push('/logout');
    };

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
                <div className="text-gray-700">Loading your account…</div>
            </div>
        );
    }

    if (!uid) {
        return (
            <div className="min-h-screen grid place-items-center p-6 text-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
                <div className="bg-white/80 backdrop-blur border border-orange-100 rounded-2xl px-8 py-10 shadow-lg">
                    <div className="text-2xl font-semibold mb-2 text-gray-900">Please login</div>
                    <a href="/login" className="inline-block px-5 py-2.5 rounded-lg bg-[#EF6A22] text-white hover:opacity-90 transition">Sign In</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#EF6A22] via-[#f59e0b] to-[#f97316] text-white">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
                    <div>
                        <div className="text-sm/none opacity-90">Welcome back</div>
                        <h1 className="text-2xl md:text-3xl font-semibold">Account</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user?.photo || 'https://picsum.photos/100'} alt="avatar" className="w-12 h-12 rounded-full ring-2 ring-white/50 object-cover" />
                        <div className="text-right">
                            <div className="font-medium">{user?.name || 'User'}</div>
                            <div className="text-white/80 text-xs">{user?.emailID || ''}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <aside className="md:col-span-1 bg-white/90 backdrop-blur border border-orange-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user?.photo || 'https://picsum.photos/120'} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-orange-100" />
                            <div className="mt-2 font-medium text-gray-900">{user?.name || 'My Account'}</div>
                            <div className="text-xs text-gray-500">{user?.emailID || ''}</div>
                        </div>
                        <nav className="mt-6 space-y-2">
                            <button onClick={() => setActive(Tabs.PROFILE)} className={`w-full text-left px-3 py-2 rounded-lg border transition ${active === Tabs.PROFILE ? 'border-[#EF6A22] bg-orange-50 text-[#EF6A22]' : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50'}`}>Account Details</button>
                            <button onClick={() => setActive(Tabs.ORDERS)} className={`w-full text-left px-3 py-2 rounded-lg border transition ${active === Tabs.ORDERS ? 'border-[#EF6A22] bg-orange-50 text-[#EF6A22]' : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50'}`}>Order History</button>
                            <button onClick={() => setActive(Tabs.ADDRESSES)} className={`w-full text-left px-3 py-2 rounded-lg border transition ${active === Tabs.ADDRESSES ? 'border-[#EF6A22] bg-orange-50 text-[#EF6A22]' : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50'}`}>Addresses</button>
                            <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition">Sign Out</button>
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="md:col-span-3 bg-white/90 backdrop-blur border border-orange-100 rounded-2xl p-4 md:p-6 shadow-sm">
                        <div className="text-xl font-semibold mb-1 text-gray-900">Account Details</div>
                        <div className="text-sm text-gray-500 mb-4">Manage your profile, orders and addresses</div>

                        {/* Tabs header */}
                        <div className="flex gap-6 border-b border-gray-200">
                            <button onClick={() => setActive(Tabs.PROFILE)} className={`py-3 -mb-px border-b-2 transition ${active === Tabs.PROFILE ? 'border-[#EF6A22] text-[#EF6A22]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>My Profile</button>
                            <button onClick={() => setActive(Tabs.ORDERS)} className={`py-3 -mb-px border-b-2 transition ${active === Tabs.ORDERS ? 'border-[#EF6A22] text-[#EF6A22]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Orders</button>
                            <button onClick={() => setActive(Tabs.ADDRESSES)} className={`py-3 -mb-px border-b-2 transition ${active === Tabs.ADDRESSES ? 'border-[#EF6A22] text-[#EF6A22]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Addresses</button>
                        </div>

                        {/* Tab content */}
                        {active === Tabs.PROFILE && (
                            <section className="mt-6 space-y-6">
                                <div>
                                    <div className="font-medium mb-1 text-gray-900">Personal Info</div>
                                    <div className="text-sm text-gray-500">Update your details here</div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                                        <input className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                                        <input className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Phone Number" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">GSTIN</label>
                                        <input className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="GSTIN" />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={saveProfile} className="px-5 py-2.5 bg-[#EF6A22] text-white rounded-md hover:opacity-90 transition">Save Changes</button>
                                    <button onClick={() => setForm({ name: user?.name || '', phoneNumber: user?.phoneNumber || '', gstin: user?.gstin || '' })} className="px-5 py-2.5 border rounded-md hover:bg-gray-50 transition">Cancel</button>
                                </div>
                            </section>
                        )}

                        {active === Tabs.ORDERS && (
                            <section className="mt-6 space-y-4">
                                {orders.length === 0 && (
                                    <div className="text-gray-500">No orders yet.</div>
                                )}
                                {(() => {
                                    // Group orders by orderID
                                    const groupedOrders = orders.reduce((acc, order) => {
                                        if (!acc[order.orderID]) {
                                            acc[order.orderID] = {
                                                orderID: order.orderID,
                                                orderStatus: order.orderStatus,
                                                createdAt: order.createdAt,
                                                remarks: order.remarks,
                                                items: []
                                            };
                                        }
                                        acc[order.orderID].items.push(order);
                                        return acc;
                                    }, {});

                                    // Convert to array and sort by creation date
                                    const orderGroups = Object.values(groupedOrders).sort((a, b) =>
                                        new Date(b.createdAt) - new Date(a.createdAt)
                                    );

                                    return orderGroups.map((orderGroup) => (
                                        <div key={orderGroup.orderID} className="border rounded-xl p-4 hover:shadow-sm transition bg-white mb-4">
                                            {/* Order Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-medium text-gray-900">Order {orderGroup.orderID}</div>
                                                <div className="text-xs px-2 py-1 rounded-full bg-orange-50 text-[#EF6A22] border border-orange-200">
                                                    {orderGroup.orderStatus}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3">
                                                {new Date(orderGroup.createdAt).toLocaleString()}
                                            </div>

                                            {/* Order Items */}
                                            <div className="space-y-2 mb-3">
                                                {orderGroup.items.map((item, index) => (
                                                    <div key={`${item.orderID}-${item.productID}`} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                            <div className="text-xs text-gray-600">
                                                                Box: {item.boxQty || 0}, Units: {item.units || 0}
                                                                {item.accepted_units !== undefined && item.accepted_units !== item.units && (
                                                                    <span className="ml-2 text-orange-600">
                                                                        (Accepted: {item.accepted_units})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            ₹{((item.pItemPrice || item.productPrice || 0) * (item.units || 0)).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Total */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    Total: ₹{orderGroup.items.reduce((sum, item) =>
                                                        sum + ((item.pItemPrice || item.productPrice || 0) * (item.units || 0)), 0
                                                    ).toFixed(2)}
                                                </div>
                                                <a
                                                    href={`/order-success/order-summary/${orderGroup.orderID}`}
                                                    className="text-xs underline text-[#EF6A22] hover:text-orange-700"
                                                >
                                                    View summary
                                                </a>
                                            </div>

                                            {/* Admin Remarks */}
                                            {orderGroup.remarks && (
                                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="text-xs font-medium text-blue-800 mb-1">Admin Remarks:</div>
                                                    <div className="text-sm text-blue-700 whitespace-pre-wrap">{orderGroup.remarks}</div>
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </section>
                        )}

                        {active === Tabs.ADDRESSES && (
                            <section className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-gray-900">Saved Addresses</div>
                                    <button
                                        onClick={() => router.push('/account/addresses')}
                                        className="px-3 py-2 border rounded-md hover:bg-orange-50 border-orange-200 text-[#EF6A22]"
                                    >
                                        Manage Addresses
                                    </button>
                                </div>
                                {addresses.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-sm mb-4">No addresses saved yet.</div>
                                        <button
                                            onClick={() => router.push('/account/addresses')}
                                            className="px-4 py-2 bg-[#EF6A22] text-white rounded-md hover:opacity-90 transition"
                                        >
                                            Add Your First Address
                                        </button>
                                    </div>
                                )}
                                {addresses.map((a) => (
                                    <div key={a.addressID} className="border rounded-xl p-4 flex items-start justify-between bg-white">
                                        <div className="text-sm text-gray-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="font-medium text-gray-900">{a.name}</div>
                                                {a.isDefault && (
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-600">{a.phone}</div>
                                            <div className="text-gray-600">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</div>
                                            <div className="text-gray-600">{a.city}, {a.state} - {a.pincode}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push('/account/addresses')}
                                                className="px-3 py-1 border rounded-md text-sm hover:bg-orange-50 border-orange-200 text-[#EF6A22]"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}


