'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  IoIosArrowForward,
  IoIosArrowBack,
  IoMdClose,
  IoMdRefresh,
} from 'react-icons/io';
import { MdZoomIn, MdZoomOut } from 'react-icons/md';
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % imageArray.length);
    resetZoom();
  }, [imageArray.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + imageArray.length) % imageArray.length
    );
    resetZoom();
  }, [imageArray.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === '+') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, imageArray.length, goToNext, goToPrevious]);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.8));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const maxX = (rect.width * (scale - 1)) / 2;
      const maxY = (rect.height * (scale - 1)) / 2;

      requestAnimationFrame(() => {
        setPosition({
          x: Math.max(Math.min(newX, maxX), -maxX),
          y: Math.max(Math.min(newY, maxY), -maxY),
        });
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageArray[currentIndex], { mode: 'cors' });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const currentImage = imageArray[currentIndex];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[95vh] w-full h-full flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top control bar */}
        <div className="flex justify-between items-center mb-4 z-10">
          <div className="flex items-center gap-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomOut();
                }}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Zoom Out"
                disabled={scale <= 0.8}
                aria-label="Zoom out"
              >
                <MdZoomOut size={20} className="text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Reset Zoom"
                aria-label="Reset zoom"
              >
                <IoMdRefresh size={20} className="text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomIn();
                }}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Zoom In"
                disabled={scale >= 3}
                aria-label="Zoom in"
              >
                <MdZoomIn size={20} className="text-white" />
              </button>

              <span className="text-white text-sm px-2">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Image counter */}
            {imageArray.length > 1 && (
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                {currentIndex + 1} / {imageArray.length}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="bg-black/50 text-white rounded-lg p-2 hover:bg-primary transition-colors backdrop-blur-sm"
              title="Download image"
              aria-label="Download image"
            >
              <LiaDownloadSolid size={24} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="bg-destructive/80 text-white rounded-lg p-2 hover:bg-destructive transition-colors backdrop-blur-sm"
              aria-label="Close modal"
            >
              <IoMdClose size={24} />
            </button>
          </div>
        </div>

        {/* Main image container */}
        <div
          className="relative flex-1 flex items-center justify-center overflow-hidden"
          ref={imageRef}
        >
          {/* Navigation arrows - only show if multiple images */}
          {imageArray.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 text-white rounded-full p-3 hover:bg-primary transition-colors backdrop-blur-sm"
                aria-label="Previous image"
              >
                <IoIosArrowBack size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 text-white rounded-full p-3 hover:bg-primary transition-colors backdrop-blur-sm"
                aria-label="Next image"
              >
                <IoIosArrowForward size={24} />
              </button>
            </>
          )}

          {/* Image with zoom and pan */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
            }}
          >
            <Image
              src={currentImage}
              alt={`Image ${currentIndex + 1} of ${imageArray.length}`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
              }}
              onError={() => {
                console.error('Failed to load image:', currentImage);
              }}
              priority
            />
          </div>
        </div>

        {/* Thumbnail strip - only show if multiple images */}
        {imageArray.length > 1 && (
          <div className="mt-4 z-10">
            <div className="flex justify-center gap-2 p-2 bg-black/30 backdrop-blur-sm rounded-lg max-w-full overflow-x-auto">
              {imageArray.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                    index === currentIndex
                      ? 'ring-2 ring-primary'
                      : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zoom indicator */}
        {scale > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            Use mouse to drag image • Press 0 to reset zoom
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
