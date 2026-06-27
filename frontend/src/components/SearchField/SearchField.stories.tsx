import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { SearchField, SearchFieldProps } from "./SearchField";
import { colors, spacing } from "../../styles/theme";

const meta = {
  title: "Components/SearchField",
  component: SearchField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: colors.active.shade300, padding: spacing.xl }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Pill-shaped toolbar search (magnifier + input + clear ✕). The shared idiom used across the Bills / Pharmacy / Services / Patient Files toolbars. Controlled — owns no state itself.",
      },
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (args: Partial<SearchFieldProps>) => {
  const [v, setV] = React.useState(args.value ?? "");
  return <SearchField placeholder="Search patient or invoice no…" {...args} value={v} onChange={setV} />;
};

export const Default: Story = { render: (args) => <Demo {...args} /> };

export const WithValue: Story = { render: (args) => <Demo {...args} value="Ramesh" /> };

export const Wide: Story = { render: (args) => <Demo {...args} maxWidth={520} /> };
