import React, { memo } from "react";

const RenderImage = memo(({ index, selectedImage, setSelectedImage }) => {
  const imageNumber = index + 1;
  const imagePath = `/img/${imageNumber}.png`;

  return (
    <div
      key={index}
      className={`w-12 h-12 lg:w-16 lg:h-16 bg-cover rounded-full border-2 ${
        selectedImage === imageNumber
          ? "border-green-500 filter brightness-75"
          : "border-white"
      } cursor-pointer`}
      style={{ backgroundImage: `url(${imagePath})` }}
      onClick={() => setSelectedImage(imageNumber)}
    >
      {selectedImage === imageNumber && (
        <div className="flex items-center justify-center text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 lg:h-10 lg:w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

RenderImage.displayName = "RenderImage"; // Set display name here

export default RenderImage;
