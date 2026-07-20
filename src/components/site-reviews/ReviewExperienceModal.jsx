'use client';

import { useEffect, useState } from 'react';
import SiteReviewForm from './SiteReviewForm';

/**
 * "Review your experience" modal.
 *
 * Shown after an order is successfully placed. Submits a website/experience
 * review (goes to admin moderation before appearing in the homepage carousel).
 *
 * Controlled via the `open` prop; `onClose` fires on backdrop click, the close
 * button, or after a successful submission.
 */
export default function ReviewExperienceModal({ open, onClose }) {
    const [submitted, setSubmitted] = useState(false);

    // Lock body scroll while the modal is open.
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, [open]);

    // Reset the "thank you" state whenever the modal is reopened.
    useEffect(() => {
        if (open) setSubmitted(false);
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                    ×
                </button>

                {submitted ? (
                    <div className="text-center py-6">
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Thank you!</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Your feedback helps us improve. It will appear on our site once approved.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-[#EF6A22] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#d85d1c] transition"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-5">
                            <div className="text-4xl mb-2">🛍️</div>
                            <h3 className="text-lg font-bold text-gray-900">How was your experience?</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Your order is placed! Tell us how shopping with us went.
                            </p>
                        </div>
                        <SiteReviewForm compact onSuccess={() => setSubmitted(true)} />
                    </>
                )}
            </div>
        </div>
    );
}
