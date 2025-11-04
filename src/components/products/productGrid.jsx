"use client"

import React, { useEffect, useState } from 'react'
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

const ProductGrid = ({ page = 1, limit = 20, search = '' }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true
        async function run() {
            setLoading(true)
            setError('')
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api'
                const url = new URL(baseUrl + '/products/list')
                url.searchParams.set('page', String(page))
                url.searchParams.set('limit', String(limit))
                if (search) url.searchParams.set('search', search)

                const res = await fetch(url.toString(), { cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to fetch products')
                const json = await res.json()
                const items = (json?.data?.products || []).map(mapApiProductToCard)
                if (isMounted) setProducts(items)
            } catch (e) {
                if (isMounted) setError(e?.message || 'Something went wrong')
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        run()
        return () => { isMounted = false }
    }, [page, limit, search])

    if (loading) {
        return <div className='py-6 text-center text-sm text-gray-500'>Loading...</div>
    }
    if (error) {
        return <div className='py-6 text-center text-sm text-red-500'>{error}</div>
    }

    return (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6'>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

export default ProductGrid
