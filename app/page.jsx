"use client";

import Image from "next/image"; 
import Link from "next/link"; 
import { Telescope, LogIn } from "lucide-react";
import { useState, useEffect } from "react"; // Import useEffect and useState

/**
 * Home page component that serves as a landing page with a hero section
 * and navigation to recipes.
 *
 * @component
 * @returns {JSX.Element} The rendered home page component.
 */
export default function Home() {
  // Add state for PWA installation
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

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

    console.log(outcome === "accepted" ? "User accepted the install prompt" : "User dismissed the install prompt");

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissClick = () => {
    console.log("User dismissed the install prompt");
    setShowInstallPrompt(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden group">
      {/* Background Image with Modern Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/HomePage_Image.jpg"
          alt="Culinary Artistry Backdrop"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r 
           from-teal-900/70 dark:from-slate-900/80
           via-teal-700/50 dark:via-slate-800/60
           to-teal-500/30 dark:to-slate-700/40"
        />
      </div>
      
      {/* Content Container with Elegant Typography */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl space-y-6">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl 
               font-serif font-bold
               text-teal-50 dark:text-slate-100
               leading-tight
               drop-shadow-lg"
            >
              Culinary Exploration Awaits
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl 
               text-teal-100 dark:text-slate-300
               mb-8 max-w-2xl
               leading-relaxed"
            >
              Embark on a gastronomic journey through our meticulously curated 
              recipe collections. From innovative weeknight meals to exquisite 
              gourmet experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/recipes"
                className="flex items-center gap-2 px-6 py-3
                 bg-teal-600 dark:bg-slate-700
                 hover:bg-teal-700 dark:hover:bg-slate-600
                 text-white
                 font-semibold
                 rounded-xl
                 transition-all
                 shadow-md hover:shadow-lg"
              >
                <Telescope className="w-5 h-5" />
                Explore Recipes
              </Link>
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 px-6 py-3
                 bg-teal-500/10 dark:bg-slate-500/10
                 hover:bg-teal-500/20 dark:hover:bg-slate-500/20
                 text-teal-50 dark:text-slate-100
                 border border-teal-300/30 dark:border-slate-300/30
                 font-semibold
                 rounded-xl
                 backdrop-blur-sm
                 transition-all
                 shadow-md hover:shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Bottom Gradient */}
      <div
        className="absolute bottom-0 left-0 w-full h-24 
         bg-gradient-to-t
         from-teal-900/80 dark:from-slate-900/90
         to-transparent"
      />
    </div>
  );
}