'use client';

import { useState, useEffect } from 'react';
import {
  removeBackgroundFromImage,
  removeBackgroundAggressively,
} from '@/lib/image-processing';

interface ProcessedProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aggressive?: boolean;
  fallbackClassName?: string;
  onError?: () => void;
  style?: React.CSSProperties;
}

export default function ProcessedProductImage({
  src,
  alt,
  className = '',
  aggressive = false,
  fallbackClassName = '',
  onError,
  style = {},
}: ProcessedProductImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      if (!src || hasError) return;

      setIsProcessing(true);
      try {
        const imageData = src.startsWith('data:')
          ? src
          : `data:image/jpeg;base64,${src}`;
        const processed = aggressive
          ? await removeBackgroundAggressively(imageData)
          : await removeBackgroundFromImage(imageData);

        setProcessedSrc(processed);
      } catch (error) {
        console.error('Error processing image:', error);
        setHasError(true);
        onError?.();
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [src, aggressive, hasError, onError]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${fallbackClassName}`}
      >
        <span className="text-gray-400 text-xs">No Image</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      <img
        src={processedSrc || src}
        alt={alt}
        className={`${className} ${isProcessing ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
        style={{
          backgroundColor: 'transparent',
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
          flexShrink: 0,
          flexGrow: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...style,
        }}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
      />
    </div>
  );
}
