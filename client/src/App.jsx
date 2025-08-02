import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthPage } from "./components/pages/AuthPage";
import { MainLayout } from "./components/layout/MainLayout";
import { SnippetsPage } from "./components/pages/SnippetsPage";
import { DashboardPage } from "./components/pages/DashboardPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const handleSetAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "dark:bg-gray-700 dark:text-white",
        }}
      />
      {!token ? (
        <AuthPage onAuth={handleSetAuth} />
      ) : (
        <MainLayout user={user} onLogout={handleLogout}>
          {(currentPage) => {
            if (currentPage === "dashboard") {
              return (
                <DashboardPage
                  user={user}
                  token={token}
                  onProfileUpdate={handleProfileUpdate}
                />
              );
            }
            return <SnippetsPage token={token} />;
          }}
        </MainLayout>
      )}
    </ThemeProvider>
  );
}

export default App;
