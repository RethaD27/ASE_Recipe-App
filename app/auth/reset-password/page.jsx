"use client";

// Import necessary React and Next.js hooks and components
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Alert from "@/components/Alert";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

/**
 * ResetPassword Component
 *
 * Provides a user interface for resetting a password after receiving a reset token
 *
 * @component
 * @returns {JSX.Element} Rendered Reset Password page
 */
export default function ResetPassword() {
  // State variables to manage form inputs and UI state
  const [password, setPassword] = useState(""); // New password input
  const [confirmPassword, setConfirmPassword] = useState(""); // Password confirmation input
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [loading, setLoading] = useState(false); // Manage submission loading state
  const [alert, setAlert] = useState({
    show: false, // Control alert visibility
    message: "", // Alert message text
    type: "success", // Alert type (success/error)
  });

  // Next.js routing and search parameter hooks
  const router = useRouter(); // For programmatic navigation
  const searchParams = useSearchParams(); // Access URL search parameters
  const token = searchParams.get("token"); // Extract reset token from URL

  /**
   * Redirect to sign-in if no reset token is present
   * Runs on component mount and when token changes
   */
  useEffect(() => {
    if (!token) {
      // Automatically redirect if no valid reset token
      router.push("/auth/signin");
    }
  }, [token, router]);

  /**
   * Handles password reset form submission
   *
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate password match
    if (password !== confirmPassword) {
      setAlert({
        show: true,
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    // Prepare for API call
    setLoading(true);
    setAlert({ show: false, message: "", type: "success" });

    try {
      // Send password reset request to backend
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      // Parse response
      const data = await response.json();

      // Handle successful password reset
      if (response.ok) {
        setAlert({
          show: true,
          message: "Password reset successfully",
          type: "success",
        });
        // Redirect to sign-in after 2 seconds
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        // Handle API-reported errors
        setAlert({
          show: true,
          message: data.error || "Failed to reset password",
          type: "error",
        });
      }
    } catch (error) {
      // Handle unexpected errors
      setAlert({
        show: true,
        message: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  /**
   * Toggles password visibility for both input fields
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Render the reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800 p-10">
      {/* Alert component for displaying success/error messages */}
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      {/* Main reset password form container */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-700 rounded-3xl shadow-lg">
        {/* Form header with logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex dark:bg-slate-50 items-center justify-center w-12 h-12 rounded-full mb-4">
            <Image
              src="/logo.png"
              width={100}
              height={100}
              alt="Logo"
              className="h-10 w-12"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter your new password
          </p>
        </div>

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New password input field */}
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Toggle password visibility button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm password input field */}
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {/* Toggle password visibility button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-800 hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-950 dark:bg-teal-700 dark:hover:bg-teal-600 dark:focus:ring-teal-600"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Sign-in link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Remember your password?
          <Link
            href="/auth/signin"
            className="font-medium ml-1 text-teal-800 hover:text-teal-900 dark:text-teal-500 dark:hover:text-teal-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
