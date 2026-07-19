import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { TagGroup } from "./TagGroup/TagGroup";
import { Tag } from "./TagItem/Tag";

const meta: Meta<typeof Tag> = {
  component: Tag,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A Tag is a compact chip that labels or categorizes content. Tags must live inside a TagGroup, which manages their selection, keyboard navigation, removal, and a shared label, and exposes the `size` and `variant` props that style the chips.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onAction: fn(),
    onPress: fn(),
    onPressStart: fn(),
    onPressEnd: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onHoverChange: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof Tag>;

export const Example: Story = (args) => (
  <TagGroup label="Ice cream flavor">
    <Tag {...args}>Chocolate</Tag>
  </TagGroup>
);

export const TagGroupUsage: Story = (args) => (
  <TagGroup label="Ice cream flavor" selectionMode="single">
    <Tag {...args}>Chocolate</Tag>
    <Tag {...args}>Mint</Tag>
    <Tag {...args}>Strawberry</Tag>
    <Tag {...args}>Vanilla</Tag>
  </TagGroup>
);
TagGroupUsage.storyName = "TagGroup Usage";
TagGroupUsage.parameters = {
  docs: {
    description: {
      story:
        "A TagGroup is a group of Tag items with a shared label. It supports selection (single or multiple) and removable chips via `onRemove`.",
    },
  },
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TagGroup label="Small (default)" size="sm" onRemove={() => {}}>
      <Tag {...args}>Chocolate</Tag>
      <Tag {...args}>Mint</Tag>
      <Tag {...args}>Strawberry</Tag>
    </TagGroup>
    <TagGroup label="Medium" size="md" onRemove={() => {}}>
      <Tag {...args}>Chocolate</Tag>
      <Tag {...args}>Mint</Tag>
      <Tag {...args}>Strawberry</Tag>
    </TagGroup>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'TagGroup supports two size variants: "sm" (default) renders compact chips, "md" renders field-height chips that match form field controls, as used inside the MultiSelect.',
    },
  },
};

export const Variants: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TagGroup
      label="Default (input radius)"
      variant="default"
      onRemove={() => {}}
    >
      <Tag {...args}>Chocolate</Tag>
      <Tag {...args}>Mint</Tag>
      <Tag {...args}>Strawberry</Tag>
    </TagGroup>
    <TagGroup label="Round (pill)" variant="round" onRemove={() => {}}>
      <Tag {...args}>Chocolate</Tag>
      <Tag {...args}>Mint</Tag>
      <Tag {...args}>Strawberry</Tag>
    </TagGroup>
  </div>
);

Variants.parameters = {
  docs: {
    description: {
      story:
        'TagGroup supports two shape variants: "default" uses the same border radius as inputs for a more squared-off chip (used inside the MultiSelect), and "round" renders fully rounded pill chips.',
    },
  },
};
