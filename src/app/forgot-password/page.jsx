'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(false)

    // Flow steps: 'phone' (enter phone) | 'otp' (enter OTP and new password)
    const [step, setStep] = useState('phone')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [resolvedEmail, setResolvedEmail] = useState('')
    const [maskedPhone, setMaskedPhone] = useState('')

    // Step 1: Request OTP via Phone number
    const handleRequestOTP = async (e) => {
        e.preventDefault()

        const digits = phoneNumber.replace(/\D/g, '')
        if (!digits || digits.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number')
            return
        }

        setLoading(true)

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api'

            const response = await fetch(`${apiBase}/password-reset/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: digits })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Password reset OTP sent to your phone!')
                setResolvedEmail(data.email || '')
                setMaskedPhone(data.maskedPhone || `+91 xxxxxx${digits.slice(-4)}`)
                setStep('otp')
            } else {
                toast.error(data.message || 'Failed to request reset OTP')
            }
        } catch (error) {
            console.error('Request reset OTP error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP')
            return
        }

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setVerifying(true)

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api'

            const response = await fetch(`${apiBase}/password-reset/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resolvedEmail || null,
                    phoneNumber: phoneNumber.replace(/\D/g, ''),
                    otp,
                    newPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Password reset successfully!')
                setTimeout(() => {
                    router.push('/login')
                }, 1000)
            } else {
                toast.error(data.message || 'Failed to reset password')
            }
        } catch (error) {
            console.error('OTP Reset verification error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setVerifying(false)
        }
    }

    // ─── Step 2: OTP Verification & New Password ────────────────────────────
    if (step === 'otp') {
        return (
            <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-[#EF6A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Reset Password</h2>
                        <p className="text-sm text-gray-500">
                            OTP sent to <span className="font-semibold text-gray-700">{maskedPhone}</span>
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {/* OTP Input */}
                        <div className="space-y-1">
                            <label className="block text-sm text-gray-600">6-Digit OTP</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-xl tracking-[0.3em] font-mono focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                                placeholder="••••••"
                                required
                                autoFocus
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-1">
                            <label className="block text-sm text-gray-600">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="block text-sm text-gray-600">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full py-2.5 rounded-lg text-white font-medium bg-[#EF6A22] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {verifying ? 'Resetting Password…' : 'Reset Password'}
                        </button>
                    </form>

                    {/* Back Option */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => { setStep('phone'); setOtp(''); }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            ← Back to enter phone number
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Step 1: Phone Search ────────────────────────────────────────────────
    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-1">
                    <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-[#EF6A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Forgot Password?</h1>
                    <p className="text-sm text-gray-500">
                        Enter your registered mobile number below to receive a password reset OTP.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRequestOTP} className="space-y-4">
                    {/* Phone Number Input */}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Mobile Number</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-sans">+91</span>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="10-digit mobile number"
                                className="flex-1 rounded-r-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none font-sans"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg text-white font-medium bg-[#EF6A22] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending OTP…' : 'Send Reset OTP'}
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                        <Link href="/login" className="text-sm text-[#EF6A22] hover:opacity-80 font-medium">
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
