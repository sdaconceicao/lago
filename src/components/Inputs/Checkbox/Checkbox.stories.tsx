import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
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
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
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

export const Sizes: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <CheckboxGroup label="Small" size="sm" defaultValue={["soccer"]}>
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball" description="Spring and summer">
        Baseball
      </Checkbox>
    </CheckboxGroup>
    <CheckboxGroup label="Medium (default)" size="md" defaultValue={["soccer"]}>
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball" description="Spring and summer">
        Baseball
      </Checkbox>
    </CheckboxGroup>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Checkbox supports two sizes: "sm" scales the box, label text, and spacing down so the control sits comfortably beside 28px-tall fields, and "md" (the default) is the standard control. Setting `size` on the CheckboxGroup scopes every item inside it, as shown here; a standalone Checkbox takes its own `size`, and an item may override the group. A Checkbox is not a field box, so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them — matching the size only keeps the type and control weight consistent across a compact form.',
    },
  },
};
