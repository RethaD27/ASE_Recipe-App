"use client"; // Indicates this is a client-side React component for Next.js

import { useState } from "react"; // React state management hook
import { signIn } from "next-auth/react"; // NextAuth authentication method
import { useRouter } from "next/navigation"; // Next.js routing
import { Eye, EyeOff } from "lucide-react"; // Password visibility icons
import Link from "next/link"; // Next.js link component
import Image from "next/image"; // Next.js image optimization
import Alert from "@/components/Alert"; // Custom alert component

/**
 * SignUp component for user registration with email and Google authentication
 * @component
 * @returns {JSX.Element} Signup page with form and authentication options
 */
export default function SignUp() {
  // Initialize router for navigation
  const router = useRouter();

  // State management for form and UI
  const [loading, setLoading] = useState(false); // Tracks submission loading state
  const [error, setError] = useState(""); // Stores error messages
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggles confirm password visibility

  // Form data state to manage input values
  const [formData, setFormData] = useState({
    name: "", // User's full name
    email: "", // User's email address
    password: "", // User's password
    confirmPassword: "", // Password confirmation
  });

  // Alert state for user feedback
  const [alert, setAlert] = useState({
    show: false, // Controls alert visibility
    message: "", // Alert message content
    type: "success", // Alert type (success/error)
  });

  /**
   * Handles input changes and updates form data
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e) => {
    // Dynamically update form data based on input name
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission for user signup
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      // Show error alert if passwords don't match
      setAlert({
        show: true,
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    // Set loading state and clear previous errors
    setLoading(true);
    setError("");

    try {
      // Send signup request to backend API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      // Parse response data
      const data = await res.json();

      // Handle unsuccessful responses
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Show success alert
      setAlert({
        show: true,
        message: "Account created successfully! Please sign in to continue.",
        type: "success",
      });

      // Redirect to signin page after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      // Set error message if signup fails
      setError(error.message);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth signup
   */
  const handleGoogleSignUp = () => {
    // Set loading state and initiate Google sign-in
    setLoading(true);
    signIn("google", { callbackUrl: "/recipes", redirect: true });
  };

  // Render signup page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800 p-10">
      {/* Alert component for displaying success/error messages */}
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      {/* Signup form container */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-700 rounded-3xl shadow-lg">
        {/* Logo and title section */}
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
            Create account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Please enter your details to sign up
          </p>
        </div>

        {/* Google signup button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center p-3 px-16 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              {/* Google logo path */}
              <path
                d="M12,5c1.6167603,0,3.1012573,0.5535278,4.2863159,1.4740601l3.637146-3.4699707 C17.8087769,1.1399536,15.0406494,0,12,0C7.392395,0,3.3966675,2.5999146,1.3858032,6.4098511l4.0444336,3.1929321 C6.4099731,6.9193726,8.977478,5,12,5z"
                fill="#EA4335"
              />
              <path
                d="M23.8960571,13.5018311C23.9585571,13.0101929,24,12.508667,24,12 c0-0.8578491-0.093689-1.6931763-0.2647705-2.5H12v5h6.4862061c-0.5247192,1.3637695-1.4589844,2.5177612-2.6481934,3.319458 l4.0594482,3.204834C22.0493774,19.135437,23.5219727,16.4903564,23.8960571,13.5018311z"
                fill="#4285F4"
              />
              <path
                d="M5,12c0-0.8434448,0.1568604-1.6483765,0.4302368-2.3972168L1.3858032,6.4098511 C0.5043335,8.0800171,0,9.9801636,0,12c0,1.9972534,0.4950562,3.8763428,1.3582153,5.532959l4.0495605-3.1970215 C5.1484375,13.6044312,5,12.8204346,5,12z"
                fill="#FBBC05"
              />
              <path
                d="M12,19c-3.0455322,0-5.6295776-1.9484863-6.5922241-4.6640625L1.3582153,17.532959 C3.3592529,21.3734741,7.369812,24,12,24c3.027771,0,5.7887573-1.1248169,7.8974609-2.975708l-4.0594482-3.204834 C14.7412109,18.5588989,13.4284058,19,12,19z"
                fill="#34A853"
              />
            </svg>
            <p className="ml-2 text-gray-800 dark:text-white">
              Sign up with Google
            </p>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-300">
              or
            </span>
          </div>
        </div>

        {/* Email signup form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message display */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Full name
            </label>
            <input
              name="name"
              type="text"
              required
              className="block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              className="block w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {/* Password visibility toggle */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-200" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-200" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-950 focus:border-teal-950 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:placeholder-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {/* Confirm password visibility toggle */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-200" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-200" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-800 hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-950 dark:bg-teal-700 dark:hover:bg-teal-600 dark:focus:ring-teal-600"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?
          <Link
            href="/auth/signin"
            className="font-medium ml-1 text-teal-800 hover:text-teal-900 dark:text-teal-700 dark:hover:text-teal-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
