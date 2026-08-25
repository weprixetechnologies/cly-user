"use client"

import React, { useEffect, useState } from 'react'
import Headings from '@/components/ui/headings'

const TrustedBySection = ({ logos: initialLogos }) => {
    const [logos, setLogos] = useState(initialLogos || [])
    const [loading, setLoading] = useState(!initialLogos)

    useEffect(() => {
        if (!initialLogos || initialLogos.length === 0) {
            fetchLogos()
        }
    }, [initialLogos])

    const fetchLogos = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api'
            const res = await fetch(`${baseUrl}/trusted-logos`, { cache: 'no-store' })
            if (res.ok) {
                const json = await res.json()
                setLogos(json.data || [])
            }
        } catch (error) {
            console.error('Error fetching trusted logos:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!loading && logos.length === 0) {
        return null
    }

    // Duplicate logos to ensure a seamless infinite scroll effect
    const displayLogos = logos.length > 0 ? [...logos, ...logos, ...logos, ...logos] : []

    return (
        <section className="my-12 py-8 bg-gray-50/70 border-y border-gray-100 overflow-hidden">
            <div className="mb-6">
                <Headings subHeading="Brands & Organizations" heading="Trusted By" />
            </div>

            <div className="relative w-full overflow-hidden flex items-center">
                {/* Gradient Fades for left & right edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50/90 to-transparent z-10 pointer-events-none" />

                <div className="flex w-max animate-marquee items-center gap-12 sm:gap-16 hover:[animation-play-state:paused]">
                    {displayLogos.map((logo, index) => (
                        <div
                            key={`${logo.id || index}-${index}`}
                            className="shrink-0 flex items-center justify-center h-16 w-36 sm:w-44 px-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
                        >
                            <img
                                src={logo.logoUrl}
                                alt={logo.name || 'Trusted Brand Logo'}
                                className="max-h-12 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TrustedBySection
