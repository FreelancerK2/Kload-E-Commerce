import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  productId: string;
  currentRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  productId,
  currentRating,
  onRatingChange,
  readonly = false,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleStarClick = (rating: number) => {
    if (readonly) return;

    setUserRating(rating);
    if (onRatingChange) {
      onRatingChange(rating);
    }

    // Save rating to localStorage
    const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
    ratings[productId] = rating;
    localStorage.setItem('productRatings', JSON.stringify(ratings));
  };

  const handleStarHover = (rating: number) => {
    if (readonly) return;
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  // Get user's rating for this product
  React.useEffect(() => {
    const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
    if (ratings[productId]) {
      setUserRating(ratings[productId]);
    }
  }, [productId]);

  const displayRating = readonly
    ? currentRating || 0
    : hoverRating || userRating || currentRating || 0;

  return (
    <div className="flex items-center">
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= (displayRating || 0) ? 'fill-current' : ''
            } ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 ml-2">
        ({displayRating.toFixed(1)})
      </span>
    </div>
  );
};

export default StarRating;
