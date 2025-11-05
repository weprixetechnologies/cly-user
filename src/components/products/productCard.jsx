"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { addToCart as addToCartApi } from '@/utils/cartService'
import { toast } from 'react-toastify'

const ProductCard = ({ product }) => {
    const [adding, setAdding] = useState(false)
    const router = useRouter();

    // Use minQty as the default quantity
    const quantity = product.minQty || 1;

    const handleAdd = async () => {
        // Check if product is in stock
        if ((product.inventory || 0) <= 0) {
            toast.error('This product is currently out of stock.')
            return;
        }

        try {
            setAdding(true)
            await addToCartApi({
                productID: product.id,
                productName: product.name,
                featuredImage: product.image,
                boxQty: 0,
                units: quantity,
            })
            toast.success('Added to cart')
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to add to cart'

            window.location.href = '/login'


            toast.error(msg)
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className='w-full'>
            <div className='relative w-full overflow-hidden rounded-t-lg cursor-pointer' style={{ aspectRatio: '270 / 280' }} onClick={() => router.push(`/products/${product.id}`)}>
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 270px"
                    className='object-cover rounded-t-lg'
                    priority={false}
                />
                {/* Stock Status Badge */}
                {(product.inventory || 0) <= 0 && (
                    <div className="absolute top-2 right-2 p-2 bg-white text-red-500 border border-red-500 rounded-full flex items-center justify-center text-xs font-medium shadow-lg" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Out Of Stock
                    </div>
                )}
            </div>
            <div className='mt-[8px]'>
                <div className="flex justify-between items-center">
                    <p className='text-xs text-gray-500 line-clamp-1'>{product.category || 'Category Name'}</p>

                </div>
                <h3 className='text[16px] font-medium text-gray-900 line-clamp-1'>{product.name}</h3>
                <div className='flex items-center justify-start gap-2'>

                    <div className='text-xs text-gray-500 mt-0.5'>SKU: {product.sku || '—'}</div> |
                    <div className="text-xs text-gray-500 text-center  ">
                        Min Qty: {quantity}
                    </div>
                </div>
                <div className='mt-1 flex items-center justify-between'>
                    <p className='text-sm font-semibold text-gray-700'>₹{Number(product.price || 0).toFixed(2)}</p>
                </div>
            </div>
            {/* <div className="w-full flex justify-center gap-2 mt-2">
                <div className="text-xs text-gray-500 text-center w-full mb-1">
                    Min Qty: {quantity}
                </div>
            </div> */}
            <div className="w-full flex justify-center gap-2 mt-2">
                <button
                    onClick={handleAdd}
                    disabled={adding || (product.inventory || 0) <= 0}
                    className={`w-full px-4 py-2 rounded-lg transition-all duration-300 ${(product.inventory || 0) <= 0
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-[#EF6A22] text-white hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] hover:cursor-pointer'
                        } ${adding ? 'opacity-60' : ''}`}
                >
                    {adding ? 'Adding…' : (product.inventory || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    )
}

export default ProductCard
