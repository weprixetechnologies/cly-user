'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { setAuthTokens, setUserId } from '@/utils/cookieUtil'

export default function LoginPage() {
    const router = useRouter()
    const [emailID, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
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
            setError(err?.response?.data?.message || err?.message || 'Login failed')
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
                <form onSubmit={onSubmit} className="px-7 pb-7 space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
                    )}
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Email</label>
                        <input
                            type='email'
                            value={emailID}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder='name@example.com'
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm text-gray-600">Password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder='********'
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className="w-full mt-2 inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-[#EF6A22] text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                    >
                        {loading ? 'Logging in…' : 'Login'}
                    </button>
                    <p className="text-md text-gray-500 text-center font-semibold ">Dont Have Account? Click here to <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Sign up</a></p>
                    <div className="text-xs text-gray-500 text-center">By continuing, you agree to our terms and privacy policy.</div>
                </form>
            </div>
        </div>
    )
}


