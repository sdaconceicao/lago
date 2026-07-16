import type { Meta, StoryFn } from "@storybook/react";
import { Heading, Text } from "./Content";

const meta: Meta<typeof Heading> = {
  component: Heading,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Display components for content. `Heading` renders a styled heading element, and `Text` renders a text element for use within dialogs, cards, and other content regions.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Heading>;

export const Example: Story = (args) => (
  <div style={{ maxWidth: 320 }}>
    <Heading {...args}>Project update</Heading>
    <Text>
      This is a paragraph of supporting text. It provides additional context
      beneath the heading.
    </Text>
  </div>
);
