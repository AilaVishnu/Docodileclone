import React, { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-webpack5';
import { initialize, mswLoader } from 'msw-storybook-addon';

// Load the global design tokens so every --fs-*, --queue-*, --active-shade-* etc.
// CSS variable resolves in every story (same file the app imports in App.tsx).
import '../src/styles/globals.css';
import { handlers } from '../src/sb/handlers';

// Start the Mock Service Worker. `bypass` keeps Storybook's own asset requests
// quiet; data calls to the API base are matched by handlers below.
initialize({ onUnhandledRequest: 'bypass' });

/**
 * Mirrors the app's theme mechanism: data-theme="secondary" on <html> swaps the
 * --active-shade-* palette (see globals.css). Set on documentElement (not a wrapper)
 * so portalled components — Modal, Toast, PopoverMenu — also pick up the theme.
 */
const ThemeWrapper: React.FC<{ theme: string; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'secondary') root.setAttribute('data-theme', 'secondary');
    else root.removeAttribute('data-theme');
    return () => root.removeAttribute('data-theme');
  }, [theme]);
  return <>{children}</>;
};

const withTheme: Decorator = (Story, context) => (
  <ThemeWrapper theme={(context.globals.theme as string) ?? 'primary'}>
    <Story />
  </ThemeWrapper>
);

// Docodile is desktop-only (supported 1200–2560, baseline 1440). These let you
// flip between the real tiers via the Viewport toolbar to check responsiveness —
// the type/control scale steps at 1440 and clamps fluidly above 1920.
const DOCODILE_VIEWPORTS = {
  compact1200: { name: 'Compact · 1200', styles: { width: '1200px', height: '860px' } },
  baseline1440: { name: 'Baseline · 1440', styles: { width: '1440px', height: '1024px' } },
  wide1920: { name: 'Wide · 1920', styles: { width: '1920px', height: '1080px' } },
  ultrawide2560: { name: 'Ultrawide · 2560', styles: { width: '2560px', height: '1440px' } },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: { options: DOCODILE_VIEWPORTS },
    options: {
      // Sidebar order mirrors the in-app gallery taxonomy (pages/Storybook).
      storySort: {
        order: ['Foundations', 'Components', 'Patterns', 'Guidelines', '*'],
      },
    },
    // Default API mocks; override per story with parameters.msw.handlers.
    msw: { handlers },
  },
  loaders: [mswLoader],
  initialGlobals: {
    theme: 'primary',
  },
  globalTypes: {
    theme: {
      description: 'Design system theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'primary', title: 'Primary' },
          { value: 'secondary', title: 'Secondary' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
