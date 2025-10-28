'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { setAuthTokens, setUserId } from '@/utils/cookieUtil'
import { toast } from 'react-toastify'

export default function LoginPage() {
    const router = useRouter()
    const [emailID, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Clear error when user starts typing
    // useEffect(() => {
    //     if (error) {
    //         setError('')
    //     }
    // }, [emailID, password])

    // Debug: Log error state changes
    useEffect(() => {
        console.log('Error state changed:', error)
    }, [error])




    const handleLogin = async (e) => {
        e?.preventDefault?.()
        e?.stopPropagation?.()

        if (loading) return

        // Basic validation
        if (!emailID.trim()) {
            setError('Please enter your email address')
            return
        }

        if (!password.trim()) {
            setError('Please enter your password')
            return
        }

        setError('')
        setLoading(true)

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://72.60.219.181:3300/api';
            console.log('Attempting login with:', { emailID: emailID.trim(), device: 'web' });

            const response = await fetch(`${apiBase}/auth/login/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailID: emailID.trim(),
                    password,
                    device: 'web',
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

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

            console.log('Extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, uid });

            if (!accessToken || !refreshToken || !uid) {
                console.log('Missing required fields:', { accessToken: !!accessToken, refreshToken: !!refreshToken, uid });
                throw new Error('Invalid response from server')
            }

            // Set authentication tokens and user ID as cookies
            console.log('Setting auth tokens and redirecting...');
            setAuthTokens(accessToken, refreshToken)
            setUserId(uid)

            // Clear any existing errors and show success
            setError('')
            toast.success('Login successful! Redirecting...')

            // Small delay to show success message
            setTimeout(() => {
                router.push('/account')
            }, 500)

        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed'
            console.log('Login error:', errorMessage)

            // Handle specific error cases
            if (errorMessage.includes('pending approval') || errorMessage.includes('pending admin approval')) {
                const errorText = '⏳ Your account is pending approval. Please wait for admin approval before logging in.'
                console.log('Setting error:', errorText)
                setError(errorText)
                console.log('Error state after setError:', errorText)
                toast.error('Account pending approval. Please wait for admin approval.')
                setPassword('')
            } else if (errorMessage.includes('rejected')) {
                const errorText = '❌ Your account has been rejected. Please contact support for assistance.'
                console.log('Setting error:', errorText)
                setError(errorText)
                console.log('Error state after setError:', errorText)
                toast.error('Account rejected. Please contact support.')
                setPassword('')
            } else if (errorMessage.includes('Invalid email or password')) {
                const errorText = '❌ Invalid email or password. Please check your credentials and try again.'
                console.log('Setting error:', errorText)
                setError(errorText)
                console.log('Error state after setError:', errorText)
                toast.error('Invalid email or password')
                setPassword('')
            } else {
                const errorText = `❌ ${errorMessage}`
                console.log('Setting error:', errorText)
                setError(errorText)
                console.log('Error state after setError:', errorText)
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

    // Test function to check error display
    // const testError = () => {
    //     console.log('Test error button clicked')
    //     setError('This is a test error message to check if error display works')
    //     console.log('Error state set to:', 'This is a test error message to check if error display works')
    // }

    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                {/* Header */}
                <div className="px-7 pt-7 pb-2">
                    <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500">Sign in to continue</p>
                </div>

                {/* Login Container */}
                <div className="px-7 pb-7 space-y-4">
                    {/* Test Button - Remove after testing */}

                    {/* Error Message */}
                    {error && (
                        <div className={`text-sm rounded-lg px-4 py-3 border ${error.includes('pending approval')
                            ? 'text-amber-800 bg-amber-50 border-amber-300 shadow-md'
                            : error.includes('rejected')
                                ? 'text-red-800 bg-red-50 border-red-300 shadow-md'
                                : 'text-red-800 bg-red-50 border-red-300 shadow-md'
                            }`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {error.includes('pending approval') ? (
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-base">{error}</p>
                                    {error.includes('pending approval') && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-amber-700">
                                                You will receive an email notification once your account is approved.
                                            </p>
                                            <p className="text-xs text-amber-600 font-medium">
                                                Please do not attempt to login until you receive approval confirmation.
                                            </p>
                                        </div>
                                    )}
                                    {error.includes('rejected') && (
                                        <p className="text-xs text-red-700 mt-1">
                                            If you believe this is an error, please contact our support team.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Email Address</label>
                        <input
                            value={emailID}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='Enter your email address'
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='Enter your password'
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
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
                            return false
                        }}
                        className={`w-full mt-2 inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-white font-medium transition ${loading
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