import axiosInstance from "@api/axiosInstance";

export const fetchCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw new Error('Failed to fetch current user');
    }
}
