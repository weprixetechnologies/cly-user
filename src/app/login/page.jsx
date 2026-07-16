'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { setAuthTokens, setUserId } from '@/utils/cookieUtil'
import { toast } from 'react-toastify'
import { syncLocalCartToBackend } from '@/utils/cartService'

export default function LoginPage() {
    const router = useRouter()
    const [loginType, setLoginType] = useState('phone') // 'phone' | 'email'
    const [phoneNumber, setPhoneNumber] = useState('')
    const [emailID, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Clear error when user changes tab or input
    useEffect(() => {
        setError('')
    }, [loginType, phoneNumber, emailID, password])

    const handleLogin = async (e) => {
        e?.preventDefault?.()
        e?.stopPropagation?.()

        if (loading) return

        // Basic validation
        if (loginType === 'phone') {
            const digits = phoneNumber.replace(/\D/g, '')
            if (!digits) {
                setError('Please enter your phone number')
                return
            }
            if (digits.length !== 10) {
                setError('Phone number must be exactly 10 digits')
                return
            }
        } else {
            if (!emailID.trim()) {
                setError('Please enter your email address')
                return
            }
        }

        if (!password.trim()) {
            setError('Please enter your password')
            return
        }

        setError('')
        setLoading(true)

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';
            const payload = {
                password,
                device: 'web'
            }

            if (loginType === 'phone') {
                payload.phoneNumber = phoneNumber.replace(/\D/g, '')
            } else {
                payload.emailID = emailID.trim()
            }

            console.log('Attempting login with:', payload);

            const response = await fetch(`${apiBase}/auth/login/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData);
                throw { response: { data: errorData } };
            }

            const data = await response.json();
            console.log('Success response:', data);

            const accessToken = data?.tokens?.accessToken
            const refreshToken = data?.tokens?.refreshToken
            const uid = data?.user?.uid

            if (!accessToken || !refreshToken || !uid) {
                throw new Error('Invalid response from server')
            }

            // Set cookies
            setAuthTokens(accessToken, refreshToken)
            setUserId(uid)

            setError('')
            toast.success('Login successful! Redirecting...')

            // Sync guest cart
            try {
                await syncLocalCartToBackend(uid);
            } catch (syncError) {
                console.error('Failed to sync guest cart during login:', syncError);
            }

            setTimeout(() => {
                router.push('/account')
            }, 500)

        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed'
            console.log('Login error:', errorMessage)

            if (errorMessage.includes('pending approval') || errorMessage.includes('pending admin approval')) {
                setError('⏳ Your account is pending approval. Please wait for admin approval before logging in.')
                toast.error('Account pending approval. Please wait for admin approval.')
                setPassword('')
            } else if (errorMessage.includes('rejected')) {
                setError('❌ Your account has been rejected. Please contact support for assistance.')
                toast.error('Account rejected. Please contact support.')
                setPassword('')
            } else if (errorMessage.includes('Invalid') || errorMessage.includes('password')) {
                setError('❌ Invalid credentials. Please check details and try again.')
                toast.error('Invalid phone/email or password')
                setPassword('')
            } else {
                setError(`❌ ${errorMessage}`)
                toast.error(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            handleLogin(e)
        }
    }

    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                {/* Header */}
                <div className="px-7 pt-7 pb-2">
                    <h1 className="text-2xl font-semibold text-gray-900 font-sans">Welcome back</h1>
                    <p className="text-sm text-gray-500">Sign in to continue to Cursive Letters</p>
                </div>

                {/* Tabbed Toggle Control */}
                <div className="px-7 pt-2">
                    <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setLoginType('phone')}
                            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition ${loginType === 'phone'
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            📱 Mobile Number
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType('email')}
                            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition ${loginType === 'email'
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            ✉️ Email Address
                        </button>
                    </div>
                </div>

                {/* Login Form Container */}
                <div className="px-7 pb-7 pt-4 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="text-sm rounded-lg px-4 py-3 border text-red-800 bg-red-50 border-red-300 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-base">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conditional Input based on Active Tab */}
                    {loginType === 'phone' ? (
                        <div className="space-y-1">
                            <label className="block text-sm text-gray-600">Mobile Number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-sans">+91</span>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    onKeyPress={handleKeyPress}
                                    placeholder="10-digit mobile number"
                                    className="flex-1 rounded-r-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none font-sans"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <label className="block text-sm text-gray-600">Email Address</label>
                            <input
                                type="email"
                                value={emailID}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter your email address"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none font-sans"
                            />
                        </div>
                    )}

                    {/* Password Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none font-sans"
                        />
                    </div>

                    {/* Login Button */}
                    <div
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!loading) {
                                handleLogin(e)
                            }
                        }}
                        className={`w-full mt-2 inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-white font-medium transition select-none ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#EF6A22] hover:opacity-90 cursor-pointer'
                            }`}
                    >
                        {loading ? 'Logging in…' : 'Login'}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                        <a
                            href="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Forgot your password?
                        </a>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-md text-gray-500 text-center font-semibold">
                        Don't have an account? Click here to{' '}
                        <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                            Sign up
                        </a>
                    </p>

                    {/* Terms */}
                    <div className="text-xs text-gray-500 text-center">
                        By continuing, you agree to our terms and privacy policy.
                    </div>
                </div>
            </div>
        </div>
    )
}