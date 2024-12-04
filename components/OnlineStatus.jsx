'use client'; // Indicates this is a client-side component for Next.js App Router.

import { useEffect, useState } from "react";
import Alert from "./Alert"; 

export default function OnlineStatus() {
  // State to track the user's online status (true if online, false if offline).
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // State to manage the alert's properties (message, type, visibility).
  const [alert, setAlert] = useState({
    message: "", // Alert message text.
    type: "",    // Alert type (e.g., "success", "error").
    show: false, // Visibility of the alert.
  });

  useEffect(() => {
    /**
     * Updates the online status and displays an alert based on the user's connection.
     */
    const updateOnlineStatus = () => {
      const onlineStatus = navigator.onLine;
      setIsOnline(onlineStatus);


      setAlert({
        message: onlineStatus ? "Online" : "Offline. No internet. Install the app for a better experience.",
        type: onlineStatus ? "success" : "error", 
        show: true,
      });

     
      setTimeout(() => {
        setAlert((prevAlert) => ({ ...prevAlert, show: false }));
      }, 5000);
    };

    // Add event listeners to detect online and offline status changes.
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    
    const initialTimeout = setTimeout(() => {
      setAlert((prevAlert) => ({ ...prevAlert, show: false }));
    }, 5000);

    // Cleanup function to remove event listeners and clear timeout on component unmount.
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearTimeout(initialTimeout); 
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  return (
    <div>
      {/* Conditionally render the Alert component if the alert is visible. */}
      {alert.show && (
        <Alert
          message={alert.message} // Pass the alert message.
          type={alert.type}       // Pass the alert type (success/error).
          isVisible={alert.show}  // Pass the visibility state.
          onClose={() => setAlert({ ...alert, show: false })} // Hide the alert on close.
        />
      )}
    </div>
  );
}
