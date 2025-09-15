'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Maximize2, Download, Eye } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  alt?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title = "PDF Document", alt = "PDF Document" }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages, pdfUrl });
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setIsDocumentReady(true);
  }, [pdfUrl]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
    setIsLoading(false);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPage = useCallback((page: number) => {
    setPageNumber(Math.max(1, Math.min(page, numPages)));
  }, [numPages]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const downloadPDF = useCallback(() => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfUrl, title]);

  const progressPercentage = numPages > 0 ? (pageNumber / numPages) * 100 : 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight') {
        goToNextPage();
      } else if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPreviousPage, goToNextPage, isFullscreen]);

  if (error) {
    return (
      <div className="mb-3 relative">
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Failed to load PDF</p>
            <button 
              onClick={downloadPDF}
              className="mt-2 text-orange-500 hover:text-orange-600 text-sm flex items-center mx-auto"
            >
              <Download className="w-4 h-4 mr-1" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-3 relative pdf-viewer-container ${isFullscreen ? 'fixed inset-0 z-50 bg-black pdf-fullscreen' : ''}`}>
      {/* PDF Header */}
      <div className="bg-white border-b border-gray-200 p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {title}
            </h3>
            <p className="text-xs text-gray-500">
              {numPages > 0 ? `${numPages} pages` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPDF}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className={`relative bg-gray-50 ${isFullscreen ? 'h-full' : 'h-80'} overflow-hidden`}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* PDF Document */}
        <div className="h-full flex items-center justify-center p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading PDF...</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={isFullscreen ? 1.2 : 0.8}
              className="shadow-lg"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        {/* Navigation Controls */}
        {numPages > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all duration-200"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all duration-200"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* PDF Footer with Progress */}
      {numPages > 1 && (
        <div className="bg-white border-t border-gray-200 p-3 rounded-b-lg">
          {/* Page Counter and Navigation */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Page {pageNumber} of {numPages}
              </span>
              {isDocumentReady && (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={pageNumber}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= numPages) {
                        goToPage(page);
                      }
                    }}
                    className="w-12 h-6 text-xs text-center border border-gray-300 rounded px-1"
                    title="Go to page"
                  />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Page Dots */}
          <div className="flex justify-center space-x-1">
            {Array.from({ length: Math.min(numPages, 10) }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    pageNum === pageNumber
                      ? 'bg-orange-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={`Go to page ${pageNum}`}
                />
              );
            })}
            {numPages > 10 && (
              <span className="text-xs text-gray-400 ml-2">
                ...{numPages}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            title="Exit fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
