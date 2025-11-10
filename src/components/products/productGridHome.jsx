"use client"

import React from 'react'
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

const ProductGridHome = ({ products = [], visitShop = true }) => {
    const mappedProducts = (products || []).map(mapApiProductToCard)

    return (
        <div>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                {mappedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {visitShop && (
                <div className='py-6 flex justify-center'>
                    <Link href="/products" className='px-6 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition'>
                        Visit Shop
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ProductGridHome
