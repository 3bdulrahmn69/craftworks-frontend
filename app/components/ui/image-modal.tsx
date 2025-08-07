'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoIosArrowForward, IoIosArrowBack, IoMdClose } from 'react-icons/io';
import { LiaDownloadSolid } from 'react-icons/lia';

interface ImageModalProps {
  isOpen: boolean;
  images: string | string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const imageArray = Array.isArray(images) ? images : [images];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(
          (prev) => (prev - 1 + imageArray.length) % imageArray.length
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % imageArray.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, imageArray.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageArray.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + imageArray.length) % imageArray.length
    );
  };

  const currentImage = imageArray[currentIndex];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[95vh] w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-destructive bg-opacity-60 text-white rounded-full p-3 hover:bg-opacity-80 transition-colors backdrop-blur-sm"
        >
          <IoMdClose size={24} />
        </button>

        {/* Navigation arrows - only show if multiple images */}
        {imageArray.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white rounded-full p-3 hover:bg-opacity-80 transition-colors backdrop-blur-sm"
            >
              <IoIosArrowBack size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white rounded-full p-3 hover:bg-opacity-80 transition-colors backdrop-blur-sm"
            >
              <IoIosArrowForward size={24} />
            </button>
          </>
        )}

        {/* Image counter */}
        {imageArray.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            {currentIndex + 1} / {imageArray.length}
          </div>
        )}

        {/* Image */}
        <div
          className="relative max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={currentImage}
            alt={`Image ${currentIndex + 1} of ${imageArray.length}`}
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={() => {
              console.error('Failed to load image:', currentImage);
            }}
            priority
          />
        </div>

        {/* Download button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = currentImage;
            link.download = `image-${currentIndex + 1}.jpg`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="absolute bottom-4 right-4 bg-primary bg-opacity-60 text-white rounded-full p-3 hover:bg-opacity-80 transition-colors backdrop-blur-sm"
          title="Download image"
        >
          <LiaDownloadSolid size={24} />
        </button>

        {/* Thumbnail strip - only show if multiple images */}
        {imageArray.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex gap-2 p-3 rounded-lg backdrop-blur-sm max-w-xs overflow-x-auto">
              {imageArray.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                    index === currentIndex
                      ? 'ring-2 ring-white'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
