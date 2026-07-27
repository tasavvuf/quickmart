import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
  withCredentials: true,
});

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
