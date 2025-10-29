'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const [email, setEmail] = useState('')

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link')
            router.push('/forgot-password')
            return
        }

        verifyToken()
    }, [token])

    const verifyToken = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://72.60.219.181:8800/api'

            const response = await fetch(`${apiBase}/password-reset/verify/${token}`)
            const data = await response.json()

            if (data.success) {
                setTokenValid(true)
                setEmail(data.data.email)
            } else {
                toast.error(data.message || 'Invalid or expired reset link')
                router.push('/forgot-password')
            }
        } catch (error) {
            console.error('Token verification error:', error)
            toast.error('Failed to verify reset link')
            router.push('/forgot-password')
        } finally {
            setVerifying(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!password.trim()) {
            toast.error('Please enter a new password')
            return
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://72.60.219.181:8800/api'

            const response = await fetch(`${apiBase}/password-reset/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: password
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Password reset successfully! You can now login with your new password.')
                router.push('/login')
            } else {
                toast.error(data.message || 'Failed to reset password')
            }
        } catch (error) {
            console.error('Reset password error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                    <div className="px-7 pt-7 pb-7 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h1>
                        <p className="text-sm text-gray-500">Please wait while we verify your reset link...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!tokenValid) {
        return (
            <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                    <div className="px-7 pt-7 pb-7 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            This reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link
                            href="/forgot-password"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            Request New Reset Link
                        </Link>
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
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 text-center">Reset Your Password</h1>
                    <p className="text-sm text-gray-500 text-center mt-2">
                        Create a new password for <strong>{email}</strong>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-4">
                    {/* New Password Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your new password"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-xs text-blue-800">
                                <p className="font-semibold mb-1">Password Requirements:</p>
                                <ul className="space-y-0.5">
                                    <li>• At least 6 characters long</li>
                                    <li>• Use a combination of letters and numbers</li>
                                    <li>• Avoid common passwords</li>
                                </ul>
                            </div>
                        </div>
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
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
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
                </form>
            </div>
        </div>
    )
}

// Loading component for Suspense fallback
function ResetPasswordLoading() {
    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                <div className="px-7 pt-7 pb-7 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h1>
                    <p className="text-sm text-gray-500">Please wait while we load the reset page...</p>
                </div>
            </div>
        </div>
    )
}

// Main component with Suspense wrapper
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordContent />
        </Suspense>
    )
}
