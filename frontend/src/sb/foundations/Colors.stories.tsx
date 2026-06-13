import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { colors } from '../../styles/theme';
import { Page, Group, Grid, Swatch } from './_kit';

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const pick = (keys: string[]) =>
  keys.map((k) => ({ name: k, value: (colors as Record<string, string>)[k] }));

export const Palette: Story = {
  render: () => (
    <Page
      title="Colors"
      intro="Every colour token from styles/theme.ts. The Active theme row is CSS-variable driven — flip the Theme toolbar (top of the canvas) between Primary and Secondary to watch it swap live."
    >
      <Group label="Primary (amber)">
        <Grid>
          {pick([
            'primary100',
            'primary200',
            'primary300',
            'primary400',
            'primary500',
            'primary600',
            'primary700',
            'primary800',
          ]).map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </Grid>
      </Group>

      <Group label="Secondary (sage)">
        <Grid>
          {pick([
            'secondary50',
            'secondary100',
            'secondary200',
            'secondary300',
            'secondary400',
            'secondary500',
            'secondary600',
            'secondary700',
            'secondary800',
          ]).map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </Grid>
      </Group>

      <Group label="Neutral">
        <Grid>
          {pick([
            'neutral100',
            'neutral150',
            'neutral200',
            'neutral300',
            'neutral400',
            'neutral500',
            'neutral600',
            'neutral700',
            'neutral800',
            'neutral900',
            'neutral1000',
          ]).map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </Grid>
      </Group>

      <Group label="Status">
        <Grid>
          {pick([
            'green100',
            'green200',
            'greenAlpha10',
            'yellow100',
            'yellow200',
            'yellowAlpha10',
            'red100',
            'red200',
            'redAlpha10',
          ]).map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </Grid>
      </Group>

      <Group label="Active theme" note="These resolve via --active-shade-* and swap with the Theme toolbar.">
        <Grid>
          {[50, 100, 200, 300, 400, 500, 600, 700, 800].map((n) => (
            <Swatch
              key={n}
              name={`active.shade${n}`}
              value={(colors.active as Record<string, string>)[`shade${n}`]}
            />
          ))}
        </Grid>
      </Group>

      <Group label="Alpha / utility">
        <Grid>
          {pick(['alphaBlack0', 'alphaBlack1', 'alphaBlack2', 'alphaBlack3', 'alphaWhite1']).map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </Grid>
      </Group>
    </Page>
  ),
};
