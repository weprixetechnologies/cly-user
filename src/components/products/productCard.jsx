"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { addToCart as addToCartApi } from '@/utils/cartService'
import { toast } from 'react-toastify'
import { BsCart3, BsHeart, BsStarFill, BsStarHalf, BsStar } from 'react-icons/bs'
import { useDiscountPercent } from '@/hooks/useDiscountPercent'

const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(<BsStarFill key={i} className="text-amber-400" size={11} />);
        } else if (i === fullStars + 1 && hasHalf) {
            stars.push(<BsStarHalf key={i} className="text-amber-400" size={11} />);
        } else {
            stars.push(<BsStar key={i} className="text-gray-200" size={11} />);
        }
    }
    return stars;
};

const ProductCard = ({ product }) => {
    const [buttonState, setButtonState] = useState('idle') // 'idle' | 'adding' | 'success' | 'added'
    const router = useRouter();
    const { discountPct } = useDiscountPercent()

    // Prices: salePrice = actual Tally price; mrp = inflated original price
    const salePrice = Number(product.price || 0)
    const mrp = salePrice > 0 ? salePrice * (1 + discountPct / 100) : 0

    // Use minQty as the default quantity
    const quantity = product.minQty || 1;

    const handleAdd = async () => {
        // Check if product is in stock
        if ((product.inventory || 0) <= 0) {
            toast.error('This product is currently out of stock.')
            return;
        }

        try {
            setButtonState('adding')
            await addToCartApi({
                productID: product.id,
                productName: product.name,
                featuredImage: product.image,
                boxQty: 0,
                units: quantity,
                productPrice: salePrice,
            })
            toast(
                <div className="flex items-center gap-2 text-sm font-bold justify-center">
                    <span className="text-lg">🛍️</span> Yay! Added to Cart!
                </div>, 
                {
                    position: "bottom-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    style: {
                        backgroundColor: '#fff0f5',
                        color: '#ff6b81',
                        borderRadius: '999px',
                        boxShadow: '0 8px 20px -6px rgba(255, 107, 129, 0.5)',
                        border: '2px solid #ffccd5',
                        padding: '10px 20px',
                        margin: '0 auto 20px',
                        width: 'max-content',
                        textAlign: 'center'
                    }
                }
            )
            setButtonState('success')
            setTimeout(() => {
                setButtonState('added')
            }, 1500)
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to add to cart'

            window.location.href = '/login'


            toast.error(msg)
            setButtonState('idle')
        }
    }

    return (
        <div className='w-full bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden'>
            <div className='relative w-full cursor-pointer bg-[#f9f9f9]' style={{ aspectRatio: '1 / 1' }} onClick={() => router.push(`/products/${product.id}`)}>
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 270px"
                    className='object-cover'
                    priority={false}
                />
                
                {/* Discount Tag */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-[#ff4d4f] text-white rounded text-[10px] font-bold tracking-wide shadow-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {(product.inventory || 0) <= 0 ? 'Out of Stock' : `${Math.round(discountPct)}% OFF`}
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm text-gray-400 hover:text-[#EF6A22] transition-colors border border-gray-100">
                    <BsHeart size={14} />
                </button>
            </div>
            
            <div className='flex-1 flex flex-col p-3'>
                {/* Title and SKU */}
                <h3 className='text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 cursor-pointer hover:text-[#004aad] transition-colors' onClick={() => router.push(`/products/${product.id}`)}>
                    {product.name}
                </h3>
                <div className='text-[11px] text-gray-400 mb-1'>
                    SKU: {product.sku || '—'}
                </div>
                
                {/* Star Rating Row */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center gap-0.5">
                        {renderStars(product.avgRating || 0)}
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">{Number(product.avgRating || 0).toFixed(1)}</span>
                    <span className="text-[10px] text-gray-400">({product.reviewCount || 0})</span>
                </div>
                
                {/* Spacer to push price and button to bottom */}
                <div className="mt-auto"></div>

                {/* Pricing & Min Order */}
                <div className='flex items-end justify-start gap-2 mb-1'>
                    <p className='text-lg font-bold text-[#EF233C] leading-none'>₹{salePrice.toFixed(0)}</p>
                    {discountPct > 0 && mrp > 0 && (
                        <p className='text-[11px] text-gray-400 line-through leading-none mb-[2px]'>
                            ₹{mrp.toFixed(0)}
                        </p>
                    )}
                </div>
                <div className="text-[11px] text-gray-500 mb-3">
                    Min. Order: {quantity} {quantity === 1 ? 'Pc' : 'Pcs'}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAdd}
                    disabled={buttonState === 'adding' || (product.inventory || 0) <= 0}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${(product.inventory || 0) <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : buttonState === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-[#004aad] text-white hover:bg-[#003882]'
                        } ${buttonState === 'adding' ? 'opacity-80 cursor-wait' : ''}`}
                >
                    {buttonState === 'success' ? (
                        <svg className="w-5 h-5 text-white" style={{ animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            <style>{`
                                @keyframes popIn {
                                    0% { transform: scale(0); opacity: 0; }
                                    100% { transform: scale(1.2); opacity: 1; }
                                }
                            `}</style>
                        </svg>
                    ) : (
                        <>
                            <BsCart3 size={15} />
                            <span>
                                {buttonState === 'adding' ? 'Adding…' : (product.inventory || 0) <= 0 ? 'Out of Stock' : buttonState === 'added' ? 'Add Again' : 'Add to Cart'}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default ProductCard
