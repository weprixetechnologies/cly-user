import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Async thunks
export const getCartAsync = createAsyncThunk(
    'cart/getCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/cart');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const removeCartItemAsync = createAsyncThunk(
    'cart/removeItem',
    async (cartItemID, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/cart/item/${cartItemID}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateItem',
    async ({ cartItemID, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/cart/item/${cartItemID}`, { quantity });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update item');
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete('/cart/clear');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

const initialState = {
    cart: [],
    cartDetail: null,
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCart: (state) => {
            state.cart = [];
            state.cartDetail = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get cart
            .addCase(getCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload.cart || [];
                state.cartDetail = action.payload.cartDetail || null;
            })
            .addCase(getCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Remove item
            .addCase(removeCartItemAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;
                // Remove item from cart array
                state.cart = state.cart.filter(item => item.cartItemID !== action.payload.cartItemID);
                // Update cart detail if provided
                if (action.payload.cartDetail) {
                    state.cartDetail = action.payload.cartDetail;
                }
            })
            .addCase(removeCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update item
            .addCase(updateCartItemAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;
                // Update item in cart array
                const index = state.cart.findIndex(item => item.cartItemID === action.payload.cartItemID);
                if (index !== -1) {
                    state.cart[index] = { ...state.cart[index], ...action.payload.updatedItem };
                }
                // Update cart detail if provided
                if (action.payload.cartDetail) {
                    state.cartDetail = action.payload.cartDetail;
                }
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Clear cart
            .addCase(clearCartAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(clearCartAsync.fulfilled, (state) => {
                state.loading = false;
                state.cart = [];
                state.cartDetail = null;
            })
            .addCase(clearCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
