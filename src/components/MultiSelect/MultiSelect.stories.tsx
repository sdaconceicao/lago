import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect, MultiSelectItem } from "./MultiSelect";

const fruits = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "carrot", name: "Carrot" },
  { id: "date", name: "Date" },
  { id: "eggplant", name: "Eggplant" },
  { id: "fig", name: "Fig" },
  { id: "grape", name: "Grape" },
];

type Fruit = (typeof fruits)[number];

const meta: Meta<typeof MultiSelect> = {
  component: MultiSelect,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A multi-select combobox. Typing in the input filters the list, options toggle with checkboxes and remain visible while the menu stays open, and selected items render as removable tags or comma-separated text. Backspace in an empty input removes the most recently selected item.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Fruits",
    placeholder: "Search fruits...",
    displayMode: "tags",
  },
  argTypes: {
    displayMode: {
      control: "select",
      options: ["tags", "text"],
    },
    children: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: (args) => (
    <MultiSelect {...args} defaultItems={fruits}>
      {(item) => (
        <MultiSelectItem id={(item as Fruit).id}>
          {(item as Fruit).name}
        </MultiSelectItem>
      )}
    </MultiSelect>
  ),
};

export const DisplayModes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <MultiSelect<Fruit>
        label="Tags display"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Text display"
        placeholder="Search fruits..."
        displayMode="text"
        defaultItems={fruits}
        defaultValue={["apple", "carrot"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'MultiSelect supports two display modes for selected items: "tags" (default) renders removable tag chips with close buttons, while "text" renders a comma-separated list. In both modes items can be toggled from the dropdown and removed with Backspace when the input is empty.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <MultiSelect<Fruit>
        label="Default"
        placeholder="Search fruits..."
        defaultItems={fruits}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="With selected items"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana", "fig"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="With description"
        placeholder="Search fruits..."
        description="Pick one or more fruits"
        defaultItems={fruits}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Invalid"
        placeholder="Search fruits..."
        isInvalid
        errorMessage="Please select at least one fruit"
        defaultItems={fruits}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Disabled"
        placeholder="Search fruits..."
        isDisabled
        defaultItems={fruits}
        defaultValue={["apple"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "MultiSelect states: default, with selected items, with a description, invalid with an error message, and disabled. The invalid state highlights the field border and shows the error below it; the disabled state prevents all interaction.",
      },
    },
  },
};
