import { StatCard } from '../components/ui/StatCard';

export default {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    isGenre: { control: 'boolean' },
  },
};

export const BooksRead = { args: { value: 42, label: 'Books Read' } };
export const AvgRating = { args: { value: '4.2', label: 'Avg Rating' } };
export const TopGenre = { args: { value: 'Fantasy', label: 'Top Genre', isGenre: true } };
export const Empty = { args: { value: '—', label: 'Top Genre', isGenre: true } };

export const AllThree = {
  render: () => (
    <div className="stats">
      <StatCard value={42} label="Books Read" />
      <StatCard value="4.2" label="Avg Rating" />
      <StatCard value="Fantasy" label="Top Genre" isGenre />
    </div>
  ),
};
