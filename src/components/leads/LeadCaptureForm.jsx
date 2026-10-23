'use client';

import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCommentDots, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

export default function LeadCaptureForm({
    source = 'floating_form',
    variant = 'compact', // 'compact' | 'card'
    onSuccess,
    title,
    subtitle
}) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        requirement: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Please enter your name.';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        }

        const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, '');
        if (!formData.phone.trim()) {
            newErrors.phone = 'Please enter your phone number.';
        } else if (!/^\+?[0-9]{7,15}$/.test(phoneClean)) {
            newErrors.phone = 'Please enter a valid phone number (7-15 digits).';
        }

        if (!formData.requirement.trim()) {
            newErrors.requirement = 'Please describe your requirement.';
        } else if (formData.requirement.trim().length < 3) {
            newErrors.requirement = 'Please provide a little more detail.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const res = await axiosInstance.post('/leads', {
                name: formData.name,
                phone: formData.phone,
                address: formData.address || undefined,
                requirement: formData.requirement,
                source
            });

            if (res.data?.success) {
                setSubmitted(true);
                toast.success('Inquiry submitted successfully!');
                if (onSuccess) onSuccess(res.data);
            } else {
                toast.error(res.data?.message || 'Failed to submit inquiry.');
            }
        } catch (err) {
            console.error('Lead submission error:', err);
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: '', phone: '', address: '', requirement: '' });
        setErrors({});
        setSubmitted(false);
    };

    const isCard = variant === 'card';

    if (submitted) {
        return (
            <div className={`flex flex-col items-center justify-center text-center ${isCard ? 'p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100' : 'p-6 py-8'}`}>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce">
                    <FaCheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 text-sm md:text-base max-w-sm mb-6 leading-relaxed">
                    We have received your requirement. Our representative will contact you shortly on WhatsApp or phone.
                </p>
                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs md:text-sm font-medium rounded-lg hover:from-black hover:to-gray-900 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    Submit Another Request
                </button>
            </div>
        );
    }

    return (
        <div className={isCard ? 'bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 md:p-10' : 'p-4'}>
            {(title || subtitle) && (
                <div className="mb-5 text-left">
                    {title && <h3 className={`font-bold text-gray-900 ${isCard ? 'text-2xl md:text-3xl' : 'text-lg'}`}>{title}</h3>}
                    {subtitle && <p className="text-gray-500 text-xs md:text-sm mt-1">{subtitle}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <FaUser className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            disabled={loading}
                            className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                errors.name
                                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                            }`}
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Phone / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <FaPhoneAlt className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            disabled={loading}
                            className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                errors.phone
                                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                            }`}
                        />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>

                {/* Address (Optional) */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Address / City
                        </label>
                        <span className="text-[11px] text-gray-400 font-medium">(Optional)</span>
                    </div>
                    <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <FaMapMarkerAlt className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai, Maharashtra"
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-gray-900 transition-all"
                        />
                    </div>
                </div>

                {/* Requirement */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Requirement <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                        <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400">
                            <FaCommentDots className="w-3.5 h-3.5" />
                        </div>
                        <textarea
                            name="requirement"
                            rows={isCard ? 4 : 3}
                            value={formData.requirement}
                            onChange={handleChange}
                            placeholder="Tell us what items, quantities, or customization you are interested in..."
                            disabled={loading}
                            className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all resize-none ${
                                errors.requirement
                                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                            }`}
                        />
                    </div>
                    {errors.requirement && <p className="mt-1 text-xs text-rose-500">{errors.requirement}</p>}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <ClipLoader size={16} color="#ffffff" />
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <>
                            <FaPaperPlane className="w-3.5 h-3.5" />
                            <span>Submit Inquiry</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
