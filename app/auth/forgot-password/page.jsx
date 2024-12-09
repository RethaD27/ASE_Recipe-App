"use client"; // Indicates this is a client-side React component
import { useState } from "react"; // Import state management hook
import { useRouter } from "next/navigation"; // Import Next.js routing hook
import Link from "next/link"; // Import Next.js link component
import Image from "next/image"; // Import Next.js image component
import Alert from "@/components/Alert"; // Import custom Alert component

/**
 * Forgot Password page component for password reset
 * @returns {React.JSX.Element} Forgot password form with email input
 */
export default function ForgotPassword() {
  // State management for form inputs and UI
  const [email, setEmail] = useState(""); // Email input state
  const [loading, setLoading] = useState(false); // Loading state for submit button
  const [alert, setAlert] = useState({
    show: false, // Control alert visibility
    message: "", // Alert message
    type: "success", // Alert type (success/error)
  });
  const router = useRouter(); // Next.js router for navigation

  /**
   * Handles form submission for password reset
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading state
    // Reset alert state
    setAlert({ show: false, message: "", type: "success" });

    try {
      // Send password reset request to backend
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST", // HTTP method
        headers: { "Content-Type": "application/json" }, // Request headers
        body: JSON.stringify({ email }), // Send email in request body
      });

      // Parse response data
      const data = await response.json();

      // Handle successful and failed responses
      if (response.ok) {
        // Success: show success alert
        setAlert({
          show: true,
          message: "Password reset link sent to your email.",
          type: "success",
        });
      } else {
        // Error: show error alert
        setAlert({
          show: true,
          message: data.error || "Failed to send reset link",
          type: "error",
        });
      }
    } catch (error) {
      // Catch network or unexpected errors
      setAlert({
        show: true,
        message: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    // Main container with responsive and dark mode styling
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800 p-10">
      {/* Alert component for displaying messages */}
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      {/* Password reset form container */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-700 rounded-3xl shadow-lg">
        {/* Header section with logo and title */}
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
            Forgot Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter your email to reset your password
          </p>
        </div>

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email address
            </label>
            <input
              type="email"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Submit button with loading state */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-800 hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-950 dark:bg-teal-700 dark:hover:bg-teal-600 dark:focus:ring-teal-600"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Remember your password?
          <Link
            href="/auth/signin"
            className="font-medium ml-1 text-teal-600 hover:text-teal-900 dark:text-teal-500 dark:hover:text-teal-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
