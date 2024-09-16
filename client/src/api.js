// frontend/src/api.js
import axios from 'axios';

// Gunakan environment variable atau hardcoded URL dari backend
const API_URL = 'https://login-page-liard-chi.vercel.app';  // Sesuaikan dengan URL backend kamu

// Fungsi untuk login
export const login = (email, password) => {
    return axios.post(`${API_URL}/login`, { email, password });
};

// Fungsi untuk signup
export const signup = (name, email, password) => {
    return axios.post(`${API_URL}/signup`, { name, email, password });
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
    const fiveMinutes = 5 * 60 * 1000; // 5 menit dalam milidetik

    return timeDiff > fiveMinutes; // Jika lebih dari 5 menit, sesi dianggap expired
};

// Fungsi untuk menghapus sesi
export const clearSession = () => {
    localStorage.removeItem('user');
};
