"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ArrowButtons from "./ArrowButtons";

/**
 * Gallery component that displays a set of images in a slideshow format.
 * Users can navigate through the images using arrow buttons.
 *
 * @param {Object} props - The component props.
 * @param {string[]} props.images - An array of image URLs to display in the gallery.
 *
 * @returns {JSX.Element} The rendered gallery component.
 */
const Gallery = ({ images }) => {
  // State hooks to manage the current image index, animation, and loading state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [animation, setAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * useEffect hook that controls the animation timeout.
   * Resets the animation state after a short delay (500ms).
   */
  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => setAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [animation]);

  /**
   * Function to navigate to the next image in the gallery.
   * It checks if an animation is already running to prevent race conditions.
   * Sets direction to 1 (next) and triggers animation.
   */
  const nextImage = () => {
    if (animation) return;
    setDirection(1);
    setAnimation(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  /**
   * Function to navigate to the previous image in the gallery.
   * It checks if an animation is already running to prevent race conditions.
   * Sets direction to -1 (previous) and triggers animation.
   */
  const prevImage = () => {
    if (animation) return;
    setDirection(-1);
    setAnimation(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="relative overflow-hidden shadow-md group">
      {/* Set the height for uniformity */}
      <div className="w-full h-[15rem]">
        {/* Display loading spinner while images are loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Loading spinner */}
            <svg
              className="animate-spin h-8 w-8 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {/* Map through images and display each image with proper animation */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index === (currentIndex - 1 + images.length) % images.length
                ? "opacity-0 -translate-x-full"
                : index === (currentIndex + 1) % images.length
                ? "opacity-0 translate-x-full"
                : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Product image ${index + 1}`}
              width={400}
              height={300}
              className="w-full h-full object-cover max-h-56 object-center" // Updated to ensure all images fit uniformly
            />
          </div>
        ))}
      </div>

      {/* Image navigation controls (prev and next buttons) */}
      {images.length > 1 && (
        <div className="w-full flex justify-center py-4">
          <ArrowButtons
            onPrevClick={prevImage}
            onNextClick={nextImage}
            disabled={animation}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
