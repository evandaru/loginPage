const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'; // Gunakan variabel environment dari Vite

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'lele', // Akses API key dari environment Vite
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    return await response.json();
};

export const signup = async (name, email, password) => {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'lele', // Akses API key dari environment Vite
        },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        throw new Error('Signup failed');
    }

    return await response.json();
};

// Fungsi untuk menyimpan token dan waktu login ke localStorage
export const setSession = (name, token) => {
    const loginTime = new Date().getTime(); // Mendapatkan waktu login dalam milidetik
    localStorage.setItem('user', JSON.stringify({ name, token, loginTime }));
};

// Fungsi untuk memeriksa apakah sesi masih valid
export const isSessionExpired = () => {
    const session = JSON.parse(localStorage.getItem('user'));
    if (!session) return true;

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - session.loginTime;
    // const fiveMinutes = 10 * 1000; // 5 menit dalam milidetik
    const fiveMinutes = 5 * 60 * 1000; // 5 menit dalam milidetik

    return timeDiff > fiveMinutes; // Jika lebih dari 5 menit, sesi dianggap expired
};

// Fungsi untuk menghapus sesi
export const clearSession = () => {
    localStorage.removeItem('user');
};