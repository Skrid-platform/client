// src/services/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000/',
  timeout: 20000, // 20000ms = 20s
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
