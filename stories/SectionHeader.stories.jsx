import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';

export default {
  title: 'UI/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
};

export const TitleOnly = { args: { title: 'Completed Reading' } };

export const WithAction = {
  args: {
    title: 'Completed Reading',
    action: <Button variant="save">+ Add Book</Button>,
  },
};

export const DiscoverTitle = { args: { title: 'Discover the Next Read' } };
