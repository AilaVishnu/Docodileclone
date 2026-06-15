export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

if (!process.env.REACT_APP_API_URL && process.env.NODE_ENV === 'production') {
  console.error('REACT_APP_API_URL is not set. Set it to your backend URL before building for production.');
}
