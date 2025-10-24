"use client"
import React, { useState } from 'react'
import { RxCross2 } from "react-icons/rx";
import Image from 'next/image'
import { removeCartItem, updateCartItem } from '@/utils/cartService';
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
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [customQuantities, setCustomQuantities] = useState({});

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

    const handleQuantityUpdate = async (productID, newUnits) => {
        setUpdatingItems(prev => new Set(prev).add(productID));

        try {
            await updateCartItem(productID, { units: newUnits });
            toast.success('Quantity updated');

            // Notify parent component to refresh cart data
            if (onCartUpdated) {
                onCartUpdated();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productID);
                return newSet;
            });
        }
    };

    // Round up to nearest multiple of minQty
    const roundUpToMinQty = (quantity, minQty) => {
        if (quantity <= 0) return minQty;
        return Math.ceil(quantity / minQty) * minQty;
    };

    // Handle custom quantity input
    const handleCustomQuantityChange = (productID, value) => {
        setCustomQuantities(prev => ({
            ...prev,
            [productID]: value
        }));
    };

    // Handle custom quantity submit
    const handleCustomQuantitySubmit = async (productID, minQty) => {
        const customValue = customQuantities[productID];
        if (!customValue || customValue <= 0) return;

        const roundedQuantity = roundUpToMinQty(parseInt(customValue), minQty);

        // Show user what the rounded quantity will be
        if (roundedQuantity !== parseInt(customValue)) {
            toast.info(`Quantity rounded up to ${roundedQuantity} (minimum: ${minQty})`);
        }

        await handleQuantityUpdate(productID, roundedQuantity);

        // Clear the custom input
        setCustomQuantities(prev => {
            const newState = { ...prev };
            delete newState[productID];
            return newState;
        });
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
                                        <p className="text-sm md:text-lg font-medium">₹{Number(i.productPrice || 100).toFixed(2)}</p>
                                        {/* <p className="text-xs md:text-sm font-light text-gray-500">
                                            {i.inventory !== undefined ? `Stock: ${i.inventory}` : '(Pricing to be calculated)'}
                                        </p> */}
                                    </div>
                                    <p className='text-xs mt-2'>Quantity Selection</p>
                                    <div className="flex flex-col gap-2 mt-1">
                                        {/* Current Quantity Display */}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs text-gray-600">Current Quantity:</label>
                                            <span className="text-sm font-medium text-gray-900">{i.units || (i.minQty || 1)}</span>
                                            <span className="text-xs text-gray-500">
                                                (Min: {i.minQty || 1})
                                            </span>
                                        </div>

                                        {/* Enter Custom Quantity */}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs text-gray-600">Enter Quantity:</label>
                                            <input
                                                type="number"
                                                min={i.minQty || 1}
                                                max={1000}
                                                value={customQuantities[i.productID] || ''}
                                                onChange={(e) => handleCustomQuantityChange(i.productID, e.target.value)}
                                                disabled={updatingItems.has(i.productID)}
                                                placeholder={`Min: ${i.minQty || 1}`}
                                                className="text-xs border border-gray-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <button
                                                onClick={() => handleCustomQuantitySubmit(i.productID, i.minQty || 1)}
                                                disabled={updatingItems.has(i.productID) || !customQuantities[i.productID]}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Update
                                            </button>
                                        </div>

                                        {/* Rounding Info */}
                                        {customQuantities[i.productID] && (
                                            <div className="text-xs text-blue-600">
                                                Will round up to: {roundUpToMinQty(parseInt(customQuantities[i.productID]) || 0, i.minQty || 1)}
                                            </div>
                                        )}

                                        {updatingItems.has(i.productID) && (
                                            <div className="flex items-center text-xs text-blue-600">
                                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </div>
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
