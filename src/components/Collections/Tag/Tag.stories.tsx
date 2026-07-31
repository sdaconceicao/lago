import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { Key } from "react-aria-components/ListBox";
import { TagGroup } from "./TagGroup/TagGroup";
import { Tag } from "./TagItem/Tag";

const FLAVORS = [
  { id: "chocolate", label: "Chocolate" },
  { id: "mint", label: "Mint" },
  { id: "strawberry", label: "Strawberry" },
  { id: "vanilla", label: "Vanilla" },
];

/**
 * A TagGroup whose tags can actually be removed. The chips are real state, so
 * the remove buttons take effect instead of only rendering — which is what a
 * reader clicking one expects to happen.
 */
const RemovableTagGroup = ({
  label,
  size,
  variant,
}: {
  label: string;
  size?: "sm" | "md";
  variant?: "default" | "round";
}) => {
  const [flavors, setFlavors] = useState(FLAVORS);

  return (
    <TagGroup
      label={label}
      size={size}
      variant={variant}
      items={flavors}
      onRemove={(keys) =>
        setFlavors((current) => current.filter((f) => !keys.has(f.id)))
      }
      renderEmptyState={() => "All flavors removed."}
    >
      {(flavor) => <Tag id={flavor.id}>{flavor.label}</Tag>}
    </TagGroup>
  );
};

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
  // No `onAction` spy here on purpose. React Aria treats a collection item that
  // has an action as an action item rather than a selectable one, so an
  // `onAction` in these args would be spread onto every Tag and silently stop
  // clicks from selecting anything.
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    children: "Chocolate",
    isDisabled: false,
  },
  render: (args) => (
    <TagGroup label="Ice cream flavor">
      <Tag {...args} id="chocolate" />
    </TagGroup>
  ),
};

export const Selection: Story = {
  render: () => {
    const SelectionExample = () => {
      const [single, setSingle] = useState<Set<Key>>(new Set(["mint"]));
      const [multiple, setMultiple] = useState<Set<Key>>(
        new Set(["chocolate", "vanilla"])
      );

      return (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <TagGroup
            label="Single selection"
            selectionMode="single"
            selectedKeys={single}
            onSelectionChange={(keys) => setSingle(keys as Set<Key>)}
            items={FLAVORS}
          >
            {(flavor) => <Tag id={flavor.id}>{flavor.label}</Tag>}
          </TagGroup>
          <TagGroup
            label="Multiple selection"
            selectionMode="multiple"
            selectedKeys={multiple}
            onSelectionChange={(keys) => setMultiple(keys as Set<Key>)}
            items={FLAVORS}
          >
            {(flavor) => <Tag id={flavor.id}>{flavor.label}</Tag>}
          </TagGroup>
          <TagGroup
            label="Disabled keys"
            selectionMode="multiple"
            disabledKeys={["strawberry"]}
            items={FLAVORS}
          >
            {(flavor) => <Tag id={flavor.id}>{flavor.label}</Tag>}
          </TagGroup>
        </div>
      );
    };

    return <SelectionExample />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "A TagGroup selects tags when `selectionMode` is `single` or `multiple`; selected chips fill with the theme tint. Keys listed in `disabledKeys` render dimmed and cannot be selected. Note that a Tag given an `onAction` becomes an action item instead, and clicking it will no longer change the selection.",
      },
    },
  },
};

export const Removable: Story = {
  render: () => <RemovableTagGroup label="Ice cream flavors" />,
  parameters: {
    docs: {
      description: {
        story:
          "Passing `onRemove` to the TagGroup renders a remove button on every chip. The handler receives the set of keys to drop, so the group's items have to be state the handler updates — a no-op handler still renders the buttons but nothing disappears when they are pressed. Removing every tag falls back to `renderEmptyState`.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <RemovableTagGroup label="Small (default)" size="sm" />
      <RemovableTagGroup label="Medium" size="md" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TagGroup supports two size variants: "sm" (default) renders compact chips, "md" renders field-height chips that match form field controls, as used inside the MultiSelect and TagsInput. At "md" the chip metrics come from the `--field-*` scope, so a group placed inside a sized field grows and shrinks with it.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <RemovableTagGroup label="Default (input radius)" variant="default" />
      <RemovableTagGroup label="Round (pill)" variant="round" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TagGroup supports two shape variants: "default" uses the same border radius as inputs for a more squared-off chip (used inside the MultiSelect), and "round" renders fully rounded pill chips (used by the TagsInput).',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TagGroup label="With description" description="Your favorite flavors">
        <Tag id="chocolate">Chocolate</Tag>
        <Tag id="mint">Mint</Tag>
      </TagGroup>
      <TagGroup label="With error" errorMessage="Pick at least three flavors">
        <Tag id="chocolate">Chocolate</Tag>
      </TagGroup>
      <TagGroup label="Disabled" isDisabled onRemove={() => {}}>
        <Tag id="chocolate">Chocolate</Tag>
        <Tag id="mint">Mint</Tag>
      </TagGroup>
      <TagGroup label="Empty" renderEmptyState={() => "No flavors yet."}>
        {[]}
      </TagGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "TagGroup renders an optional `description` below the chips and an `errorMessage` in the invalid color. `isDisabled` prevents interaction with the whole group, and `renderEmptyState` covers the case where the group has no tags left.",
      },
    },
  },
};
