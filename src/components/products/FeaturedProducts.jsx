"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import ProductCard from './productCard'

const PLACEHOLDER_IMG = 'https://picsum.photos/270/280'

const mapApiProductToCard = (p) => ({
    id: p.productID,
    name: p.productName,
    image: p.featuredImages || PLACEHOLDER_IMG,
    category: p.categoryName || 'Category',
    categoryID: p.categoryID,
    minQty: p.minQty || 1,
    price: p.productPrice || 0,
    sku: p.sku,
    inventory: p.inventory || 0,
})

const FeaturedProducts = ({ products = [] }) => {
    const containerRef = useRef(null)
    const [isMouseDown, setIsMouseDown] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const mappedProducts = (products || []).map(mapApiProductToCard)

    if (mappedProducts.length === 0) {
        return null
    }

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
    }

    const onMouseUp = () => setIsMouseDown(false)

    const onMouseMove = (e) => {
        const el = containerRef.current
        if (!el || !isMouseDown) return
        e.preventDefault()
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX) * 2 // Multiply for faster scrolling
        el.scrollLeft = scrollLeft - walk
    }

    // Navigation buttons
    const scrollByAmount = useCallback((delta) => {
        const el = containerRef.current
        if (!el) return
        const scrollAmount = 300 // Scroll by 300px
        el.scrollTo({ left: el.scrollLeft + delta * scrollAmount, behavior: 'smooth' })
    }, [])

    return (
        <div className="relative py-4">
            {/* Navigation Buttons */}
            {mappedProducts.length > 3 && (
                <>
                    <button
                        type="button"
                        aria-label="Previous products"
                        onClick={() => scrollByAmount(-1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 rounded-full w-10 h-10 grid place-items-center shadow-lg hover:bg-white transition-colors"
                    >
                        <span className="sr-only">Prev</span>
                        <span className="text-xl">‹</span>
                    </button>
                    <button
                        type="button"
                        aria-label="Next products"
                        onClick={() => scrollByAmount(1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 rounded-full w-10 h-10 grid place-items-center shadow-lg hover:bg-white transition-colors"
                    >
                        <span className="sr-only">Next</span>
                        <span className="text-xl">›</span>
                    </button>
                </>
            )}

            <div
                ref={containerRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className="overflow-x-auto no-scrollbar scroll-smooth px-4"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <div className="flex gap-6" style={{ width: 'max-content' }}>
                    {mappedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="shrink-0"
                            style={{ width: '270px' }}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FeaturedProducts

