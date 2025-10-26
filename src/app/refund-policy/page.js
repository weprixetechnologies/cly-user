'use client'

import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { ClipLoader } from 'react-spinners';

const RefundPolicyPage = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPolicy();
    }, []);

    const fetchPolicy = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/policies/type/refund_policy');
            setPolicy(response.data.data);
        } catch (error) {
            console.error('Error fetching refund policy:', error);
            setError('Failed to load refund policy');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <ClipLoader color="#10B981" size={50} />
                    <p className="mt-4 text-gray-600">Loading refund policy...</p>
                </div>
            </div>
        );
    }

    if (error || !policy) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Not Available</h2>
                        <p className="text-gray-600 mb-4">
                            {error || 'Refund policy is not available at the moment.'}
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="max-w-[90%] mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{policy.title}</h1>
                                <p className="text-green-100 text-lg">Version {policy.version}</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-green-100 bg-opacity-80 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-12">
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="rich-text-content text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: policy.content }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="text-sm text-gray-500 mb-4 md:mb-0">
                                    Last updated: {new Date(policy.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        <span>Print</span>
                                    </button>
                                    <button
                                        onClick={() => window.history.back()}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        <span>Go Back</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
