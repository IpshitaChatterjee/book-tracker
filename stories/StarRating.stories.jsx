import { StarRating } from '../components/ui/StarRating';

export default {
  title: 'UI/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  argTypes: {
    rating: { control: { type: 'range', min: 0, max: 5, step: 1 } },
  },
};

export const FiveStars = { args: { rating: 5 } };
export const ThreeStars = { args: { rating: 3 } };
export const Onestar = { args: { rating: 1 } };
export const NoRating = { args: { rating: 0 } };
