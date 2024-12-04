"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  PenBox,
  LogOut as LogoutIcon,
  ImagePlus,
  Trash2,
  Heart,
  ShoppingCart,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import Loader from "@/components/Loader";
import BackButton from "@/components/BackButton";

/**
 * ProfilePage component for user profile management
 * Handles user profile viewing, editing, and authentication
 * @component
 * @returns {JSX.Element} Rendered profile page
 */
export default function ProfilePage() {
  // Retrieve current user session
  const { data: session } = useSession();
  const router = useRouter();

  // State management for page interactions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    imagePreview: "",
  });

  /**
   * Fetches user profile data from server
   * @async
   * @function fetchUserProfile
   * @returns {Promise<void>} Updates user data state
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/profile");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUserData(data);
      setFormData({
        name: data.name || "",
        image: null,
        imagePreview: data.image || "/default-avatar.png",
      });
    } catch (error) {
      toast.error("Failed to load profile", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchUserProfile();
  }, [session, router, fetchUserProfile]);

  /**
   * Handles input changes in the profile edit form
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "name") {
      setFormData((prev) => ({ ...prev, name: value }));
    }

    if (name === "image" && files && files.length > 0) {
      const file = files[0];

      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large", {
          description: "File must be less than 5MB",
        });
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Only JPEG, PNG, and WebP are allowed",
        });
        return;
      }

      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  /**
   * Submits profile update to the server
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      if (formData.name) {
        formDataToSend.append("name", formData.name);
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUserData((prevData) => ({
        ...prevData,
        name: data.name || prevData.name,
        image: data.image || prevData.image,
      }));

      toast.success("Profile Updated", {
        description: "Your profile has been successfully updated",
      });

      setIsEditing(false);
    } catch (error) {
      toast.error("Update Failed", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes the currently selected profile image
   */
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: "/default-avatar.png",
    });
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* <Toaster position="top-right" richColors /> */}

      {/* Fixed position back button */}
      <div className="fixed top-4 -left-20 z-50">
        <BackButton className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-2 hover:bg-white transition-colors dark:bg-gray-800 dark:hover:bg-gray-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 rounded-3xl"
      >
        {/* Profile Card */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col items-center"
        >
          <div className="relative group">
            <Image
              src={
                formData.imagePreview ||
                userData?.image ||
                "/default-avatar.png"
              }
              alt="Profile"
              className="h-32 w-32 sm:h-48 sm:w-48 rounded-full shadow-2xl border-4 border-slate-300 dark:border-slate-600 object-cover transition-all group-hover:scale-105"
              width={192}
              height={192}
            />
            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"
              >
                <label className="cursor-pointer mx-1 sm:mx-2">
                  <ImagePlus className="text-white h-6 w-6 sm:h-10 sm:w-10 hover:scale-110 transition-transform" />
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
                {formData.imagePreview !== "/default-avatar.png" && (
                  <button
                    onClick={handleRemoveImage}
                    className="cursor-pointer mx-1 sm:mx-2"
                  >
                    <Trash2 className="text-white h-6 w-6 sm:h-10 sm:w-10 hover:scale-110 hover:text-red-400 transition-transform" />
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Profile Details */}
          <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
            {userData?.name || "Your Name"}
          </h3>
          <p className="mt-1 sm:mt-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm text-center">
            {userData?.email || "your.email@example.com"}
          </p>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="w-full px-4 py-2 text-sm text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <PenBox className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <LogoutIcon className="mr-2 h-4 w-4" />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Details and Navigation */}
        <div className="col-span-1 md:col-span-2 grid grid-rows-1 sm:grid-rows-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6"
          >
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-lg sm:text-2xl text-slate-900 dark:text-slate-200 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg p-5 bg-slate-100 dark:bg-slate-700 border-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-md"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="profile-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Profile Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Name:</strong> {userData?.name}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Email:</strong> {userData?.email}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* My Pages Navigation */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              My Pages
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <NavLink
                href="/favorites"
                icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
                label="Favourites"
              />
              <NavLink
                href="/shopping-list"
                icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}
                label="Shopping"
              />
              <NavLink
                href="/downloaded-recipes"
                icon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
                label="Downloads"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Reusable Navigation Link Component
const NavLink = ({ href, icon, label }) => (
  <Link
    href={href}
    className="flex flex-col items-center justify-center p-2 sm:p-4 text-teal-800 dark:text-teal-500 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors group"
  >
    {icon}
    <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-center">
      {label}
    </span>
  </Link>
);

// Error Display Component
const ErrorDisplay = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 text-center p-4">
    <div>
      <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
      <p>{message}</p>
    </div>
  </div>
);
