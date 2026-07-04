import axiosInstance from './axiosInstance';
import { getCookie } from './cookieUtil';

/**
 * Cart service for direct API operations and local storage fallback
 */

const LOCAL_CART_KEY = 'cly_guest_cart';

// Get user ID from cookies
const getUserId = () => {
    return getCookie('uid');
};

const getUidFromAccessToken = () => {
    const token = getCookie('_at');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
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

    return uid; // Returns null if not authenticated
};

// Local storage helpers
const getLocalCart = () => {
    if (typeof window === 'undefined') return [];
    try {
        const cartStr = localStorage.getItem(LOCAL_CART_KEY);
        return cartStr ? JSON.parse(cartStr) : [];
    } catch (e) {
        console.error('Error reading local cart', e);
        return [];
    }
};

const saveLocalCart = (cartItems) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    } catch (e) {
        console.error('Error saving local cart', e);
    }
};

const clearLocalCart = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(LOCAL_CART_KEY);
    } catch (e) {
        console.error('Error clearing local cart', e);
    }
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

    // Calculate pricing using actual product prices from backend
    const subtotal = cartItems.reduce((sum, item) => {
        const itemPrice = item.productPrice || 100; // Use actual price from product data
        const quantity = item.units || 0;
        return sum + (itemPrice * quantity);
    }, 0);

    const deliveryFee = 0; // No delivery fee
    const total = subtotal; // Total equals subtotal
    const itemCount = cartItems.reduce((count, item) => {
        return count + (item.units || 0);
    }, 0);

    return {
        subtotal,
        deliveryFee,
        total,
        itemCount
    };
};

// Fetch cart from backend or local storage
export const fetchCart = async () => {
    try {
        const uid = await getUserIdWithFallback();
        
        if (!uid) {
            const localCart = getLocalCart();
            return {
                cart: localCart,
                cartDetail: calculateCartDetails(localCart),
                cartID: 'guest_cart'
            };
        }

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
        
        if (!uid) {
            const localCart = getLocalCart();
            const existingItemIndex = localCart.findIndex(i => i.productID === item.productID);
            
            if (existingItemIndex >= 0) {
                localCart[existingItemIndex].units += (item.units || 1);
            } else {
                localCart.push(item);
            }
            
            saveLocalCart(localCart);
            return {
                cart: localCart,
                cartDetail: calculateCartDetails(localCart),
                cartID: 'guest_cart'
            };
        }

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
        
        if (!uid) {
            const localCart = getLocalCart();
            const existingItemIndex = localCart.findIndex(i => i.productID === productID);
            
            if (existingItemIndex >= 0 && quantities.units) {
                localCart[existingItemIndex].units = quantities.units;
                saveLocalCart(localCart);
            }
            
            return {
                cart: localCart,
                cartDetail: calculateCartDetails(localCart),
                cartID: 'guest_cart'
            };
        }

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
        
        if (!uid) {
            const localCart = getLocalCart();
            const updatedCart = localCart.filter(i => i.productID !== productID);
            saveLocalCart(updatedCart);
            
            return {
                cart: updatedCart,
                cartDetail: calculateCartDetails(updatedCart),
                cartID: 'guest_cart'
            };
        }

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
        
        if (!uid) {
            clearLocalCart();
            return {
                cart: [],
                cartDetail: calculateCartDetails([]),
                cartID: 'guest_cart'
            };
        }

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

// Sync local cart to backend
export const syncLocalCartToBackend = async (uid) => {
    if (!uid) return;
    
    try {
        const localCart = getLocalCart();
        if (localCart && localCart.length > 0) {
            // We'll iterate through each item and call the backend to add it.
            // A more optimized way would be a bulk endpoint, but this works given the existing APIs.
            for (const item of localCart) {
                try {
                    await axiosInstance.post(`/cart/${uid}/add`, {
                        productID: item.productID,
                        productName: item.productName,
                        featuredImage: item.featuredImage,
                        boxQty: item.boxQty || 0,
                        units: item.units,
                        productPrice: item.productPrice,
                        minQty: item.minQty,
                        discount: item.discount
                    });
                } catch (e) {
                    console.error('Failed to sync item to backend:', item, e);
                }
            }
            // Clear local cart after successful sync attempts
            clearLocalCart();
        }
    } catch (error) {
        console.error('Error syncing local cart to backend:', error);
    }
};
