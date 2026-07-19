'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { setAuthTokens, setUserId } from '../../utils/cookieUtil';
import { syncLocalCartToBackend } from '../../utils/cartService';

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        emailID: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        gstin: ''
    });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('form'); // 'form' | 'otp'
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match'); return;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters'); return;
        }
        if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
            toast.error('Phone number must be exactly 10 digits'); return;
        }

        try {
            setLoading(true);
            // OTP is now sent to phone via SMS
            const otpResponse = await axios.post('/auth/signup/send-otp', {
                emailID: formData.emailID,
                phoneNumber: formData.phoneNumber,
                name: formData.name
            });

            if (otpResponse.data.success) {
                toast.success(`OTP sent to +91 ${formData.phoneNumber}`);
                setStep('otp');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setOtpLoading(true);
            await axios.post('/auth/signup/send-otp', {
                emailID: formData.emailID,
                phoneNumber: formData.phoneNumber,
                name: formData.name
            });
            toast.success(`OTP resent to +91 ${formData.phoneNumber}`);
            setOtp('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP'); return;
        }
        try {
            setVerifying(true);
            const registerResponse = await axios.post('/auth/register/user', {
                name: formData.name,
                emailID: formData.emailID,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                gstin: formData.gstin || null,
                device: navigator.userAgent,
                otp
            });

            if (registerResponse.data.success) {
                const { tokens, user } = registerResponse.data;
                if (tokens?.accessToken && tokens?.refreshToken) {
                    setAuthTokens(tokens.accessToken, tokens.refreshToken);
                    if (user?.uid) {
                        setUserId(user.uid);
                        // Sync guest cart to new account
                        try {
                            await syncLocalCartToBackend(user.uid);
                        } catch (syncError) {
                            console.error('Failed to sync guest cart during registration:', syncError);
                        }
                    }
                    toast.success('Account created! Welcome to Cursive Letters.');
                    router.push('/account');
                } else {
                    toast.success('Account created! Please sign in.');
                    router.push('/login');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setVerifying(false);
        }
    };

    // ─── OTP Step ─────────────────────────────────────────────────────────────
    if (step === 'otp') {
        return (
            <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-[#EF6A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Verify Mobile</h2>
                        <p className="text-sm text-gray-500">
                            OTP sent to <span className="font-semibold text-gray-700">+91 {formData.phoneNumber}</span>
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div className="space-y-2">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter 6-digit OTP</label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            placeholder="••••••"
                            autoFocus
                        />
                    </div>

                    {/* Verify Button */}
                    <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifying || otp.length !== 6}
                        className="w-full py-2.5 rounded-lg text-white font-medium bg-[#EF6A22] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {verifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Verifying…
                            </span>
                        ) : 'Verify & Create Account'}
                    </button>

                    {/* Resend + Back */}
                    <div className="text-center space-y-2 text-sm">
                        <p className="text-gray-500">
                            Didn't receive it?{' '}
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={otpLoading}
                                className="font-medium text-[#EF6A22] hover:opacity-80 disabled:opacity-50"
                            >
                                {otpLoading ? 'Sending…' : 'Resend OTP'}
                            </button>
                        </p>
                        <button
                            type="button"
                            onClick={() => { setStep('form'); setOtp(''); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ← Back to form
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Signup Form Step ─────────────────────────────────────────────────────
    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                <div className="px-7 pt-7 pb-2">
                    <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
                    <p className="text-sm text-gray-500">OTP will be sent to your mobile number</p>
                </div>

                <form className="px-7 pb-7 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Full Name</label>
                        <input
                            name="name" type="text" required
                            placeholder="Your full name"
                            value={formData.name} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Email Address</label>
                        <input
                            name="emailID" type="email" required
                            placeholder="your@email.com"
                            value={formData.emailID} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Mobile Number</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                            <input
                                name="phoneNumber" type="tel" required
                                placeholder="10-digit mobile number"
                                value={formData.phoneNumber} onChange={handleChange}
                                maxLength={10}
                                className="flex-1 rounded-r-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400">OTP will be sent to this number</p>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">GSTIN <span className="text-gray-400">(optional)</span></label>
                        <input
                            name="gstin" type="text"
                            placeholder="GSTIN"
                            value={formData.gstin} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Password</label>
                        <div className="relative">
                            <input
                                name="password" 
                                type={showPassword ? 'text' : 'password'} 
                                required
                                placeholder="Min. 6 characters"
                                value={formData.password} 
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Confirm Password</label>
                        <div className="relative">
                            <input
                                name="confirmPassword" 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                required
                                placeholder="Repeat your password"
                                value={formData.confirmPassword} 
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 py-2.5 rounded-lg text-white font-medium bg-[#EF6A22] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Sending OTP…
                            </span>
                        ) : 'Send OTP'}
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                        Already have an account?{' '}
                        <a href="/login" className="text-[#EF6A22] font-medium hover:opacity-80">Sign in</a>
                    </p>

                    <div className="text-xs text-gray-400 text-center">
                        By continuing, you agree to our terms and privacy policy.
                    </div>
                </form>
            </div>
        </div>
    );
}
