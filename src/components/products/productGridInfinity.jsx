"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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

const ProductGridInfinity = ({ initialLimit = 20, search = '', categoryID = '', minPrice = '', maxPrice = '', maxTotal, visitShop = true, outOfStock = true }) => {
    const [products, setProducts] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [hasMore, setHasMore] = useState(true)

    const observerRef = useRef(null)
    const sentinelRef = useRef(null)

    const fetchPage = useCallback(async () => {
        if (loading) return
        setLoading(true)
        setError('')
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3300/api'
            const url = new URL(baseUrl + '/products/list')
            url.searchParams.set('page', String(page))
            url.searchParams.set('limit', String(initialLimit))
            if (search) url.searchParams.set('search', search)
            if (categoryID) url.searchParams.set('categoryID', categoryID)
            if (minPrice) url.searchParams.set('minPrice', minPrice)
            if (maxPrice) url.searchParams.set('maxPrice', maxPrice)
            // Add outOfStock parameter
            url.searchParams.set('outOfStock', String(outOfStock))

            const res = await fetch(url.toString(), { cache: 'no-store' })
            if (!res.ok) throw new Error('Failed to fetch products')
            const json = await res.json()
            const items = (json?.data?.products || []).map(mapApiProductToCard)
            const total = json?.data?.pagination?.total

            // Calculate the final list - we need to get current products first
            setProducts(prevProducts => {
                const combined = page === 1 ? items : [...prevProducts, ...items]
                const finalList = typeof maxTotal === 'number' ? combined.slice(0, maxTotal) : combined

                // Determine if there are more items to load based on finalList
                let nextHasMore = true
                if (typeof maxTotal === 'number' && finalList.length >= maxTotal) {
                    nextHasMore = false
                } else if (typeof total === 'number') {
                    const capTotal = typeof maxTotal === 'number' ? Math.min(total, maxTotal) : total
                    nextHasMore = finalList.length < capTotal
                } else {
                    nextHasMore = items.length === initialLimit
                }

                // Update hasMore state
                setHasMore(nextHasMore)

                return finalList
            })
        } catch (e) {
            setError(e?.message || 'Something went wrong')
            setHasMore(false) // Stop trying if there's an error
        } finally {
            setLoading(false)
        }
    }, [page, initialLimit, search, categoryID, minPrice, maxPrice, maxTotal, outOfStock])

    // Initial load / filter changes
    useEffect(() => {
        // reset when filters change
        setProducts([])
        setPage(1)
        setHasMore(true)
    }, [search, categoryID, minPrice, maxPrice, initialLimit, outOfStock])

    useEffect(() => {
        fetchPage()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    // Intersection Observer to trigger loading more
    useEffect(() => {
        if (!sentinelRef.current) return
        if (!hasMore) {
            // Don't observe if there's no more data to load
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
            return
        }

        if (observerRef.current) observerRef.current.disconnect()
        observerRef.current = new IntersectionObserver((entries) => {
            const first = entries[0]
            if (first.isIntersecting && !loading && hasMore) {
                setPage(prev => prev + 1)
            }
        }, { rootMargin: '200px' })

        observerRef.current.observe(sentinelRef.current)
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
        }
    }, [loading, hasMore])

    return (
        <div>
            {error && (
                <div className='py-3 text-center text-sm text-red-500'>{error}</div>
            )}
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <div ref={sentinelRef} />
            {loading && (
                <div className='py-6 text-center text-sm text-gray-500'>Loading…</div>
            )}
            {!hasMore && products.length > 0 && (
                <div className='py-6 text-center text-xs text-gray-400'>No more products</div>
            )}
            {
                visitShop && (
                    <div className='py-6 flex justify-center'>
                        <Link href="/products" className='px-6 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition'>
                            Visit Shop
                        </Link>
                    </div>
                )
            }

        </div>
    )
}

export default ProductGridInfinity
