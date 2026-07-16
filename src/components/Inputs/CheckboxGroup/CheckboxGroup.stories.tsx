import type { Meta, StoryFn } from "@storybook/react";
import { Checkbox } from "@/components/Inputs/Checkbox/Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A group of checkboxes that lets the user select one or more options from a list of independent choices. The group manages the selected values, keyboard navigation, and a shared label, and each child Checkbox represents a selectable option.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof CheckboxGroup>;

export const Example: Story = (args) => (
  <CheckboxGroup {...args}>
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);

Example.args = {
  label: "Favorite sports",
};
