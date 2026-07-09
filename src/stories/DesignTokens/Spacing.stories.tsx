import type { Meta, StoryObj } from "@storybook/react";
import { SpacingTokens } from "./DesignTokens";

/**
 * The spacing scale, each token rendered at its real width. See the **Setup**
 * page for how to consume and customize these tokens.
 */
const meta: Meta = {
  title: "Design Tokens/Spacing",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Spacing: StoryObj = {
  render: () => <SpacingTokens />,
};
