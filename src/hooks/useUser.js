import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/redux/slices/authSlice';
import { fetchUserDataWithFallback } from '@/utils/userService';

export const useUser = () => {
    const dispatch = useDispatch();
    const { user, loading, isAuthenticated, uid } = useSelector((state) => state.auth);

    useEffect(() => {
        const loadUserData = async () => {
            if (!isAuthenticated || !uid) {
                dispatch(setUser(null));
                return;
            }

            // If user data is already loaded, don't fetch again
            if (user) {
                return;
            }

            try {
                dispatch(setLoading(true));
                const userData = await fetchUserDataWithFallback();
                dispatch(setUser(userData));
            } catch (error) {
                console.error('Error loading user data:', error);
                dispatch(setUser(null));
            } finally {
                dispatch(setLoading(false));
            }
        };

        loadUserData();
    }, [isAuthenticated, uid, user, dispatch]);

    return {
        user,
        loading,
        isAuthenticated,
        uid
    };
};
