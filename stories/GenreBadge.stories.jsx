import { GenreBadge } from '../components/ui/GenreBadge';

export default {
  title: 'UI/GenreBadge',
  component: GenreBadge,
  tags: ['autodocs'],
  argTypes: {
    genre: { control: 'text' },
  },
};

export const Fantasy = { args: { genre: 'Fantasy' } };
export const Mystery = { args: { genre: 'Mystery/Thriller' } };
export const SciFi = { args: { genre: 'Sci-Fi' } };
export const Empty = { args: { genre: '' } };

export const Multiple = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <GenreBadge genre="Fantasy" />
      <GenreBadge genre="Mystery/Thriller" />
      <GenreBadge genre="Sci-Fi" />
      <GenreBadge genre="Historical Fiction" />
      <GenreBadge genre="Literary Fiction" />
    </div>
  ),
};
