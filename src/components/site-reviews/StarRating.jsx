'use client';

import { useState } from 'react';

/**
 * Star rating widget.
 * - Interactive (default): click to set, hover to preview.
 * - Read-only: pass readOnly to render a static rating.
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 28 }) {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div className="inline-flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    onClick={() => !readOnly && onChange?.(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readOnly ? 'hover:scale-110' : ''} leading-none`}
                    style={{ fontSize: size, lineHeight: 1 }}
                >
                    <span className={star <= active ? 'text-[#EF6A22]' : 'text-gray-300'}>★</span>
                </button>
            ))}
        </div>
    );
}
