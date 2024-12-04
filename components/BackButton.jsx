"use client"; // Client component to handle client-side interactions

import { ArrowLeft } from "lucide-react"; // Using Lucide icon for a more modern look

/**
 * A reusable side panel button component that navigates the user back to the previous page
 * using the browser's history.
 *
 * @component
 * @returns {JSX.Element} A styled "Back" button positioned on the left side of the screen
 *
 * @example
 * // Example usage
 * <BackButton />
 *
 * @remarks
 * - The component is designed as a client component for handling browser-side interactions.
 * - Positioned as a fixed side panel button with hover and dark mode support
 */
export default function BackButton() {
  return (
    <div className="fixed left-0 top-[6rem] -translate-y-1/2 z-50 w-16 group">
      <button
        onClick={() => window.history.back()}
        className="
          w-full 
          p-3 
          bg-teal-700
          backdrop-blur-sm 
          shadow-lg 
          rounded-r-lg 
          hover:bg-teal-600 
          hover:w-20 
          transition-all 
          duration-300 
          flex 
          items-center 
          justify-center
          dark:bg-slate-800 
          dark:hover:bg-slate-700
        "
      >
        <ArrowLeft
          className="
            text-gray-100 
            group-hover:translate-x-1 
            transition-transform 
            dark:text-gray-200
          "
          size={24}
        />
      </button>
    </div>
  );
}
