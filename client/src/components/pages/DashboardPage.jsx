import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { createAuthAxios, API_BASE_URL } from "../../services/api";

export const DashboardPage = ({ user, token, onProfileUpdate }) => {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const authAxios = createAuthAxios(token);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("displayName", displayName);
    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }

    const promise = authAxios.put("/user/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.promise(promise, {
      loading: "Updating profile...",
      success: (response) => {
        const updatedUser = { ...user, ...response.data };
        onProfileUpdate(updatedUser);
        setProfilePictureFile(null);
        setPreviewUrl("");
        return "Profile updated successfully!";
      },
      error: "Could not update profile.",
    });
  };

  const profilePicUrl = user.hasProfilePicture
    ? `${API_BASE_URL}/user/profile-picture/${
        user.id
      }?t=${new Date().getTime()}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Profile Settings
      </h1>
      <div className="max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={previewUrl || profilePicUrl}
              alt="Profile Preview"
              className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 object-cover"
            />
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Change Photo
            </label>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
