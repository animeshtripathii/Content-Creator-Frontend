import axiosInstance from "./axiosInstance";

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const signup = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Signup failed";
  }
};
