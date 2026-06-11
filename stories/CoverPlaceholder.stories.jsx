import { CoverPlaceholder } from '../components/ui/CoverPlaceholder';

export default {
  title: 'UI/CoverPlaceholder',
  component: CoverPlaceholder,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 90, height: 130 }}>
        <Story />
      </div>
    ),
  ],
};

export const Default = {};

export const ShelfSize = {
  decorators: [
    (Story) => (
      <div style={{ width: 90, height: 130 }}>
        <div className="book-placeholder">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const DetailSize = {
  decorators: [
    (Story) => (
      <div style={{ width: 140, height: 200 }}>
        <Story />
      </div>
    ),
  ],
};
