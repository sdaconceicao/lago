import type { Meta, StoryFn } from "@storybook/react";
import { Header } from "react-aria-components/Header";
import { fn } from "storybook/test";
import { ListBox, ListBoxItem, ListBoxSection } from "./ListBox";

const meta: Meta<typeof ListBox> = {
  component: ListBox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A list of options that allows the user to select one or more items. ListBox supports single, multiple, or no selection, and can be organized into sections with headers. Items can be disabled and the list can be made scrollable.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onSelectionChange: fn(),
    onAction: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof ListBox>;

export const Example: Story = (args) => (
  <ListBox aria-label="Ice cream flavor" {...args}>
    <ListBoxItem>Chocolate</ListBoxItem>
    <ListBoxItem>Mint</ListBoxItem>
    <ListBoxItem>Strawberry</ListBoxItem>
    <ListBoxItem>Vanilla</ListBoxItem>
  </ListBox>
);

Example.args = {
  onAction: undefined,
  selectionMode: "single",
};

Example.parameters = {
  docs: {
    description: {
      story:
        "A basic ListBox with single selection. Clicking or pressing an item selects it; the selected item is highlighted.",
    },
  },
};

export const Sections: Story = (_args) => (
  <ListBox aria-label="Sandwich contents" selectionMode="multiple">
    <ListBoxSection>
      <Header>Veggies</Header>
      <ListBoxItem id="lettuce">Lettuce</ListBoxItem>
      <ListBoxItem id="tomato">Tomato</ListBoxItem>
      <ListBoxItem id="onion">Onion</ListBoxItem>
    </ListBoxSection>
    <ListBoxSection>
      <Header>Protein</Header>
      <ListBoxItem id="ham">Ham</ListBoxItem>
      <ListBoxItem id="tuna">Tuna</ListBoxItem>
      <ListBoxItem id="tofu">Tofu</ListBoxItem>
    </ListBoxSection>
    <ListBoxSection>
      <Header>Condiments</Header>
      <ListBoxItem id="mayo">Mayonaise</ListBoxItem>
      <ListBoxItem id="mustard">Mustard</ListBoxItem>
      <ListBoxItem id="ranch">Ranch</ListBoxItem>
    </ListBoxSection>
  </ListBox>
);

Sections.parameters = {
  docs: {
    description: {
      story:
        "A ListBox organized into labeled sections using ListBoxSection and Header, with multiple selection enabled so several items can be chosen at once.",
    },
  },
};
