// utils/axios.ts
import axios from 'axios'


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // fallback if env not set
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }, // if using cookies/auth sessions
})

let isRefreshing = false;


// Optional: Interceptors for auth, logging, etc.
axiosInstance.interceptors.response.use(
  res => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await axiosInstance.post('/auth/refresh-token');
          isRefreshing = false;
          return axiosInstance(originalRequest); // retry the original request
        } catch (refreshError) {
          isRefreshing = false;
          // optionally: redirect to login or disconnect wallet
          console.error('Refresh token failed.');
        }
      }
    }

    return Promise.reject(err);
  }
)

export default axiosInstance
