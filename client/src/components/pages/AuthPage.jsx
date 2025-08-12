import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Logo } from "../ui/Logo";
import { API_BASE_URL } from "../../services/api";

export const AuthPage = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const url = isLogin
      ? `${API_BASE_URL}/users/login` // Changed "auth" to "users"
      : `${API_BASE_URL}/users`; // Changed "auth/register" to "users"
    try {
      const { data } = await axios.post(url, { username, password });
      if (isLogin) {
        onAuth(data.accessToken, data.user);
        toast.success(`Welcome back, ${data.user.username}!`);
      } else {
        toast.success("Registration successful! Please log in.");
        setIsLogin(true);
        setUsername("");
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex font-sans">
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <Logo />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isLogin
              ? "Sign in to continue to CodeSnip"
              : "Get started by creating a new account"}
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4 text-center text-sm">
                {error}
              </p>
            )}
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-1"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </form>
        </div>
      </div>
      <div className="w-1/2 min-h-screen relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
          className="absolute w-full h-full object-cover"
          alt="Coding background"
        />
        <div className="absolute inset-0 bg-indigo-900/10 dark:bg-black/50"></div>
      </div>
    </div>
  );
};
