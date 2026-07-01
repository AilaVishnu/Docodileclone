import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MemoBoard } from './MemoBoard';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// MemoBoard persists notes to localStorage (key: docodile_memo_board). Seed a
// couple so the board isn't empty on first render. Shape mirrors the Memo type.
const seededMemos = [
  {
    id: 'memo-1',
    title: 'Follow up',
    text: 'Call Ramesh re: lab results on Monday.',
    color: '#EAE5FA',
    pinColor: '#FF8A8A',
    torn: false,
    rotation: -3,
    x: 36,
    y: 40,
    z: 1,
    pinned: false,
    createdAt: '2026-06-12T09:00:00.000Z',
  },
  {
    id: 'memo-2',
    title: 'Restock',
    text: 'Cetirizine running low — reorder this week.',
    color: '#CFEED5',
    pinColor: '#FFD400',
    torn: true,
    rotation: 2.5,
    x: 230,
    y: 90,
    z: 2,
    pinned: false,
    createdAt: '2026-06-13T08:30:00.000Z',
  },
];

const withSeededMemos = withLocalStorage({
  docodile_memo_board: JSON.stringify(seededMemos),
});

const meta = {
  title: 'Components/Board/MemoBoard',
  component: MemoBoard,
  tags: ['autodocs'],
  // No props — seed the storage keys, then give it a sized stage so the board
  // (which fills its parent) has somewhere to render.
  decorators: [
    (Story) => (
      <div style={{ width: 640, height: 420 }}>
        <Story />
      </div>
    ),
    withSeededMemos,
    withClinicSession,
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A cork board of draggable sticky notes. Notes are editable in place, can be added via the floating + button, dragged to reposition, and deleted (with undo). State persists to localStorage (key `docodile_memo_board`).',
      },
    },
  },
} satisfies Meta<typeof MemoBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
