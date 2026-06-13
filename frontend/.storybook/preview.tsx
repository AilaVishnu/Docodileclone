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

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
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
