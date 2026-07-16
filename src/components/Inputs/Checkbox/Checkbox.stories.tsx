import type { Meta, StoryFn } from "@storybook/react";
import { CheckboxGroup } from "./CheckboxGroup/CheckboxGroup";
import { Checkbox } from "./CheckboxItem/Checkbox";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A control that lets the user select or deselect an option. A single Checkbox works standalone; wrapping several in a CheckboxGroup manages their selected values, keyboard navigation, and a shared label. Checkboxes also support an indeterminate state to represent a partially selected group.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Checkbox>;

export const Example: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <Checkbox defaultSelected>Unsubscribe</Checkbox>
  </div>
);

export const CheckboxGroupUsage: Story = () => (
  <CheckboxGroup label="Favorite sports" defaultValue={["soccer"]}>
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);
CheckboxGroupUsage.storyName = "CheckboxGroup Usage";
CheckboxGroupUsage.parameters = {
  docs: {
    description: {
      story:
        "A CheckboxGroup is a group of Checkbox items that are mutually exclusive and share a common label.",
    },
  },
};
