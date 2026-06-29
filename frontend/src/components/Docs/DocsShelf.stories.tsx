import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DocsShelf } from './DocsShelf';
import { BookletCover } from './BookletCover';
import { colors, fonts } from '../../styles/theme';
import { DOCS_SHELVES } from '../../pages/Docs/docsContent';

const meta = {
  title: 'Patterns/Docs/DocsShelf',
  component: DocsShelf,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One labelled shelf of the Docs library — a heading, a "Full shelf →" action and a row of `BookletCover`s on a warm ledge. The full page lives in `Pages/Docs`.',
      },
    },
  },
} satisfies Meta<typeof DocsShelf>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single shelf of booklets (the “Getting started” shelf). */
export const Default: Story = {
  render: () => (
    <div style={{ padding: 28, background: colors.primary100, minHeight: 360, fontFamily: fonts.family.primary }}>
      <div style={{ maxWidth: 760 }}>
        <DocsShelf title="Getting started" onFull={() => {}}>
          {DOCS_SHELVES[0].books.map((b) => (
            <BookletCover key={b.title} {...b} onClick={() => {}} />
          ))}
        </DocsShelf>
      </div>
    </div>
  ),
};
