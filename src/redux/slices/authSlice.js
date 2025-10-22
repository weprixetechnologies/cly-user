import { createSlice } from '@reduxjs/toolkit';
import { getCookie } from '@/utils/cookieUtil';

const initialState = {
    isAuthenticated: false,
    uid: null,
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
        }
    }
});

export const { initAuthFromCookies, setLoggedOut } = authSlice.actions;
export default authSlice.reducer;
