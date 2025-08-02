import React, { useState, useContext } from "react";
import { Code, Settings, Sun, Moon } from "lucide-react";
import { Logo } from "../ui/Logo";
import { ThemeContext } from "../../contexts/ThemeContext";
import { API_BASE_URL } from "../../services/api";

export const MainLayout = ({ user, onLogout, children }) => {
  const [currentPage, setCurrentPage] = useState("snippets");
  const { theme, setTheme } = useContext(ThemeContext);

  const navItems = [
    { id: "snippets", label: "My Snippets", icon: Code },
    { id: "dashboard", label: "Profile Settings", icon: Settings },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const profilePicUrl = user.hasProfilePicture
    ? `${API_BASE_URL}/user/profile-picture/${
        user.id
      }?t=${new Date().getTime()}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <aside className="w-20 lg:w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-700">
        <div>
          <div className="mb-8 hidden lg:block">
            <Logo />
          </div>
          <div className="mb-8 flex justify-center lg:hidden">
            <Code className="text-indigo-500 dark:text-indigo-400" size={28} />
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors justify-center lg:justify-start ${
                  currentPage === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <button
            onClick={toggleTheme}
            title={
              theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            }
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white justify-center lg:justify-start"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            <span className="hidden lg:inline">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
          <div className="flex items-center gap-3 p-2">
            <img
              src={profilePicUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 object-cover"
            />
            <div className="hidden lg:inline">
              <p className="font-semibold text-gray-800 dark:text-white">
                {user.displayName || user.username}
              </p>
              <button
                onClick={onLogout}
                className="text-xs text-red-500 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children(currentPage)}
      </main>
    </div>
  );
};
