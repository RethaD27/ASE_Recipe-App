"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Search } from "lucide-react";

/**
 * NotFoundPage Component
 *
 * @description A modern, animated 404 error page with Framer Motion
 * Provides a visually appealing and interactive experience for users
 * when a page is not found.
 *
 * @returns {JSX.Element} Animated 404 error page
 */
export default function NotFoundPage() {
  // Animation variants for different elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Floating animation for the magnifying glass
  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="text-center max-w-md w-full relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated 404 Code */}
        <motion.h1
          className="text-9xl font-bold text-teal-600 mb-4 select-none"
          variants={itemVariants}
        >
          404
        </motion.h1>

        {/* Floating Search Icon */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          variants={floatVariants}
          animate="animate"
        >
          <Search
            className="text-teal-400 dark:text-teal-300 opacity-30"
            size={120}
            strokeWidth={1}
          />
        </motion.div>

        {/* Error Message */}
        <motion.h2
          className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="text-gray-600 dark:text-gray-200 mb-8"
          variants={itemVariants}
        >
          Looks like you've wandered into uncharted territory. The page you're
          searching for might have been moved or doesn't exist.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-center space-x-4"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/recipes"
              className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors"
            >
              <Home className="mr-2" />
              Return Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
