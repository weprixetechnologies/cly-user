'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosInstance';
import { useUser } from '@/hooks/useUser';
import StarRating from './StarRating';

/**
 * Website / experience review form.
 *
 * - Logged-in users: name + email are auto-filled from their profile and the
 *   name/email inputs are hidden (we don't ask again).
 * - Guests: name is required, email is optional.
 *
 * On success, calls onSuccess() so parents (modal / section) can react.
 */
export default function SiteReviewForm({ onSuccess, compact = false }) {
    const { user, isAuthenticated } = useUser();

    const [rating, setRating] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating < 1) {
            toast.error('Please select a star rating.');
            return;
        }

        // Logged-in users submit with their profile name/email; guests type it.
        const payloadName = isAuthenticated ? (user?.name || '').trim() : name.trim();
        const payloadEmail = isAuthenticated ? (user?.emailID || '') : email.trim();

        if (!payloadName) {
            toast.error('Please enter your name.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await axiosInstance.post('/site-reviews', {
                rating,
                name: payloadName,
                email: payloadEmail || undefined,
                comment: comment.trim() || undefined,
            });

            if (res.data?.success) {
                toast.success(res.data.message || 'Thank you for your feedback!');
                setRating(0);
                setName('');
                setEmail('');
                setComment('');
                onSuccess?.();
            } else {
                toast.error(res.data?.message || 'Failed to submit review.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-600">How would you rate your experience?</span>
                <StarRating value={rating} onChange={setRating} size={compact ? 32 : 36} />
            </div>

            {!isAuthenticated && (
                <div className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2'}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name *"
                        maxLength={120}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                        maxLength={255}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                    />
                </div>
            )}

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience (optional)"
                rows={compact ? 3 : 4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent resize-none"
            />

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#EF6A22] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#d85d1c] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
        </form>
    );
}
