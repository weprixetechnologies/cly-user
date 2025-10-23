import axiosInstance from './axiosInstance';

// Create address
export const createAddress = async (addressData) => {
    try {
        const response = await axiosInstance.post('/addresses', addressData);
        return response.data;
    } catch (error) {
        console.error('Error creating address:', error);
        throw error;
    }
};

// Get user addresses
export const getUserAddresses = async () => {
    try {
        const response = await axiosInstance.get('/addresses');
        return response.data;
    } catch (error) {
        console.error('Error getting addresses:', error);
        throw error;
    }
};

// Get address by ID
export const getAddressById = async (addressID) => {
    try {
        const response = await axiosInstance.get(`/addresses/${addressID}`);
        return response.data;
    } catch (error) {
        console.error('Error getting address:', error);
        throw error;
    }
};

// Update address
export const updateAddress = async (addressID, addressData) => {
    try {
        const response = await axiosInstance.put(`/addresses/${addressID}`, addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

// Delete address
export const deleteAddress = async (addressID) => {
    try {
        const response = await axiosInstance.delete(`/addresses/${addressID}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
};

// Set default address
export const setDefaultAddress = async (addressID) => {
    try {
        const response = await axiosInstance.put(`/addresses/${addressID}/set-default`);
        return response.data;
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
};
