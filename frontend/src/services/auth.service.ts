import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const AuthService = {
  /**
   * Log in an existing user.
   * If the account is unverified, the backend returns otpRequired: true.
   */
  login: async (credentials: { email: string; password?: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.success && response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response;
  },

  /**
   * Register a new user. Marks unverified and triggers OTP delivery.
   */
  signup: async (userData: { name: string; email: string; password?: string; departmentId?: string; role?: string }) => {
    const response = await api.post('/auth/signup', userData);
    return response;
  },

  /**
   * Verify the 6-digit OTP code to complete login / signup.
   * On success, stores JWT token and user info.
   */
  verifyOtp: async (data: { email: string; code: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    if (response.data?.success && response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response;
  },

  /**
   * Resend an OTP code to user's email.
   */
  sendOtp: async (email: string) => {
    const response = await api.post('/auth/send-otp', { email });
    return response;
  },

  /**
   * Clear user session.
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if token exists in storage.
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
export default AuthService;
