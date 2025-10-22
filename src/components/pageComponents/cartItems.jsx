"use client"
import React, { useState } from 'react'
import { RxCross2 } from "react-icons/rx";
import Image from 'next/image'
import { removeCartItem } from '@/utils/cartService';
import { toast } from 'react-toastify';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CartItems = ({ cart, onItemRemoved, onCartUpdated }) => {
    const [removingItems, setRemovingItems] = useState(new Set());

    const handleRemoveItem = async (productID, itemName) => {
        setRemovingItems(prev => new Set(prev).add(productID));

        try {
            await removeCartItem(productID);
            toast.success('Item removed from cart');

            // Notify parent component to refresh cart data
            if (onCartUpdated) {
                onCartUpdated();
            }
            if (onItemRemoved) {
                onItemRemoved();
            }
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item from cart');
        } finally {
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productID);
                return newSet;
            });
        }
    };

    console.log(cart);

    return (
        <div className='mt-5'>
            <p className='font-medium text-lg'>Your Cart Items</p>
            <div className="flex flex-col gap-3 py-3">
                {cart?.map((i, index) => (
                    <div key={index}>
                        <div className="border border-gray-200 pr-5 py-3 pl-3 rounded-lg relative" >
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        disabled={removingItems.has(i.productID)}
                                        className={`absolute top-3 right-3 border rounded-full h-5 w-5 flex justify-center items-center transition-colors ${removingItems.has(i.productID)
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-300 hover:text-red-500 hover:border-red-500'
                                            }`}
                                    >
                                        <RxCross2 size={12} />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Item from Cart</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to remove "{i.productName}" from your cart? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleRemoveItem(i.productID, i.productName)}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Remove
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            {/* aspect-[170/222] */}
                            <div className="flex gap-2 ">
                                <div className="block">
                                    <div className="relative aspect-[170/222] md:w-[120px] md:min-w-[120px] w-[100px] min-w-[100px]">
                                        <Image
                                            src={i.featuredImage || '/placeholder-image.jpg'}
                                            fill
                                            alt='Cart Item Image'
                                            className='rounded-lg'
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:pl-3">
                                    {/* //NAME//BRAND//VARIATION */}
                                    {/* <p className='text-xs font-medium text-secondary-text-deep'>{i.brand}</p> */}
                                    <p className='text-sm font-medium line-clamp-1 md:text-[16px]'>{i.productName}</p>
                                    <div className="cart-pricing flex gap-2 items-center">
                                        <p className="text-sm md:text-lg font-medium">₹100.00</p>
                                        <p className="text-xs md:text-sm font-light text-gray-500">(Pricing to be calculated)</p>
                                    </div>
                                    <p className='text-xs mt-2'>Selected Quantities</p>
                                    <div className="flex flex-row flex-wrap gap-2 mt-1">
                                        {i.boxQty > 0 && (
                                            <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Boxes: {i.boxQty}</p>
                                        )}
                                        {i.packQty > 0 && (
                                            <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Packs: {i.packQty}</p>
                                        )}
                                        {i.units > 0 && (
                                            <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Units: {i.units}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default CartItems
