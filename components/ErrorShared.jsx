"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * A component that displays a digit with an animation effect that alternates every 3 seconds.
 *
 * @param {Object} props - The component's props.
 * @param {string | number} props.digit - The digit to display with the animation.
 * @returns {JSX.Element} The rendered span element with animated digit.
 */
export const AnimatedDigit = ({ digit }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start the animation effect by toggling isAnimating state every 3 seconds
    setIsAnimating(true);
    const timer = setInterval(() => {
      setIsAnimating((prev) => !prev);
    }, 3000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className={`inline-block transition-transform duration-700 ${
        isAnimating ? "animate-bounce" : ""
      }`}
    >
      {digit}
    </span>
  );
};

/**
 * A button component that can either be a link or a regular button.
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.href] - The URL to navigate to if it's a link button (optional).
 * @param {Function} [props.onClick] - The click handler function if it's a regular button (optional).
 * @param {React.ReactNode} props.children - The content of the button (e.g., text or elements inside the button).
 * @returns {JSX.Element} The rendered button or link element.
 */
export const Button = ({ href, onClick, children }) => {
  // Base style for button and link
  const baseStyle =
    "inline-flex items-center px-6 py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B2E]";

  if (href) {
    // Return a Link if href is provided
    return (
      <Link href={href} className={`${baseStyle} bg-[#0C3B2E]`}>
        {children}
      </Link>
    );
  }

  // Return a button if onClick is provided
  return (
    <button onClick={onClick} className={`${baseStyle} bg-[#0C3B2E]/90`}>
      {children}
    </button>
  );
};

/**
 * A layout component for displaying error messages with optional buttons.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.title - The title of the error page (e.g., "404 Not Found").
 * @param {string} props.message - The detailed error message to display.
 * @param {string} [props.code] - The error code (e.g., "404") to display with animation (optional).
 * @param {React.ReactNode} props.buttons - Custom buttons to be rendered (e.g., a retry button).
 * @returns {JSX.Element} The rendered error layout component.
 */
export const ErrorLayout = ({ title, message, code, buttons }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Make the error message fade in when the component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-64 h-64 rounded-full bg-[#0C3B2E]/5 -top-32 -left-32 animate-pulse" />
        <div className="absolute w-96 h-96 rounded-full bg-[#0C3B2E]/5 -bottom-48 -right-48 animate-pulse delay-700" />
      </div>

      {/* Main content */}
      <div
        className={`relative bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full transform transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="text-center">
          {/* Error code */}
          {code && (
            <h1 className="text-8xl font-bold text-[#0C3B2E] mb-8 tracking-tight">
              {code.split("").map((digit, idx) => (
                <AnimatedDigit key={idx} digit={digit} />
              ))}
            </h1>
          )}

          {/* Title */}
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">{title}</h2>

          {/* Message */}
          <p className="text-gray-600 mb-8">{message}</p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons}
          </div>
        </div>
      </div>
    </div>
  );
};
