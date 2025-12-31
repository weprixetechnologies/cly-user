'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error('Please enter your email address')
            return
        }

        setLoading(true)

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api'

            const response = await fetch(`${apiBase}/password-reset/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
                toast.success('Password reset link sent to your email!')
            } else {
                toast.error(data.message || 'Failed to send reset link')
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                    {/* Success Header */}
                    <div className="px-7 pt-7 pb-2">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 text-center">Check Your Email</h1>
                        <p className="text-sm text-gray-500 text-center mt-2">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                    </div>

                    {/* Success Content */}
                    <div className="px-7 pb-7 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">What's next?</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Check your email inbox (and spam folder)</li>
                                        <li>• Click the reset link in the email</li>
                                        <li>• Create a new password</li>
                                        <li>• The link expires in 1 hour</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <p className="text-sm text-gray-600">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>

                            <button
                                onClick={() => {
                                    setSuccess(false)
                                    setEmail('')
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Try a different email
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href="/login"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                {/* Header */}
                <div className="px-7 pt-7 pb-2">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 text-center">Forgot Password?</h1>
                    <p className="text-sm text-gray-500 text-center mt-2">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-2 inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-white font-medium transition ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#EF6A22] hover:opacity-90 cursor-pointer'
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Help Text */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-gray-700">
                                <p className="font-semibold mb-1">Need help?</p>
                                <p className="text-xs">
                                    If you don't receive an email within a few minutes, check your spam folder or contact our support team.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}









