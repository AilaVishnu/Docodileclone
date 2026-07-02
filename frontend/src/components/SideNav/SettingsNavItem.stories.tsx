import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingsNavItem } from "./SettingsNavItem";
import { LottieIcon } from "../Icon/LottieIcon";
import settingsLottie from "../../assets/lottie/settings.json";
import { colors } from "../../styles/theme";
import { SettingsSection } from "../../pages/Settings/sections";

// The Config nav item with its hover flyout. Hover the item to reveal the
// settings sub-sections to the right; click a ready row to "navigate".
const meta: Meta<typeof SettingsNavItem> = {
  title: "Navigation/SettingsNavItem",
  component: SettingsNavItem,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof SettingsNavItem>;

export const HoverFlyout: Story = {
  render: () => {
    const [section, setSection] = useState<SettingsSection>("print-template");
    return (
      // Mimics the compact rail so the flyout has a rail edge to sit against.
      <div
        style={{
          width: 95,
          padding: "24px 0",
          backgroundColor: colors.active.shade300,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SettingsNavItem
          label="Config"
          icon={<LottieIcon animationData={settingsLottie} active size={36} />}
          active
          onOpen={() => {}}
          activeSection={section}
          onSelectSection={setSection}
        />
      </div>
    );
  },
};
