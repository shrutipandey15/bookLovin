const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

export const loginUser = async (email, password) => {
    // const response = await fetch(`${BASE_URL}/auth/login`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ email, password }),
    // })

    // if (!response.ok) {
    //     throw new Error('Login failed')
    // }
    // return await response.json()

    await new Promise(res => setTimeout(res, 300))
    if (email === 'user@example.com' && password === 'password123') {
        return {
            token: 'fake-token-123',
            user: {
                id: 1,
                email}
            }
        }
    throw new Error('Invalid email or password')
}
