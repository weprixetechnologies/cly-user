'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearAuthTokens } from '@/utils/cookieUtil';
import { setLoggedOut } from '@/redux/slices/authSlice';

export default function LogoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear all authentication cookies
        clearAuthTokens();

        // Update Redux state
        dispatch(setLoggedOut());

        // Redirect to login page
        router.push('/login');
    }, [router, dispatch]);

    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
            <div className="text-center">
                <div className="text-gray-700 mb-4">Signing you out...</div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF6A22] mx-auto"></div>
            </div>
        </div>
    );
}
