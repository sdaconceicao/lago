import type { Meta, StoryObj } from "@storybook/react";
import { ColorTokens } from "./DesignTokens";

/**
 * Semantic colors plus the derived gray and tint scales, read live from the
 * current theme. Toggle the **Theme** toolbar to see them change. See the
 * **Setup** page for how to consume and customize these tokens.
 */
const meta: Meta = {
  title: "Design Tokens/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Colors: StoryObj = {
  render: () => <ColorTokens />,
};
