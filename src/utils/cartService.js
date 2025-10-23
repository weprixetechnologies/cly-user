import axiosInstance from './axiosInstance';
import { getCookie } from './cookieUtil';

/**
 * Cart service for direct API operations
 */

// Get user ID from cookies
const getUserId = () => {
    return getCookie('uid');
};

const getUidFromAccessToken = () => {
    const token = getCookie('_at');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        console.log(payload);

        return payload?.uid || null;
    } catch {
        return null;
    }
};

// Get user ID with fallback
const getUserIdWithFallback = async () => {
    // First try to get from cookies
    let uid = getUserId();

    if (!uid) {
        // Fallback: try to decode from access token
        uid = getUidFromAccessToken();
    }

    if (!uid) {
        throw new Error('User not authenticated. Please login again.');
    }

    return uid;
};

// Calculate cart totals and details
export const calculateCartDetails = (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
        return {
            subtotal: 0,
            deliveryFee: 0,
            total: 0,
            itemCount: 0
        };
    }

    // For now, we'll use placeholder pricing since the backend doesn't provide pricing
    // In a real implementation, you'd fetch product prices from the backend
    const subtotal = cartItems.reduce((sum, item) => {
        // Placeholder: assume each item costs 100 rupees
        // You should replace this with actual product pricing from your backend
        const itemPrice = 100; // This should come from product data
        const quantity = (item.boxQty || 0) + (item.units || 0);
        return sum + (itemPrice * quantity);
    }, 0);

    const deliveryFee = subtotal >= 499 ? 0 : 50; // Free delivery over 499
    const total = subtotal + deliveryFee;
    const itemCount = cartItems.reduce((count, item) => {
        return count + (item.boxQty || 0) + (item.units || 0);
    }, 0);

    return {
        subtotal,
        deliveryFee,
        total,
        itemCount
    };
};

// Fetch cart from backend
export const fetchCart = async () => {
    try {
        const uid = await getUserIdWithFallback();
        const response = await axiosInstance.get(`/cart/${uid}`);
        const cartData = response.data.data;

        // Calculate cart details
        const cartDetail = calculateCartDetails(cartData.items);

        return {
            cart: cartData.items || [],
            cartDetail,
            cartID: cartData.cartID
        };
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

// Add item to cart
export const addToCart = async (item) => {
    try {
        const uid = await getUserIdWithFallback();
        const response = await axiosInstance.post(`/cart/${uid}/add`, item);
        const cartData = response.data.data;

        // Calculate cart details
        const cartDetail = calculateCartDetails(cartData.items);

        return {
            cart: cartData.items || [],
            cartDetail,
            cartID: cartData.cartID
        };
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

// Update cart item
export const updateCartItem = async (productID, quantities) => {
    try {
        const uid = await getUserIdWithFallback();
        const response = await axiosInstance.put(`/cart/${uid}/item/${productID}`, quantities);
        const cartData = response.data.data;

        // Calculate cart details
        const cartDetail = calculateCartDetails(cartData.items);

        return {
            cart: cartData.items || [],
            cartDetail,
            cartID: cartData.cartID
        };
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

// Remove item from cart
export const removeCartItem = async (productID) => {
    try {
        const uid = await getUserIdWithFallback();
        const response = await axiosInstance.delete(`/cart/${uid}/item/${productID}`);
        const cartData = response.data.data;

        // Calculate cart details
        const cartDetail = calculateCartDetails(cartData.items);

        return {
            cart: cartData.items || [],
            cartDetail,
            cartID: cartData.cartID
        };
    } catch (error) {
        console.error('Error removing cart item:', error);
        throw error;
    }
};

// Clear entire cart
export const clearCart = async () => {
    try {
        const uid = await getUserIdWithFallback();
        await axiosInstance.delete(`/cart/${uid}/clear`);

        return {
            cart: [],
            cartDetail: calculateCartDetails([]),
            cartID: null
        };
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};
