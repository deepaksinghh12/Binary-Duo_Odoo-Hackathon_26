import axios from 'axios';

// Create an axios instance for future backend integration
const api = axios.create({
  baseURL: '/api', // Placeholder
  headers: {
    'Content-Type': 'application/json',
  }
});

export const AuthService = {
  login: async (credentials: any) => {
    // TODO: Implement actual API call when backend is ready
    // return api.post('/auth/login', credentials);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: 'Login successful (mock)' } });
      }, 1000);
    });
  },

  signup: async (userData: any) => {
    // TODO: Implement actual API call when backend is ready
    // return api.post('/auth/signup', userData);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: 'Signup successful (mock)' } });
      }, 1000);
    });
  }
};
