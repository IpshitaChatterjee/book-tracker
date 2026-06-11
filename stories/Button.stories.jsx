import { Button } from '../components/ui/Button';

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['save', 'cancel', 'delete', 'edit'],
      description: 'Visual style variant',
    },
    disabled: { control: 'boolean' },
  },
};

export const Save = { args: { variant: 'save', children: 'Save Changes' } };
export const Cancel = { args: { variant: 'cancel', children: 'Cancel' } };
export const Delete = { args: { variant: 'delete', children: 'Delete' } };
export const Edit = { args: { variant: 'edit', children: 'Edit' } };
export const Disabled = { args: { variant: 'save', children: 'Save Changes', disabled: true } };

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button variant="save">Save Changes</Button>
      <Button variant="cancel">Cancel</Button>
      <Button variant="edit">Edit</Button>
      <Button variant="delete">Delete</Button>
    </div>
  ),
};
