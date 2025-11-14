"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const Slider = ({ desktopImages = [], mobileImages = [] }) => {
    const containerRef = useRef(null)
    const [isMouseDown, setIsMouseDown] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const autoSlideRef = useRef(null)

    // Clone first and last slides to give an infinite feel
    // We'll jump scroll position when reaching edges
    const slideWidthRef = useRef(0)

    const slides = useMemo(() => {
        const imgs = (isMobile ? mobileImages : desktopImages) || []
        // Normalize to objects with id and url
        return imgs.map((img, idx) => ({ id: idx + 1, url: typeof img === 'string' ? img : img.imgUrl }))
    }, [desktopImages, mobileImages, isMobile])

    const extendedSlides = useMemo(() => {
        if (slides.length === 0) return []
        return [slides[slides.length - 1], ...slides, slides[0]]
    }, [slides])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        // ensure slide width
        const firstSlide = el.querySelector('[data-slide]')
        if (firstSlide) {
            slideWidthRef.current = firstSlide.getBoundingClientRect().width
        }
        // Start at the first real slide (index 1)
        requestAnimationFrame(() => {
            el.scrollLeft = slideWidthRef.current
        })
    }, [extendedSlides.length])

    // Track viewport to switch sets
    useEffect(() => {
        const update = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    // Auto-slide functionality
    useEffect(() => {
        if (slides.length <= 1) return // Don't auto-slide if there's only one or no slides

        const startAutoSlide = () => {
            if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current)
            }
            autoSlideRef.current = setInterval(() => {
                if (!isHovered && !isMouseDown) {
                    scrollBySlides(1)
                }
            }, 3000) // 3 seconds
        }

        startAutoSlide()

        return () => {
            if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current)
            }
        }
    }, [slides.length, isHovered, isMouseDown])

    // Pause auto-slide on hover
    const handleMouseEnter = () => setIsHovered(true)

    // Handle infinite jump when reaching clones
    const handleScroll = useCallback(() => {
        const el = containerRef.current
        if (!el) return
        const slideWidth = slideWidthRef.current
        const maxIndex = extendedSlides.length - 1
        const indexFloat = el.scrollLeft / slideWidth
        if (indexFloat <= 0.05) {
            // jumped to last real slide
            el.scrollLeft = slideWidth * (slides.length)
        } else if (indexFloat >= maxIndex - 0.95) {
            // jumped to first real slide
            el.scrollLeft = slideWidth
        }
    }, [extendedSlides.length, slides.length])

    // Drag with mouse
    const onMouseDown = (e) => {
        const el = containerRef.current
        if (!el) return
        setIsMouseDown(true)
        setStartX(e.pageX - el.offsetLeft)
        setScrollLeft(el.scrollLeft)
    }
    const onMouseLeave = () => {
        setIsMouseDown(false)
        setIsHovered(false)
    }
    const onMouseUp = () => setIsMouseDown(false)
    const onMouseMove = (e) => {
        const el = containerRef.current
        if (!el || !isMouseDown) return
        e.preventDefault()
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX)
        el.scrollLeft = scrollLeft - walk
    }

    // Touch handling uses native scrolling, we just ensure snapping visuals

    // Navigation buttons
    const scrollBySlides = useCallback((delta) => {
        const el = containerRef.current
        const slideWidth = slideWidthRef.current
        if (!el || !slideWidth) return
        el.scrollTo({ left: el.scrollLeft + delta * slideWidth, behavior: 'smooth' })
    }, [])

    return (
        <div className="relative py-4">
            <button
                type="button"
                aria-label="Previous slide"
                onClick={() => scrollBySlides(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 rounded-full w-9 h-9 grid place-items-center shadow hover:bg-white"
            >
                <span className="sr-only">Prev</span>
                ‹
            </button>
            <button
                type="button"
                aria-label="Next slide"
                onClick={() => scrollBySlides(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 rounded-full w-9 h-9 grid place-items-center shadow hover:bg-white"
            >
                <span className="sr-only">Next</span>
                ›
            </button>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onMouseEnter={handleMouseEnter}
                className="overflow-x-auto no-scrollbar scroll-smooth"
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="flex gap-4 px-6">
                    {extendedSlides.length === 0 ? (
                        <div
                            data-slide
                            className="shrink-0 rounded-xl bg-gray-200"
                            style={{
                                width: '80%',
                                height: isMobile ? 'calc(80vw * 300 / 243)' : '360px',
                                aspectRatio: isMobile ? '243 / 300' : undefined
                            }}
                        />
                    ) : (
                        extendedSlides.map((s, idx) => (
                            <div
                                key={`${s.id}-${idx}`}
                                data-slide
                                className="shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-white"
                                style={{
                                    width: '80%',
                                    height: isMobile ? 'calc(80vw * 300 / 243)' : '360px',
                                    aspectRatio: isMobile ? '243 / 300' : undefined
                                }}
                            >
                                <img
                                    src={s.url}
                                    alt={`Slide ${s.id}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.opacity = 0.3 }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Slider
