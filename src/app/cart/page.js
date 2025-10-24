"use client"

import axiosInstance from '@/utils/axiosInstance';
import { fetchCart, removeCartItem } from '@/utils/cartService';
import { getCookie } from '@/utils/cookieUtil';
import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { CiDeliveryTruck } from "react-icons/ci";
import { RiSecurePaymentLine } from "react-icons/ri";
import { ClipLoader } from "react-spinners";
import CheckoutLoadingModal from '@/components/ui/CheckoutLoadingModal';

// Lazy load cart components for better performance
const BreakdownCart = lazy(() => import('@/components/pageComponents/breakdownCart'));
const CartItems = lazy(() => import('@/components/pageComponents/cartItems'));
const AddressSelector = lazy(() => import('@/components/pageComponents/addressSelector'));
const SelectPayment = lazy(() => import('@/components/pageComponents/selectPayment'));
const ValidateCoupon = lazy(() => import('@/components/pageComponents/validateCoupon'));

const Page = () => {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [cartDetail, setCartDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedAddressID, setSelectedAddressID] = useState(null);
    const [confirmAddress, setConfirmAddress] = useState(false)
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentMode, setPaymentMode] = useState('cod')
    const [placing, setPlacing] = useState(false)
    const [placeError, setPlaceError] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [showCheckoutModal, setShowCheckoutModal] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [redirecting, setRedirecting] = useState(false);
    const steps = [
        { id: 1, label: 'Cart' },
        { id: 2, label: 'Address & Payment' }
    ];

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setSelectedAddressID(address?.addressID || null);
    };
    const handlePaymentModeSelect = (mode) => {
        // Map UI selection to backend expected values
        const mapped = mode === 'phonepe' ? 'PREPAID' : 'COD';
        setPaymentMode(mapped);
    }

    const handleCouponApplied = (couponData) => {
        setAppliedCoupon(couponData);
        setCouponDiscount(couponData.discount || 0);
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
    }

    // Handle cart item removal - clear coupon if cart becomes empty
    const handleCartItemRemoved = () => {
        if (cart?.length === 0) {
            setAppliedCoupon(null);
            setCouponDiscount(0);
        }
    }

    // Check authentication
    const checkAuthentication = () => {
        const accessToken = getCookie('_at');
        const uid = getCookie('uid');

        if (!accessToken || !uid) {
            setIsAuthenticated(false);
            setRedirecting(true);

            // Redirect to login after 1 second
            setTimeout(() => {
                router.push('/login');
            }, 1000);

            return false;
        }

        setIsAuthenticated(true);
        return true;
    };

    // Load cart data
    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check authentication first
            if (!checkAuthentication()) {
                return;
            }

            const cartData = await fetchCart();
            setCart(cartData.cart);
            setCartDetail(cartData.cartDetail);
        } catch (err) {
            console.error('Error loading cart:', err);

            // Check if it's an authentication error
            if (err.message?.includes('not authenticated') || err.message?.includes('401')) {
                setIsAuthenticated(false);
                setRedirecting(true);
                setTimeout(() => {
                    router.push('/login');
                }, 1000);
                return;
            }

            setError(err.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };
    const handlePlaceOrder = async () => {
        setPlaceError('')
        // First click: move to address/payment confirmation step
        if (!confirmAddress) {
            setConfirmAddress(true)
            setCurrentStep(2)
            return
        }

        // Require selected address
        if (!selectedAddress) {
            setPlaceError('Please select a delivery address')
            return
        }

        try {
            setPlacing(true)
            setShowCheckoutModal(true)

            // Get user ID for the API call
            const uid = getCookie('uid');
            if (!uid) {
                throw new Error('User not authenticated');
            }

            const response = await axiosInstance.post(`/order/user/${uid}/place-order`, {
                address: selectedAddress,
                paymentMode,
                couponCode: appliedCoupon?.couponCode || null,
            });

            // Handle successful order placement
            if (response?.data?.success) {
                const orderId = response?.data?.data?.orderID;
                if (orderId) {
                    // For COD orders, redirect to success page
                    if (response?.data?.data?.paymentMode === 'COD') {
                        window.location.href = `/order-success/order-summary/${orderId}`;
                        return;
                    }

                    // For other payment methods, redirect to success page
                    window.location.href = `/order-success/order-summary/${orderId}`;
                    return;
                }
            }

            // Fallback to profile page if no specific page exists
            if (typeof window !== 'undefined') {
                window.location.href = '/account?tab=orders'
            }
        } catch (error) {
            console.error('Error placing order:', error)
            setPlaceError(error?.response?.data?.error || 'Failed to place order')
            setShowCheckoutModal(false) // Hide modal on error
        } finally {
            setPlacing(false)
        }
    };



    useEffect(() => {
        loadCart();
    }, []);

    // Clear coupon if cart becomes empty
    useEffect(() => {
        if (cart?.length === 0 && appliedCoupon) {
            setAppliedCoupon(null);
            setCouponDiscount(0);
        }
    }, [cart?.length, appliedCoupon]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
                <ClipLoader color="#ffc107" size={60} speedMultiplier={1} />
                <span className="text-yellow-700 font-semibold mt-4 text-base">Loading your cart...</span>
            </div>
        );
    }

    // Show redirecting message for unauthenticated users
    if (redirecting || isAuthenticated === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">
                        You need to be logged in to access your cart. Redirecting you to the login page...
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <ClipLoader color="#3B82F6" size={20} />
                        <span className="text-sm font-medium">Redirecting in 1 second</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 px-4 text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Cart</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex w-full flex-col items-center '>

            <div className="flex justify-center pb-3 pt-4 md:py-10 md:w-[50%]">
                <div className="w-full flex justify-center items-center space-x-4">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            {/* Step Circle + Label */}
                            <div
                                className="flex items-center cursor-pointer"
                                onClick={() => setCurrentStep(step.id)}
                            >
                                <div
                                    className={`w-5 h-2 rounded-full transition-all 
                  ${currentStep >= step.id ? 'bg-green-500' : 'bg-gray-300'}`}
                                ></div>
                                <span
                                    className={`ml-2 font-medium text-xs transition-all 
                  ${currentStep >= step.id ? 'text-green-500' : 'text-gray-400'}`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Line (skip after last step) */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 hidden md:block transition-all 
                  ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`}
                                ></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:w-[80%] w-full px-4 md:px-0">
                <div className="md:flex md:col-span-2  md:flex-col">
                    {!confirmAddress ? (
                        <>
                            <div className="py-2 md:mt-5">
                                <Suspense fallback={<div className="h-16 bg-gray-200 animate-pulse rounded-lg" />}>
                                    <ValidateCoupon
                                        onCouponApplied={handleCouponApplied}
                                        appliedCoupon={appliedCoupon}
                                        onRemoveCoupon={handleRemoveCoupon}
                                    />
                                </Suspense>
                            </div>
                            <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
                                <CartItems
                                    cart={cart}
                                    onItemRemoved={handleCartItemRemoved}
                                    onCartUpdated={loadCart}
                                />
                            </Suspense>
                        </>
                    )
                        :
                        <>


                            <div className="rounded-lg flex-col flex gap-2">
                                <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                                    <AddressSelector onSelect={handleAddressSelect} showAll={true} />
                                </Suspense>
                                <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                                    <SelectPayment onSelect={handlePaymentModeSelect} />
                                </Suspense>
                            </div>
                        </>
                    }

                </div>
                <div className="md:col-span-1 py-3 flex flex-col md:px-3 gap-2 mb-15">
                    {/* {
            !confirmAddress && <SelectAddress onSelect={handleAddressSelect} />
          } */}
                    <Suspense fallback={<div className="h-48 bg-gray-200 animate-pulse rounded-lg" />}>
                        <BreakdownCart
                            breakdownData={cartDetail}
                            couponDiscount={couponDiscount}
                            appliedCoupon={appliedCoupon}
                            cart={cart}
                        />
                    </Suspense>
                    {placeError && (
                        <p className="text-red-600 text-sm mt-1">{placeError}</p>
                    )}
                    <button onClick={handlePlaceOrder} disabled={placing} className='hidden md:flex text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium mt-4 rounded-lg cursor-pointer justify-center items-center gap-2 disabled:opacity-60'>
                        <RiSecurePaymentLine size={18} />{!confirmAddress ? 'Proceed to Address & Payment' : placing ? 'Placing...' : 'Place Order Now'}
                    </button>
                    <div className="bg-white py-2 px-3 fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:hidden">
                        <button onClick={handlePlaceOrder} disabled={placing}
                            className="text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium rounded-lg cursor-pointer flex justify-center items-center gap-2 disabled:opacity-60"
                        >
                            <RiSecurePaymentLine size={18} />
                            {!confirmAddress ? 'Proceed to Address & Payment' : placing ? 'Placing...' : 'Place Order Now'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Loading Modal */}
            <CheckoutLoadingModal isOpen={showCheckoutModal} />
        </div>
    )
}

export default Page;


