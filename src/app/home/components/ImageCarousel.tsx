'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PDFViewer from './PDFViewer';

interface MediaItem {
  type: 'image' | 'video' | 'document';
  url: string;
  filename?: string;
  size?: number;
  duration?: string;
  thumbnail?: string;
}

interface ImageCarouselProps {
  media: MediaItem[];
  alt?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ media, alt = "Post media" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Helper function to detect media type from URL
  const getMediaType = (url: string, type?: string): 'image' | 'video' | 'document' => {
    if (type) return type as 'image' | 'video' | 'document';
    
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.pdf') || urlLower.includes('.doc') || urlLower.includes('.docx')) return 'document';
    if (urlLower.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) return 'video';
    return 'image';
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? media.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === media.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30; // Reduced threshold for easier swiping
    const isRightSwipe = distance < -30;

    if (isLeftSwipe && media.length > 1) {
      goToNext();
    }
    if (isRightSwipe && media.length > 1) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (media.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [media.length]);

  if (!media || media.length === 0) {
    return null;
  }

  // If only one media item, don't show carousel controls
  if (media.length === 1) {
    const singleMedia = media[0];
    return (
      <div className="mb-3 relative image-carousel-container">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
        
        {getMediaType(singleMedia.url, singleMedia.type) === 'image' ? (
          <img
            src={singleMedia.url}
            alt={alt}
            className="w-full max-h-96 object-contain rounded-lg bg-gray-50"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              console.error('Image failed to load:', singleMedia.url);
              e.currentTarget.style.display = 'none';
              setIsLoading(false);
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', singleMedia.url);
              setIsLoading(false);
            }}
          />
        ) : getMediaType(singleMedia.url, singleMedia.type) === 'video' ? (
          <video
            src={singleMedia.url}
            controls
            className="w-full max-h-96 object-contain rounded-lg bg-gray-50"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              console.error('Video failed to load:', singleMedia.url);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : getMediaType(singleMedia.url, singleMedia.type) === 'document' ? (
          <PDFViewer 
            pdfUrl={singleMedia.url} 
            title={singleMedia.filename || alt}
            alt={alt}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-3 relative group">
      {/* Main Media Display */}
      <div 
        className="relative overflow-hidden rounded-lg image-carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
        
        {getMediaType(media[currentIndex].url, media[currentIndex].type) === 'image' ? (
          <img
            src={media[currentIndex].url}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full max-h-96 object-contain transition-all duration-500 ease-in-out bg-gray-50"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              console.error('Image failed to load:', media[currentIndex].url);
              e.currentTarget.style.display = 'none';
              setIsLoading(false);
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', media[currentIndex].url);
              setIsLoading(false);
            }}
          />
        ) : getMediaType(media[currentIndex].url, media[currentIndex].type) === 'video' ? (
          <video
            src={media[currentIndex].url}
            controls
            className="w-full max-h-96 object-contain bg-gray-50"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              console.error('Video failed to load:', media[currentIndex].url);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : getMediaType(media[currentIndex].url, media[currentIndex].type) === 'document' ? (
          <PDFViewer 
            pdfUrl={media[currentIndex].url} 
            title={media[currentIndex].filename || `${alt} ${currentIndex + 1}`}
            alt={`${alt} ${currentIndex + 1}`}
          />
        ) : null}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex 
                  ? 'bg-orange-500 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Media Counter */}
      {media.length > 1 && (
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs px-3 py-1.5 rounded-full shadow-lg font-medium">
          {currentIndex + 1} / {media.length}
          {getMediaType(media[currentIndex].url, media[currentIndex].type) === 'document' && (
            <span className="ml-1 text-orange-500">📄</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
