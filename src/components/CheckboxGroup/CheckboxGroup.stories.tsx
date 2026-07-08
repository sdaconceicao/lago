import type { Meta, StoryFn } from "@storybook/react";
import { Checkbox } from "../Checkbox/Checkbox";
import { CheckboxGroup } from "../CheckboxGroup/CheckboxGroup";

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
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
