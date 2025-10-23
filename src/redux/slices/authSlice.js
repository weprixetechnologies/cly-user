import { createSlice } from '@reduxjs/toolkit';
import { getCookie } from '@/utils/cookieUtil';

const initialState = {
    isAuthenticated: false,
    uid: null,
    user: null,
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        initAuthFromCookies(state) {
            const at = getCookie('_at');
            const rt = getCookie('_rt');
            const uid = getCookie('uid');
            state.isAuthenticated = Boolean(at && rt);
            state.uid = uid || null;
        },
        setLoggedOut(state) {
            state.isAuthenticated = false;
            state.uid = null;
            state.user = null;
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        }
    }
});

export const { initAuthFromCookies, setLoggedOut, setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
