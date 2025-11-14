'use client';

import { useEffect } from 'react';

const VisitorTracker = () => {
    useEffect(() => {
        // Track visitor in background - non-blocking
        const trackVisitor = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';
                // Use fetch with keepalive for better performance - doesn't block page unload
                fetch(`${apiBase}/visitors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                    keepalive: true,
                }).catch(() => {
                    // Silently fail - don't impact user experience
                });
            } catch (error) {
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

