"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '@/utils/axiosInstance';
import { getCookie } from '@/utils/cookieUtil';

export default function AffiliateDashboard() {
    const [me, setMe] = useState(null);
    const [links, setLinks] = useState([]);
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkMsg, setNewLinkMsg] = useState('');

    useEffect(() => {
        const token = getCookie('_at');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [meRes, linksRes, commRes] = await Promise.all([
                axios.get('/affiliate/me'),
                axios.get('/affiliate/links'),
                axios.get('/affiliate/commissions')
            ]);

            if (meRes.data.success) setMe(meRes.data.data);
            if (linksRes.data.success) setLinks(linksRes.data.data);
            if (commRes.data.success) setCommissions(commRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLink = async (e) => {
        e.preventDefault();
        setNewLinkMsg('Generating...');
        try {
            const { data } = await axios.post('/affiliate/links', { target_url: newLinkUrl });
            if (data.success) {
                setNewLinkMsg('Link generated!');
                setNewLinkUrl('');
                fetchData(); // refresh links
            } else {
                setNewLinkMsg(data.message || 'Error generating link');
            }
        } catch (err) {
            setNewLinkMsg('Error generating link');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Affiliate Dashboard...</div>;

    if (me?.status !== 'ACTIVE') {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">Your affiliate account is currently suspended or inactive. Please contact support.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Orders</h3>
                    <p className="text-3xl font-bold">{me.total_orders}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Earned (₹)</h3>
                    <p className="text-3xl font-bold text-green-600">₹{me.total_commission_earned}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Paid (₹)</h3>
                    <p className="text-3xl font-bold text-purple-600">₹{me.total_commission_paid}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Pending (₹)</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        ₹{(parseFloat(me.total_commission_earned) - parseFloat(me.total_commission_paid)).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* General Referral Code */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-2">Your Primary Referral Link</h2>
                <p className="text-gray-600 mb-4">Share this link to direct users to the home page with your referral code automatically applied.</p>
                <div className="flex flex-col md:flex-row gap-2 items-center">
                    <input
                        type="text"
                        readOnly
                        value={`https://cursiveletters.in/r/${me.referral_code}`}
                        className="flex-1 border p-2 rounded bg-gray-50 font-mono text-sm w-full"
                    />
                    <button
                        onClick={() => navigator.clipboard.writeText(`https://cursiveletters.in/r/${me.referral_code}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded whitespace-nowrap"
                    >
                        Copy Link
                    </button>
                </div>
            </div>

            {/* Custom Link Generator */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Generate Custom Product Link</h2>
                <form onSubmit={handleCreateLink} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold mb-1">Target URL (e.g. /product/some-item)</label>
                        <input
                            type="text"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="https://yourstore.com/product/..."
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700">
                        Generate
                    </button>
                </form>
                {newLinkMsg && <p className="mt-2 text-sm text-blue-600">{newLinkMsg}</p>}

                {/* Generated Links List */}
                {links.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Your Generated Links</h3>
                        <ul className="space-y-2">
                            {links.map(link => (
                                <li key={link.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded border">
                                    <div className="truncate flex-1 mb-2 md:mb-0 pr-4">
                                        <span className="font-mono text-sm text-blue-600">https://cursiveletters.in/r/{link.slug}</span>
                                        <div className="text-xs text-gray-500 truncate" title={link.target_url}>Target: {link.target_url}</div>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-600 whitespace-nowrap">
                                        <span>Clicks: {link.clicks}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`https://cursiveletters.in/r/${link.slug}`)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Commissions History */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Commission History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Order ID</th>
                                <th className="px-4 py-2 text-left">Order Value</th>
                                <th className="px-4 py-2 text-left">Commission</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.map(c => (
                                <tr key={c.id} className="border-t">
                                    <td className="px-4 py-2">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{c.orderID}</td>
                                    <td className="px-4 py-2">₹{c.order_amount}</td>
                                    <td className="px-4 py-2 font-bold text-green-600">₹{c.commission_amount}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs text-white ${c.status === 'APPROVED' ? 'bg-green-500' :
                                                c.status === 'PAID' ? 'bg-blue-500' :
                                                    c.status === 'VOIDED' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {commissions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-gray-500">No commissions yet. Start sharing your links!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
