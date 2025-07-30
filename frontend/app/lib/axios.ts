// utils/axios.ts
import axios from 'axios'


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // fallback if env not set
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }, // if using cookies/auth sessions
})

// Optional: Interceptors for auth, logging, etc.
axiosInstance.interceptors.response.use(
  res => res,
  err => {
    console.error('Axios Error:', err)
    return Promise.reject(err)
  }
)

export default axiosInstance
