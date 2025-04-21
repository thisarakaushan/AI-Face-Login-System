// src/utils/api.js

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  /**
   * Get the authorization header with JWT token
   */
  getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  /**
   * Make an authenticated API request
   */
  async authRequest(endpoint, options = {}) {
    const headers = {
      ...options.headers,
      ...this.getAuthHeader(),
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle expired or invalid tokens
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login?session=expired';
      throw new Error('Session expired. Please login again.');
    }
    
    return response;
  },
  
  /**
   * Verify if the user's token is valid
   */
  async verifyToken() {
    try {
      const response = await this.authRequest('/auth/verify-token', {
        method: 'POST'
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
  
  /**
   * Log out the user
   */
  logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
};