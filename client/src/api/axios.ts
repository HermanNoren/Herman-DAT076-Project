import axios from "axios";

/**
 * Shared Axios instance for all API calls.
 *
 * `withCredentials` makes the browser attach the session cookie to every
 * request, which is how the server identifies the logged-in user — the
 * client never sends user identity in bodies or query params.
 */
export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Redirect to /login whenever the server responds with 401 (session expired or not set).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);
