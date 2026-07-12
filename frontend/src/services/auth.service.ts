import axios from 'axios';

// Create an axios instance for backend integration
const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const AuthService = {
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    return response;
  },

  signup: async (userData: any) => {
    const response = await api.post('/signup', userData);
    return response;
  },

  sendOtp: async (email: string) => {
    const response = await api.post('/send-otp', { email });
    return response;
  },

  verifyOtp: async (data: { email: string; code: string }) => {
    const response = await api.post('/verify-otp', data);
    return response;
  }
};
