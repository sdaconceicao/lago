import type { Meta, StoryFn } from "@storybook/react";
import { Tag, TagGroup } from "./TagGroup";

const meta: Meta<typeof TagGroup> = {
  component: TagGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof TagGroup>;

export const Example: Story = (args) => (
  <TagGroup {...args}>
    <Tag>Chocolate</Tag>
    <Tag>Mint</Tag>
    <Tag>Strawberry</Tag>
    <Tag>Vanilla</Tag>
  </TagGroup>
);

Example.args = {
  label: "Ice cream flavor",
  selectionMode: "single",
};

export const Sizes: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TagGroup label="Small (default)" size="sm" onRemove={() => {}}>
      <Tag>Chocolate</Tag>
      <Tag>Mint</Tag>
      <Tag>Strawberry</Tag>
    </TagGroup>
    <TagGroup label="Medium" size="md" onRemove={() => {}}>
      <Tag>Chocolate</Tag>
      <Tag>Mint</Tag>
      <Tag>Strawberry</Tag>
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

export const Variants: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TagGroup
      label="Default (input radius)"
      variant="default"
      onRemove={() => {}}
    >
      <Tag>Chocolate</Tag>
      <Tag>Mint</Tag>
      <Tag>Strawberry</Tag>
    </TagGroup>
    <TagGroup label="Round (pill)" variant="round" onRemove={() => {}}>
      <Tag>Chocolate</Tag>
      <Tag>Mint</Tag>
      <Tag>Strawberry</Tag>
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
