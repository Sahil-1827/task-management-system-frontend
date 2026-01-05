import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      if (status === 401) {
        // Unauthorized
        toast.error(data.message || "Unauthorized. Please log in again.");
        // Optionally, redirect to login page
        // window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden
        toast.error(data.message || "You don't have permission to perform this action.");
      } else if (status === 404) {
        // Not Found
        toast.warn(data.message || "The requested resource was not found.");
      } else if (status >= 500) {
        // Server Error
        toast.error(data.message || "An unexpected server error occurred. Please try again later.");
      } else {
        // Other client-side errors
        toast.error(data.message || "An error occurred. Please try again.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("No response from server. Please check your network connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("An unexpected error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default api;
  