import axiosInstance from './axiosInstance';
import { getCookie } from './cookieUtil';

/**
 * User service for fetching user data
 */

// Get user ID from cookies
const getUserId = () => {
    return getCookie('uid');
};

// Fetch user data by UID
export const fetchUserData = async (uid = null) => {
    try {
        const userId = uid || getUserId();
        if (!userId) {
            throw new Error('User ID not found');
        }

        const response = await axiosInstance.get(`/users/${userId}`);
        return response.data?.user || null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

// Fetch user data with fallback
export const fetchUserDataWithFallback = async () => {
    try {
        const uid = getUserId();
        if (!uid) {
            return null;
        }
        return await fetchUserData(uid);
    } catch (error) {
        console.error('Error fetching user data with fallback:', error);
        return null;
    }
};
