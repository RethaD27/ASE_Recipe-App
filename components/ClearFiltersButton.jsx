"use client";

import { useRouter } from "next/navigation";

/**
 * A button component that clears all applied filters by resetting the query parameters
 * in the URL and navigating to the first page of results.
 *
 * @component
 * @returns {JSX.Element} A styled "Clear all filters" button.
 *
 * @example
 * // Example usage
 * <ClearFiltersButton />
 *
 * @remarks
 * - This component uses the Next.js `useRouter` hook for client-side navigation.
 * - When clicked, it resets the `page` query parameter to `1` and removes all other filters.
 * - Ideal for use in filterable paginated lists or search results.
 */
export default function ClearFiltersButton() {
  const router = useRouter();

  /**
   * Handles the clearing of filters by resetting query parameters
   * and navigating to the first page of results.
   */
  const handleClearFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClearFilters}
      className="mt-4 text-blue-500 hover:text-blue-700 underline"
    >
      Clear all filters
    </button>
  );
}
