import type { Meta, StoryFn } from "@storybook/react";
import { Radio, RadioGroup } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A set of radio buttons that lets the user select a single option from a list of mutually exclusive choices. Each Radio has a value, and the group manages the selected value, keyboard navigation, and accessibility labeling.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof RadioGroup>;

export const Example: Story = (args) => (
  <RadioGroup {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: "Favorite sport",
};
