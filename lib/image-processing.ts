import { useState } from 'react';

export const removeBackgroundFromImage = async (
  imageData: string
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageData);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Remove white and light backgrounds
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate brightness
        const brightness = (r + g + b) / 3;
        const maxColor = Math.max(r, g, b);
        const minColor = Math.min(r, g, b);
        const colorRange = maxColor - minColor;

        // Remove white/light backgrounds
        if (
          // Pure white or very light colors
          (r > 240 && g > 240 && b > 240) ||
          // High brightness with low color variation
          (brightness > 220 && colorRange < 30) ||
          // Very light grays
          (brightness > 200 && colorRange < 15) ||
          // Near-white colors
          (brightness > 230 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25)
        ) {
          data[i + 3] = 0; // Make transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const result = canvas.toDataURL('image/png');
      resolve(result);
    };

    img.onerror = () => {
      resolve(imageData);
    };

    img.src = imageData;
  });
};

export const removeBackgroundAggressively = async (
  imageData: string
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageData);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // More aggressive background removal
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const brightness = (r + g + b) / 3;
        const maxColor = Math.max(r, g, b);
        const minColor = Math.min(r, g, b);
        const colorRange = maxColor - minColor;

        // More aggressive thresholds
        if (
          // Pure white
          (r > 235 && g > 235 && b > 235) ||
          // High brightness with low color variation
          (brightness > 200 && colorRange < 50) ||
          // Light grays and near-whites
          (brightness > 180 && colorRange < 40) ||
          // Any very light color
          (r > 200 && g > 200 && b > 200) ||
          // Near-white with slight tint
          (brightness > 210 && Math.abs(r - g) < 35 && Math.abs(g - b) < 35)
        ) {
          data[i + 3] = 0; // Make transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const result = canvas.toDataURL('image/png');
      resolve(result);
    };

    img.onerror = () => {
      resolve(imageData);
    };

    img.src = imageData;
  });
};

// Hook for managing processed images
export const useImageProcessing = () => {
  const [processedImages, setProcessedImages] = useState<{
    [key: string]: string;
  }>({});
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});

  const processImage = async (
    id: string,
    imageData: string,
    aggressive = false
  ) => {
    if (processedImages[id] || processing[id]) {
      return processedImages[id];
    }

    setProcessing((prev) => ({ ...prev, [id]: true }));

    try {
      const processed = aggressive
        ? await removeBackgroundAggressively(imageData)
        : await removeBackgroundFromImage(imageData);

      setProcessedImages((prev) => ({ ...prev, [id]: processed }));
      return processed;
    } catch (error) {
      console.error('Error processing image:', error);
      return imageData;
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  return {
    processedImages,
    processing,
    processImage,
  };
};
