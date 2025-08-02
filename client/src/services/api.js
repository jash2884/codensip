import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";

// Create a re-usable axios instance for authenticated requests
export const createAuthAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};
