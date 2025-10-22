"use client"
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/redux/store';
import { useEffect } from 'react';
import { initAuthFromCookies } from '@/redux/slices/authSlice';

function BootstrapAuth({ children }) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(initAuthFromCookies());
    }, [dispatch]);
    return children;
}

export default function ReduxProvider({ children }) {
    return (
        <Provider store={store}>
            <BootstrapAuth>
                {children}
            </BootstrapAuth>
        </Provider>
    );
}
