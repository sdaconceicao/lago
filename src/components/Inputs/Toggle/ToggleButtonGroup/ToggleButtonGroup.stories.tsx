import type { Meta, StoryFn } from "@storybook/react";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A group of toggle buttons that can be selected independently or as a single choice, depending on the selection mode. ToggleButtonGroup manages the selected state and keyboard navigation among its ToggleButton children, often used for toolbars or option sets.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof ToggleButtonGroup>;

export const Example: Story = (args) => (
  <ToggleButtonGroup {...args}>
    <ToggleButton id="left">Left</ToggleButton>
    <ToggleButton id="center">Center</ToggleButton>
    <ToggleButton id="right">Right</ToggleButton>
  </ToggleButtonGroup>
);
