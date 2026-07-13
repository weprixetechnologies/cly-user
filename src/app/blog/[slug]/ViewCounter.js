'use client'

import { useEffect } from 'react';

export default function ViewCounter({ slug }) {
    useEffect(() => {
        if (!slug) return;
        
        const incrementView = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api';
                await fetch(`${apiBase}/blog/posts/${slug}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err) {
                console.error('Failed to increment blog post view count:', err);
            }
        };

        // Increment view count on mount
        incrementView();
    }, [slug]);

    return null;
}
