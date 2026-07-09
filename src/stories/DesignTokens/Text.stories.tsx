import type { Meta, StoryObj } from "@storybook/react";
import { TextTokens } from "./DesignTokens";

/**
 * Font family and font-size tokens, rendered live. Toggle the **Theme** toolbar
 * to see them change. See the **Setup** page for how to consume and customize
 * these tokens.
 */
const meta: Meta = {
  title: "Design Tokens/Text",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Text: StoryObj = {
  render: () => <TextTokens />,
};
