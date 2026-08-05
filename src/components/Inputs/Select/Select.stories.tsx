import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import type { PresenceStatus } from "@/components/Feedback/StatusIndicator/StatusIndicator";
import { Avatar } from "@/components/Media/Avatar/Avatar";
import { Text } from "@/components/Typography/index";
import { Select, SelectItem } from "./Select";

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A single-select combobox. Typing in the field filters the options and the chosen option fills the field. ",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Select an item",
    onSelectionChange: fn(),
    onInputChange: fn(),
    onOpenChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof Select>;

export const Example: Story = (args) => (
  <Select {...args}>
    <SelectItem id="chocolate">Chocolate</SelectItem>
    <SelectItem id="mint">Mint</SelectItem>
    <SelectItem id="strawberry">Strawberry</SelectItem>
    <SelectItem id="vanilla">Vanilla</SelectItem>
  </Select>
);

Example.args = {
  label: "Ice cream flavor",
};

interface Person {
  id: string;
  name: string;
  role: string;
  status: PresenceStatus;
}

const people: Person[] = [
  { id: "ada", name: "Ada Lovelace", role: "Engineering", status: "online" },
  { id: "grace", name: "Grace Hopper", role: "Compilers", status: "busy" },
  { id: "alan", name: "Alan Turing", role: "Research", status: "idle" },
  {
    id: "katherine",
    name: "Katherine Johnson",
    role: "Flight dynamics",
    status: "offline",
  },
];

export const CustomItemRenderer: Story = (args) => (
  <Select {...args} defaultItems={people}>
    {(item) => {
      const person = item as Person;
      return (
        <SelectItem id={person.id} textValue={person.name}>
          <Avatar
            size="sm"
            name={person.name}
            alt=""
            status={person.status}
            statusLabel=""
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text slot="label">{person.name}</Text>
            <Text slot="description">{person.role}</Text>
          </div>
        </SelectItem>
      );
    }}
  </Select>
);

CustomItemRenderer.args = {
  label: "Assignee",
  placeholder: "Search people...",
};

CustomItemRenderer.parameters = {
  docs: {
    description: {
      story:
        'Passing a function as children renders each item yourself: the function receives an entry from defaultItems and returns a SelectItem, whose children can be any ReactNode — here an Avatar with a presence dot beside a name and role. Two things to keep in mind. Set textValue on the item: with non-string children the component has no text to fall back on, and textValue is what typeahead filtering matches and what fills the field once an option is chosen. Use Text slot="label" and slot="description" for the two lines rather than plain elements, so they pick up the dropdown\'s own label and description styling, including at the other sizes and in the highlighted state.',
    },
  },
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <Select {...args} size="sm" label="Small">
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
    <Select {...args} size="md" label="Medium (default)">
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
    <Select {...args} size="lg" label="Large">
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Select supports three sizes: "sm" renders a compact 28px-tall field with 12px text and a 20px chevron toggle, "md" (the default) a 36px-tall field with 14px text and a 24px toggle, and "lg" a roomy 48px-tall field with 16px text and a 32px toggle. The size also travels to the dropdown, so its options and check marks scale with the field. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a Select lines up with a TextField, MultiSelect, or DatePicker placed beside it in a row.',
    },
  },
};
