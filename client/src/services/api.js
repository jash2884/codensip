import axios from "axios";

// This is the key change:
// In production (on Vercel), the API is on the same domain at the path /api.
// In development, it points to your local server.
export const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:5000/api";

// This function remains the same.
// It will now use the dynamic API_BASE_URL above.
export const createAuthAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};
