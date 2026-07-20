'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import StarRating from './StarRating';
import SiteReviewForm from './SiteReviewForm';

/**
 * Homepage "What our customers say" section.
 *
 * - Fetches approved website reviews and shows them in an auto-scrolling carousel.
 * - Lets any visitor submit a new review (goes to admin moderation first).
 */
export default function SiteReviewsSection() {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ total: 0, avgRating: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const scrollerRef = useRef(null);
    const autoScrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const loadReviews = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/site-reviews?limit=20');
            if (res.data?.success) {
                setReviews(res.data.data || []);
                setSummary(res.data.summary || { total: 0, avgRating: 0 });
            }
        } catch (_) {
            // Silent — section simply hides if nothing loads.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // Auto-scroll the carousel horizontally.
    useEffect(() => {
        if (reviews.length <= 1) return;
        const el = scrollerRef.current;
        if (!el) return;

        autoScrollRef.current = setInterval(() => {
            if (isHovered) return;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
            if (atEnd) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: 320, behavior: 'smooth' });
            }
        }, 3500);

        return () => clearInterval(autoScrollRef.current);
    }, [reviews.length, isHovered]);

    const scrollBy = (dir) => {
        scrollerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };

    // Hide the whole section while loading and if there is nothing to show and
    // the form isn't open — but always allow opening the form.
    const hasReviews = reviews.length > 0;

    return (
        <section
            className="md:px-15 px-4 mt-12"
            aria-label="Customer reviews"
        >
            <div className="mt-10">
                <p className="text-sm text-center">Loved by our customers</p>
                <p className="text-2xl text-center">What People Say About Us</p>
            </div>

            {/* Rating summary */}
            {summary.total > 0 && (
                <div className="flex items-center justify-center gap-3 mt-3">
                    <StarRating value={Math.round(summary.avgRating)} readOnly size={20} />
                    <span className="text-sm text-gray-600">
                        <strong className="text-gray-900">{Number(summary.avgRating).toFixed(1)}</strong> out of 5
                        <span className="text-gray-400"> · {summary.total} review{summary.total > 1 ? 's' : ''}</span>
                    </span>
                </div>
            )}

            {/* Carousel */}
            {hasReviews && (
                <div className="relative mt-6">
                    {reviews.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => scrollBy(-1)}
                                aria-label="Previous reviews"
                                className="hidden md:grid place-items-center absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-[#EF6A22]"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollBy(1)}
                                aria-label="Next reviews"
                                className="hidden md:grid place-items-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-[#EF6A22]"
                            >
                                ›
                            </button>
                        </>
                    )}

                    <div
                        ref={scrollerRef}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {reviews.map((r) => (
                            <article
                                key={r.id}
                                className="shrink-0 w-[300px] bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
                            >
                                <StarRating value={r.rating} readOnly size={18} />
                                {r.comment && (
                                    <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-5 flex-1">
                                        “{r.comment}”
                                    </p>
                                )}
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#EF6A22]/10 text-[#EF6A22] grid place-items-center font-semibold text-sm uppercase">
                                        {(r.name || '?').charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                                        <div className="text-xs text-gray-400">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA + inline form */}
            <div className="mt-6 flex flex-col items-center">
                {!showForm ? (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="bg-[#EF6A22] text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-[#d85d1c] transition"
                    >
                        Write a Review
                    </button>
                ) : (
                    <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">Share your experience</h3>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                aria-label="Close"
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <SiteReviewForm
                            onSuccess={() => {
                                setShowForm(false);
                                loadReviews();
                            }}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
