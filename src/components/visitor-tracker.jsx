'use client';

import { useEffect, useRef } from 'react';

const VisitorTracker = () => {
    const hasTracked = useRef(false);
    const isTracking = useRef(false);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            return;
        }

        // Prevent duplicate tracking - check multiple safeguards
        if (hasTracked.current || isTracking.current) {
            return;
        }

        // Check sessionStorage with proper error handling
        let alreadyTracked = false;
        try {
            const sessionKey = 'visitor_tracked_session';
            const tracked = window.sessionStorage?.getItem(sessionKey);
            if (tracked === 'true') {
                alreadyTracked = true;
            }
        } catch (e) {
            // sessionStorage might be disabled or unavailable - silently continue
        }

        if (alreadyTracked) {
            return;
        }

        // Mark as tracking immediately to prevent duplicate calls
        hasTracked.current = true;
        isTracking.current = true;

        // Set sessionStorage flag
        try {
            if (window.sessionStorage) {
                window.sessionStorage.setItem('visitor_tracked_session', 'true');
            }
        } catch (e) {
            // Ignore sessionStorage errors
        }

        // Track visitor in background - non-blocking
        const trackVisitor = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';

                const response = await fetch(`${apiBase}/visitors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                    keepalive: true,
                });

                // Mark as completed after successful tracking
                if (response.ok) {
                    isTracking.current = false;
                }
            } catch (error) {
                // Reset tracking flag on error so it can retry
                isTracking.current = false;
                // Silently fail - don't impact user experience
            }
        };

        // Track visitor immediately on mount
        trackVisitor();
    }, []);

    // This component doesn't render anything
    return null;
};

export default VisitorTracker;

