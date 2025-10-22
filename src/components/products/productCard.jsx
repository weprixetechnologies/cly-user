"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { IoChevronDownSharp } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { addToCart as addToCartApi } from '@/utils/cartService'
import { toast } from 'react-toastify'

const ProductCard = ({ product }) => {
    const quickOptions = [1, 2, 3, 5, 10]
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(1)
    const [isCustom, setIsCustom] = useState(false)
    const [customValue, setCustomValue] = useState('')
    const [adding, setAdding] = useState(false)
    const router = useRouter();
    const applyCustom = () => {
        const num = Number(customValue)
        if (!Number.isNaN(num) && num > 0) {
            setValue(num)
            setIsCustom(false)
            setOpen(false)
        }
    }

    const handleAdd = async () => {
        try {
            setAdding(true)
            await addToCartApi({
                productID: product.id,
                productName: product.name,
                featuredImage: product.image,
                boxQty: 0,
                packQty: 0,
                units: value,
            })
            toast.success('Added to cart')
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to add to cart'
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
            </div>
            <div className='mt-[8px]'>
                <p className='text-xs text-gray-500'>{product.category || 'Category Name'}</p>
                <h3 className='text[16px] font-medium text-gray-900 line-clamp-1'>{product.name}</h3>
            </div>
            <div className=" w-full flex justify-center gap-2 mt-2">
                <div className="w-[35%] border rounded-bl-lg relative select-none">
                    <button
                        type="button"
                        onClick={() => setOpen((p) => !p)}
                        className="w-full cursor-pointer h-full py-2 px-2 text-sm text-left hover:bg-gray-50 rounded-bl-lg flex justify-between items-center " style={{ fontFamily: 'var(--font-montserrat)' }}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                    >
                        Qty: {value} <IoChevronDownSharp />
                    </button>

                    {open && (
                        <div className="absolute left-0 bottom-full mb-1 w-[220px] bg-white border rounded-md shadow z-20">
                            <ul role="listbox" className="max-h-56 overflow-auto">
                                {quickOptions.map((opt) => (
                                    <li key={opt}>
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                            onClick={() => { setValue(opt); setOpen(false); setIsCustom(false); }}
                                            role="option"
                                            aria-selected={value === opt}
                                        >
                                            {opt}
                                        </button>
                                    </li>
                                ))}
                                <li className="border-t">
                                    <button
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                        onClick={() => { setIsCustom(true); }}
                                    >
                                        Custom…
                                    </button>
                                </li>
                            </ul>

                            {isCustom && (
                                <div className="p-3 border-t flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        value={customValue}
                                        onChange={(e) => setCustomValue(e.target.value)}
                                        placeholder="Enter qty"
                                        className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF6A22]"
                                    />
                                    <button
                                        type="button"
                                        className="text-white bg-[#EF6A22] px-2 py-1 rounded text-sm"
                                        onClick={applyCustom}
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <button onClick={handleAdd} disabled={adding} className='flex-1 bg-[#EF6A22] text-white px-4 py-2 rounded-br-lg hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] transition-all duration-300 hover:cursor-pointer disabled:opacity-60'>{adding ? 'Adding…' : 'Add to Cart'}</button>
            </div>
        </div>
    )
}

export default ProductCard
