"use client";

import { useState } from "react";
import Image from "next/image";
import ArrowButtons from "./ArrowButtons";

/**
 * ImageSelector component that allows users to view and select images from a gallery.
 * Displays a main selected image and thumbnails that can be clicked to update the main image.
 *
 * @param {Object} props - The component props.
 * @param {string[]} props.images - An array of image URLs to display in the selector.
 *
 * @returns {JSX.Element} The rendered ImageSelector component.
 */
export default function ImageSelector({ images }) {
  // State hook to track the currently selected image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define fixed size for the images
  const fixedImageSize = { width: 500, height: 500 };

  // Handlers for arrow buttons
  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className="relative">
      {/* Main Selected Image */}
      <div className="m-2 lg:m-10 md:m-10 rounded-xl bg-gray-100 dark:bg-gray-700">
        <div
          className="rounded-xl flex lg:h-[400px] sm:h-[250px] md:h-[400px]"
        >
          <Image
            src={images[currentIndex]}
            alt="Selected"
            width={fixedImageSize.width}
            height={fixedImageSize.height}
            className="w-full h-full rounded-t-xl object-cover"
          />
        </div>

        {/* Arrow Buttons */}
        {images.length > 1 && (
          <ArrowButtons
              onPrevClick={handlePrevClick}
              onNextClick={handleNextClick}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 rounded-full p-2 focus:outline-none"
          />
        )}

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="m-6 flex flex-wrap justify-center gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className={`w-[50px] h-[50px] lg:w-[100px] lg:h-[100px] md:w-[90px] md:h-[90px] flex items-center justify-center rounded-lg shadow-sm cursor-pointer transition-transform duration-300 hover:scale-105 mb-6 ${
                  currentIndex === index ? "scale-110 shadow-lg" : "opacity-65"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover mb-8 mt-8"
                />
              </div>
            ))}
          </div>  
        )}
      </div>
    </div>
  );
}
