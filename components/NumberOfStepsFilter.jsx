"use client";

import { useState, useEffect } from "react";

/**
 * NumberOfStepsFilter component for filtering recipes by number of steps
 *
 * @component
 * @param {Object} props - Component properties
 * @param {URLSearchParams} props.searchParams - Current URL search parameters
 * @param {function} props.updateUrl - Function to update URL with new parameters
 *
 * @returns {React.ReactElement} Rendered number of steps filter input
 */
const NumberOfStepsFilter = ({ searchParams, updateUrl }) => {
  // State to manage the number of steps input
  const [numberOfSteps, setNumberOfSteps] = useState("");

  // Effect to sync input with URL parameters on initial load and parameter changes
  useEffect(() => {
    // Retrieve number of steps from URL or default to empty string
    const stepsFromUrl = searchParams.get("numberOfSteps") || "";
    setNumberOfSteps(stepsFromUrl);
  }, [searchParams]);

  /**
   * Handles changes to the number of steps input
   * Validates input to allow only numeric characters
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleNumberOfStepsChange = (event) => {
    // Destructure value from the input event
    const { value } = event.target;

    // Validate input to ensure only numeric characters are allowed
    const isValidInput = /^\d*$/.test(value);

    // Exit if input is invalid
    if (!isValidInput) return;

    // Update local state with the new value
    setNumberOfSteps(value);

    // Update URL parameters
    // Pass null if value is empty to remove the parameter
    updateUrl({ numberOfSteps: value || null });
  };

  return (
    <div className="w-full max-w-sm">
      {/* Label for accessibility and clarity */}
      <label
        htmlFor="numberOfSteps"
        className="block mb-2 text-sm font-medium text-teal-700 dark:text-teal-300"
      >
        Number of Steps
      </label>
      <div className="relative">
        {/* Number of Steps Input Field */}
        <input
          type="text"
          id="numberOfSteps"
          // Controlled input with value from state
          value={numberOfSteps}
          // Change handler for input validation and URL update
          onChange={handleNumberOfStepsChange}
          placeholder="Enter recipe steps"
          className="w-full px-4 py-2.5 
            rounded-xl border 
            border-teal-300 
            bg-white 
            dark:bg-slate-800
            text-teal-900 
            dark:border-slate-700
            placeholder-teal-500 
            dark:text-teal-300
            focus:outline-none 
            focus:ring-2 
            focus:ring-teal-500 
            focus:border-transparent 
            transition-all 
            duration-300 
            ease-in-out 
            hover:shadow-md 
            hover:border-teal-500
            flex items-center justify-between
            dark:focus:ring-teal-500/40
            dark:hover:border-slate-600"
        />
        {numberOfSteps && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-600">
            steps
          </span>
        )}
      </div>
    </div>
  );
};

export default NumberOfStepsFilter;
