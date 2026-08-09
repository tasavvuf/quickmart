import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        let token = storedToken;
        try {
          token = JSON.parse(storedToken);
        } catch {
          // raw string
        }
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error("Error setting auth header", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.response?.data?.code) {
    return error.response.data.code;
  }

  if (error?.request) {
    return "Network error. Please check your connection.";
  }

  return error?.message || fallback;
};
