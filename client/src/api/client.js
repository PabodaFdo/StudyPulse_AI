/* global __APP_API_URL__ */

import axios from 'axios';

const api = axios.create({
  baseURL: __APP_API_URL__,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;