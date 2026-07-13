'use client'

import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api'
const SETTING_KEY = 'global_discount'
const DEFAULT_PCT = 12 // shown while fetching

// Module-level cache so we only hit the API once per page load
let _cached = null
let _promise = null

function fetchDiscount() {
    if (_promise) return _promise
    _promise = fetch(`${API_BASE}/settings/${SETTING_KEY}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((json) => {
            const val = parseFloat(json?.value)
            _cached = isNaN(val) ? DEFAULT_PCT : val
            return _cached
        })
        .catch(() => {
            _cached = DEFAULT_PCT
            return _cached
        })
    return _promise
}

/**
 * Returns the global discount percentage fetched from the API.
 * Falls back to DEFAULT_PCT (12) while loading or on error.
 *
 * @returns {{ discountPct: number, loading: boolean }}
 */
export function useDiscountPercent() {
    const [discountPct, setDiscountPct] = useState(_cached ?? DEFAULT_PCT)
    const [loading, setLoading] = useState(_cached === null)

    useEffect(() => {
        if (_cached !== null) {
            setDiscountPct(_cached)
            setLoading(false)
            return
        }

        setLoading(true)
        fetchDiscount().then((pct) => {
            setDiscountPct(pct)
            setLoading(false)
        })
    }, [])

    return { discountPct, loading }
}
