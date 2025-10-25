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
    useEffect(() => {
        if (error) {
            setError('')
        }
    }, [emailID, password])

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit(e)
        }
    }

    const onSubmit = async (e) => {
        e?.preventDefault?.()
        if (loading) return
        setError('')
        setLoading(true)
        try {
            const { data } = await api.post('/auth/login/user', { emailID, password, device: 'web' })
            const accessToken = data?.tokens?.accessToken
            const refreshToken = data?.tokens?.refreshToken
            const uid = data?.user?.uid

            if (!accessToken || !refreshToken || !uid) throw new Error('Invalid response from server')

            // Set authentication tokens and user ID as cookies
            setAuthTokens(accessToken, refreshToken)
            setUserId(uid)
            router.push('/account')
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed'

            // Handle approval pending specifically
            if (errorMessage.includes('pending approval') || errorMessage.includes('pending admin approval')) {
                setError('⏳ Your account is pending approval. Please wait for admin approval before logging in.')
                toast.error('Account pending approval. Please wait for admin approval.')
                // Clear password field to prevent saving
                setPassword('')
            } else if (errorMessage.includes('rejected')) {
                setError('❌ Your account has been rejected. Please contact support for assistance.')
                toast.error('Account rejected. Please contact support.')
                // Clear password field to prevent saving
                setPassword('')
            } else {
                setError(errorMessage)
                toast.error(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-10">
            <div className="w-full max-w-md bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm">
                <div className="px-7 pt-7 pb-2">
                    <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500">Sign in to continue</p>
                </div>
                <div className="px-7 pb-7 space-y-4">
                    {error && (
                        <div className={`text-sm rounded-lg px-4 py-3 border animate-pulse ${error.includes('pending approval')
                            ? 'text-amber-800 bg-amber-50 border-amber-300 shadow-md'
                            : error.includes('rejected')
                                ? 'text-red-800 bg-red-50 border-red-300 shadow-md'
                                : 'text-red-600 bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {error.includes('pending approval') ? (
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : error.includes('rejected') ? (
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Email</label>
                        <input
                            type='text'
                            value={emailID}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            required
                            placeholder='name@example.com'
                            autoComplete="off"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            required
                            placeholder='********'
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading}
                        className="w-full mt-2 inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-[#EF6A22] text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                    >
                        {loading ? 'Logging in…' : 'Login'}
                    </button>
                    <p className="text-md text-gray-500 text-center font-semibold ">Dont Have Account? Click here to <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Sign up</a></p>
                    <div className="text-xs text-gray-500 text-center">By continuing, you agree to our terms and privacy policy.</div>
                </div>
            </div>
        </div>
    )
}


