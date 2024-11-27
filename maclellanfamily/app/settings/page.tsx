"use client";

import { useState } from "react";
import { updateEmail, updatePassword } from "firebase/auth";
import { auth } from "../api/firebase/firebase"; // Path to your Firebase configuration
import { login, logout } from "../api/firebase/auth"; // Functions from your `auth.ts`

const SettingsPage: React.FC = () => {
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [folderPath, setFolderPath] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChangeEmail = async () => {
    try {
      if (!currentEmail || !newEmail) {
        setErrorMessage("Both current and new email are required.");
        return;
      }
      // Reauthenticate user (mock login to reverify credentials before updating email)
      await login(currentEmail, currentPassword);
      // Update email in Firebase
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, newEmail);
        setErrorMessage(null);
        setSuccessMessage("Email successfully updated!");
      } else {
        setErrorMessage("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error changing email:", error);
      setErrorMessage("Failed to update email. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword) {
        setErrorMessage("Both current and new passwords are required.");
        return;
      }
      // Reauthenticate user
      await login(currentEmail, currentPassword);
      // Update password in Firebase
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setErrorMessage(null);
        setSuccessMessage("Password successfully updated!");
      } else {
        setErrorMessage("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage("Failed to update password. Please try again.");
    }
  };

  const handleUploadPlaceholder = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        setErrorMessage("No file selected.");
        return;
      }
      // Placeholder logic: Replace with actual upload functionality (e.g., Firebase Storage or AWS S3)
      console.log("Uploading file:", file.name);
      setErrorMessage(null);
      setSuccessMessage("File successfully uploaded!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage("Failed to upload file. Please try again.");
    }
  };

  const handleChangeFolderPath = async () => {
    try {
      if (!folderPath) {
        setErrorMessage("Folder path is required.");
        return;
      }
      // Placeholder logic: Replace with actual folder path update logic (e.g., backend API)
      console.log("Changing folder path to:", folderPath);
      setErrorMessage(null);
      setSuccessMessage("Folder path successfully updated!");
    } catch (error) {
      console.error("Error changing folder path:", error);
      setErrorMessage("Failed to update folder path. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Settings</h1>
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
        {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}
        {successMessage && <div className="text-green-500 text-center">{successMessage}</div>}

        {/* Change Email Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Change Email</h2>
          <input
            type="email"
            placeholder="Current Email"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleChangeEmail}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Update Email
          </button>
        </div>

        {/* Change Password Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Change Password</h2>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Update Password
          </button>
        </div>

        {/* Upload Placeholder Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Upload Placeholder</h2>
          <input
            type="file"
            onChange={handleUploadPlaceholder}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Change Folder Path Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Change Folder Path</h2>
          <input
            type="text"
            placeholder="New Folder Path"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleChangeFolderPath}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Update Folder Path
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
