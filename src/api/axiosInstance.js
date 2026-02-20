import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // Change to your backend URL
  withCredentials: true,
});

export default axiosInstance;
