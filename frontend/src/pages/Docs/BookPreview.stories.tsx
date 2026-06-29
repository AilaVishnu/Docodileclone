import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BookletCover } from '../../components/Docs/BookletCover';
import { BookReader } from '../../components/Docs/BookReader';
import { colors, fonts } from '../../styles/theme';
import { DOCS_SHELVES } from './docsContent';

/**
 * The Docs booklet reader — click a cover and it opens in a modal: the cover
 * swings open in 3D and flows into a page-flip book. Turn pages by clicking a
 * page, the ‹ › icons under the book, or the arrow keys; a dot bar shows
 * progress. Wired live into `Pages/Docs`.
 */
const meta = {
  title: 'Patterns/Docs/Book reader',
  component: BookReader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BookReader>;

export default meta;
type Story = StoryObj<typeof meta>;

const guide = DOCS_SHELVES[0].books[0]; // "How to book an appointment" (fully authored)

/** Click the cover to open the reader. */
export const Reader_: Story = {
  name: 'Reader',
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ minHeight: '100vh', background: colors.active.shade200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.family.primary }} data-theme="primary">
          <BookletCover {...guide} width={170} onClick={() => setOpen(true)} />
          {open && <BookReader book={guide} onClose={() => setOpen(false)} />}
        </div>
      );
    }
    return <Demo />;
  },
};
