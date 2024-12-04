"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

/**
 * Alert component for displaying brief messages to the user.
 * Supports success and error message types with an optional auto-dismiss feature.
 *
 * @param {Object} props - The props for the component.
 * @param {string} props.message - The message to display in the alert.
 * @param {string} [props.type="success"] - The type of the alert, which determines its appearance. Possible values: `"success"`, `"error"`.
 * @param {number} [props.duration=5000] - The duration (in milliseconds) for which the alert is visible. A value of `0` disables auto-dismiss.
 * @param {Function} [props.onClose] - Callback function executed when the alert is dismissed.
 * @param {boolean} [props.isVisible=false] - Determines whether the alert is initially visible.
 *
 * @returns {JSX.Element} The rendered alert component.
 *
 * @example
 * // Example usage of the Alert component
 * <Alert
 *   message="Data saved successfully!"
 *   type="success"
 *   duration={3000}
 *   isVisible={true}
 *   onClose={() => console.log("Alert closed")}
 * />
 */
const Alert = ({
  message,
  type = "success",
  duration = 5000,
  onClose,
  isVisible = false,
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    setIsShowing(isVisible);

    if (isVisible && duration) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const baseStyles =
    "fixed left-1/2 top-24 p-4 rounded-lg shadow-lg transform -translate-x-1/2 transition-all duration-300 ease-in-out flex items-center gap-2 max-w-md z-50";

  const variants = {
    success: "bg-green-50 text-green-800 border border-green-200",
    error: "bg-red-50 text-red-800 border border-red-200",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
  };

  const translateStyle = isShowing
    ? "translate-y-0 opacity-100"
    : "-translate-y-full opacity-0 pointer-events-none";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${baseStyles} ${variants[type]} ${translateStyle}`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => {
          setIsShowing(false);
          if (onClose) onClose();
        }}
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Alert;
