// src/api/auth.js (Consider renaming from components/auth.js to api/auth.js)

import axiosInstance from "@api/axiosInstance";

export const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // No need to make a request if there's no token
        throw new Error('No token found');
    }

    try {
        const response = await axiosInstance.get('/auth/me', {
            // The Authorization header is likely handled by your axiosInstance interceptor,
            // but explicitly adding it here is fine too.
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        
        // Provide more specific error info if possible
        if (error.response?.status === 401) {
            // This is useful for handling expired tokens
            localStorage.removeItem('token');
            throw new Error('Unauthorized or expired token');
        }
        
        throw new Error('Failed to fetch current user');
    }
}