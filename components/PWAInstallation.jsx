"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PWAInstallPrompt component handles the display and functionality of the PWA installation prompt.
 * @param {Object} props - Props to customize the prompt.
 * @param {string} [props.title="Install App"] - The title of the prompt.
 * @param {string} [props.description="Install our app for a better experience and offline access."] - Description text for the prompt.
 * @param {string} [props.installButtonText="Install"] - Text for the install button.
 * @param {string} [props.laterButtonText="Maybe later"] - Text for the "maybe later" button.
 * @returns {JSX.Element|null} The PWA install prompt UI or null if not applicable.
 */
export default function PWAInstallPrompt({
    title = "Install App",
    description = "Install our app for a better experience and offline access.",
    installButtonText = "Install",
    laterButtonText = "Maybe later",
}) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setShowInstallPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        // Log and handle user choice
        console.log(outcome === "accepted" ? "User accepted the install prompt" : "User dismissed the install prompt");

        // Reset state
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismissClick = () => {
        console.log("User dismissed the install prompt");
        setShowInstallPrompt(false);
    };

    // Do not show on home page
    if (!showInstallPrompt || pathname === "/") return null;

    return (
        <div
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg p-4 border border-teal-500 
                       transition-transform transform duration-300 ease-in-out z-10"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg
                        className="h-6 w-6 text-teal-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                    <div className="mt-4 flex">
                        <button
                            onClick={handleInstallClick}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm 
                                       leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 
                                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            {installButtonText}
                        </button>
                        <button
                            onClick={handleDismissClick}
                            className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm 
                                       leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 
                                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            {laterButtonText}
                        </button>
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={handleDismissClick}
                        className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}