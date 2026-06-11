import { useState } from 'react';
import { StarRatingInput } from '../components/ui/StarRatingInput';

export default {
  title: 'UI/StarRatingInput',
  component: StarRatingInput,
  tags: ['autodocs'],
};

export const Interactive = {
  render: () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    return (
      <div>
        <StarRatingInput
          rating={rating}
          hover={hover}
          onRate={setRating}
          onHover={setHover}
          onLeave={() => setHover(0)}
        />
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          Selected: {rating || 'none'}
        </p>
      </div>
    );
  },
};

export const PrefilledRating = {
  render: () => {
    const [rating, setRating] = useState(3);
    const [hover, setHover] = useState(0);
    return (
      <StarRatingInput
        rating={rating}
        hover={hover}
        onRate={setRating}
        onHover={setHover}
        onLeave={() => setHover(0)}
      />
    );
  },
};
