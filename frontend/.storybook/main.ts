import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  // Stories are colocated next to each component (e.g. Button/Button.stories.tsx),
  // plus any MDX docs pages.
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app', // reuse CRA's webpack/babel/TS pipeline
    '@storybook/addon-docs', // autodocs + MDX
    '@storybook/addon-a11y', // accessibility checks (mirrors the Guidelines page)
  ],
  framework: '@storybook/react-webpack5',
  staticDirs: ['../public'],
  // Pull rich prop tables from our TypeScript interfaces rather than the lighter
  // default react-docgen. propFilter hides inherited DOM props so tables stay readable.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};
export default config;
