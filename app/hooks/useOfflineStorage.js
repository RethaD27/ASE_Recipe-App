"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for managing offline-first data storage and retrieval
 * @param storageKey - The key used to store data in localStorage/IndexedDB
 * @param initialValue - Default value if no data is stored
 */
export function useOfflineStorage(storageKey, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online/offline status
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial data load
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [storageKey]);

  /**
   * Save data to localStorage
   * @param newData - Data to be saved
   */
  const saveData = (newData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  /**
   * Filter stored data based on a predicate function
   * @param predicate - Function to filter data
   * @returns Filtered data
   */
  const filterData = (predicate) => {
    return data.filter(predicate);
  };

  return {
    data,
    setData: saveData,
    filterData,
    isOffline,
  };
}
