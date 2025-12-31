'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

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
    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // For phone number, only allow digits and limit to 10 characters
        if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({
                ...formData,
                [name]: numericValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        // Mobile number validation - must be exactly 10 digits
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }

        try {
            setLoading(true);
            // Step 1: Send OTP to email
            const otpResponse = await axios.post('/auth/signup/send-otp', {
                emailID: formData.emailID,
                name: formData.name
            });

            if (otpResponse.data.success) {
                toast.success('OTP sent to your email! Please check your inbox.');
                setStep('otp');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setOtpLoading(true);
            const response = await axios.post('/auth/signup/send-otp', {
                emailID: formData.emailID,
                name: formData.name
            });

            if (response.data.success) {
                toast.success('OTP resent to your email!');
                setOtp(''); // Clear the OTP input
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resend OTP';
            toast.error(message);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setVerifying(true);
            // Verify OTP and register user in one call
            const registerResponse = await axios.post('/auth/register/user', {
                name: formData.name,
                emailID: formData.emailID,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                gstin: formData.gstin || null,
                device: navigator.userAgent,
                otp: otp
            });

            if (registerResponse.data.success) {
                toast.success('Account created successfully! Please wait for admin approval.');
                router.push('/login');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setVerifying(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
    };

    // OTP Verification Step
    if (step === 'otp') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Verify Your Email
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            We've sent a 6-digit OTP to <strong>{formData.emailID}</strong>
                        </p>
                    </div>
                    <div className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                required
                                value={otp}
                                onChange={handleOtpChange}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest font-mono"
                                placeholder="000000"
                                autoFocus
                            />
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={verifying || otp.length !== 6}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifying ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </button>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Didn't receive the OTP?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={otpLoading}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                                >
                                    {otpLoading ? 'Sending...' : 'Resend OTP'}
                                </button>
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('form');
                                    setOtp('');
                                }}
                                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                            >
                                ← Back to form
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Signup Form Step
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Your account will be reviewed by admin before activation
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="emailID" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="emailID"
                                name="emailID"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.emailID}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="sr-only">
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="gstin" className="sr-only">
                                GSTIN 
                            </label>
                            <input
                                id="gstin"
                                name="gstin"
                                type="text"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="GSTIN"
                                value={formData.gstin}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending OTP...
                                </div>
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
