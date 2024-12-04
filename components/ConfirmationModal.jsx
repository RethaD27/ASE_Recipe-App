"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * A reusable confirmation modal component with modern design and animations
 * @component
 * @param {Object} props - The component props
 * @param {boolean} props.isOpen - Controls the visibility of the modal
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Function} props.onConfirm - Callback function when confirmation is clicked
 * @param {string} props.title - The title of the confirmation modal
 * @param {string} props.message - The message content of the modal
 * @param {string} [props.confirmText='Confirm'] - Text for the confirm button
 * @param {string} [props.cancelText='Cancel'] - Text for the cancel button
 * @param {string} [props.confirmClassName='bg-teal-500 hover:bg-teal-600 text-white'] - Custom CSS classes for confirm button
 * @param {string} [props.cancelClassName='bg-teal-100 hover:bg-gray-200 text-gray-700'] - Custom CSS classes for cancel button
 * @returns {React.ReactElement|null} The rendered confirmation modal or null
 */
const ConfirmationModal = ({
  isOpen, // Whether the modal is currently open
  onClose, // Function to close the modal
  onConfirm, // Function to handle confirmation
  title, // Modal title
  message, // Modal message
  confirmText = "Confirm", // Default confirm button text
  cancelText = "Cancel", // Default cancel button text
  confirmClassName = "bg-teal-500 hover:bg-teal-600 text-white", // Confirm button classes
  cancelClassName = "bg-teal-100 hover:bg-gray-200 text-gray-700", // Cancel button classes
}) => {
  // Create a ref to reference the modal container
  const modalRef = useRef(null);

  // Effect to handle clicking outside the modal
  useEffect(() => {
    // Function to detect clicks outside the modal
    const handleClickOutside = (event) => {
      // Check if the modal ref exists and if the click is outside the modal
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Close the modal if clicked outside
        onClose();
      }
    };

    // Add event listener only when modal is open
    if (isOpen) {
      // Listen for mousedown events on the document
      document.addEventListener("mousedown", handleClickOutside);

      // Cleanup function to remove event listener
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]); // Re-run effect when isOpen or onClose changes

  // Return null if modal is not open
  if (!isOpen) return null;

  // Render the modal with animations
  return (
    // Animate presence allows for exit animations
    <AnimatePresence>
      {/* Full screen overlay with centered content */}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {/* Animated modal container with spring-like animation */}
        <motion.div
          ref={modalRef} // Attach ref for outside click detection
          initial={{ opacity: 0, scale: 0.9 }} // Initial animation state
          animate={{ opacity: 1, scale: 1 }} // Animate to full opacity and scale
          exit={{ opacity: 0, scale: 0.9 }} // Exit animation
          transition={{ type: "spring", stiffness: 300, damping: 20 }} // Smooth spring transition
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-200 hover:text-gray-700 transition-colors"
          >
            <X size={24} /> {/* Close icon */}
          </button>

          {/* Modal title */}
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {title}
          </h2>

          {/* Modal message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {/* Action buttons container */}
          <div className="flex justify-end space-x-3">
            {/* Cancel button */}
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-lg transition-all duration-300 ${cancelClassName}`}
            >
              {cancelText}
            </button>

            {/* Confirm button */}
            <button
              onClick={onConfirm}
              className={`px-5 py-2 rounded-lg shadow-md transition-all duration-300 ${confirmClassName}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
