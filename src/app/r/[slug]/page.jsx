"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/utils/axiosInstance';
import { setCookie } from '@/utils/cookieUtil';

export default function ReferralRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    useEffect(() => {
        if (!slug) return;

        const resolveLink = async () => {
            try {
                // Call the backend to increment clicks and resolve the link data
                const response = await axios.get(`/affiliate/resolve/${slug}`);
                if (response.data.success) {
                    const data = response.data.data;
                    
                    // Silently store the referral attribution data in cookies
                    // We store it for 30 days so any purchase/signup in this window gets attributed
                    if (data.affiliate_link_id) {
                        setCookie('_affiliate_link_id', data.affiliate_link_id, { maxAge: 2592000 });
                    }
                    setCookie('_affiliate_id', data.affiliate_id, { maxAge: 2592000 });
                    
                    console.log('[Referral] Stored affiliate cookies:', {
                        affiliate_link_id: data.affiliate_link_id,
                        affiliate_id: data.affiliate_id,
                    });

                    // Redirect to the target URL or homepage if null
                    const targetUrl = data.target_url || '/';
                    
                    // Check if it's an absolute URL
                    if (targetUrl.startsWith('http')) {
                        window.location.href = targetUrl;
                    } else {
                        router.push(targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`);
                    }
                } else {
                    // Fallback to homepage if link is inactive/not found
                    router.push('/');
                }
            } catch (error) {
                console.error("Error resolving affiliate link:", error);
                // Fail gracefully to homepage
                router.push('/');
            }
        };

        resolveLink();
    }, [slug, router]);

    return (
        <div className="min-h-screen grid place-items-center bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF6A22] mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Taking you there...</p>
            </div>
        </div>
    );
}
