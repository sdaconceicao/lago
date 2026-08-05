import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { Key } from "react-aria-components/ComboBox";
import { fn } from "storybook/test";
import { TagsInput } from "./TagsInput";
import type { TagsInputItem } from "./TagsInput.utils";

const SKILLS: TagsInputItem[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "react", label: "React" },
  { id: "css", label: "CSS" },
  { id: "graphql", label: "GraphQL" },
  { id: "node", label: "Node.js" },
  { id: "postgres", label: "PostgreSQL" },
  { id: "docker", label: "Docker" },
  { id: "accessibility", label: "Accessibility" },
];

const meta: Meta<typeof TagsInput> = {
  component: TagsInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A tag input. Typing filters an autocomplete list, picking an option adds it as a removable chip below the field, and with `allowsCreate` text that matches no option can be added as a tag of its own. Enter adds the highlighted option or, failing that, whatever has been typed; Backspace in an empty input drops the last tag. The field itself stays one line tall at every size, so it keeps lining up with the controls beside it while the list of tags grows below it.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Skills",
    placeholder: "Search skills...",
    items: SKILLS,
    allowsCreate: false,
    tagVariant: "round",
    onChange: fn(),
    onCreate: fn(),
    onInputChange: fn(),
    onOpenChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    tagVariant: {
      control: "select",
      options: ["default", "round"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Default: Story = {
  args: {
    defaultValue: ["react", "typescript"],
  },
};

export const AddingNewItems: Story = {
  args: {
    label: "Skills",
    description: "Pick from the list, or type something new and press Enter.",
    allowsCreate: true,
    defaultValue: ["react"],
  },
  parameters: {
    docs: {
      description: {
        story:
          'With `allowsCreate`, a query that matches no option gets an "Add …" row at the bottom of the dropdown, and pressing Enter adds it without going to the row at all. A created tag\'s key is its own text, so typing the same word twice does not produce two tags. Each new item is reported through `onCreate` for callers that persist it, and it stays in the list afterwards so it can be picked again after being removed.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <TagsInput
          key={size}
          label={size === "md" ? "Medium (default)" : size}
          size={size}
          items={SKILLS}
          placeholder="Search skills..."
          allowsCreate
          defaultValue={["react", "typescript", "css"]}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TagsInput takes the same three sizes as every other field: "sm" is a compact 28px-tall field with 12px text and 20px chips, "md" (the default) is 36px with 14px text and 24px chips, and "lg" is 48px with 16px text and 32px chips. The size travels to the dropdown as well, so its rows and icons scale with the field. Because the chips live below the field rather than inside it, none of the sizes has to trade a fixed field height against showing the whole selection — the field stays one line and the tags wrap below it.',
      },
    },
  },
};

export const TagVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TagsInput
        label="Round chips (default)"
        tagVariant="round"
        items={SKILLS}
        defaultValue={["react", "typescript", "graphql"]}
      />
      <TagsInput
        label="Squared chips"
        tagVariant="default"
        items={SKILLS}
        defaultValue={["react", "typescript", "graphql"]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`tagVariant` picks the shape of the chips. "round" (the default) renders pills, which read as discrete tags; "default" uses the input border radius, matching the chips inside a MultiSelect field.',
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [selected, setSelected] = useState<Key[]>(["react"]);
      const [created, setCreated] = useState<TagsInputItem[]>([]);

      return (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <TagsInput
            label="Skills"
            items={SKILLS}
            placeholder="Search skills..."
            allowsCreate
            value={selected}
            onChange={setSelected}
            onCreate={(item) => setCreated((current) => [...current, item])}
          />
          <pre style={{ margin: 0, fontSize: 12 }}>
            {JSON.stringify(
              { value: selected, created: created.map((i) => i.label) },
              null,
              2
            )}
          </pre>
        </div>
      );
    };

    return <ControlledExample />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `value` and `onChange` to own the selection. `onChange` reports the whole set of keys after every add and remove, whichever way it happened — a dropdown row, Enter, a chip's remove button, or Backspace. `onCreate` fires alongside it for keys that did not come from `items`, which is what a caller persisting new options needs.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TagsInput label="Empty" items={SKILLS} placeholder="Search skills..." />
      <TagsInput
        label="With description"
        description="Add up to ten skills"
        placeholder="Search skills..."
        items={SKILLS}
        defaultValue={["react"]}
      />
      <TagsInput
        label="Required"
        isRequired
        items={SKILLS}
        placeholder="Search skills..."
      />
      <TagsInput
        label="Invalid"
        isInvalid
        errorMessage="Add at least one skill"
        items={SKILLS}
        placeholder="Search skills..."
      />
      <TagsInput
        label="Disabled"
        isDisabled
        placeholder="Search skills..."
        items={SKILLS}
        defaultValue={["react", "typescript"]}
      />
      <TagsInput
        label="Read only"
        isReadOnly
        placeholder="Search skills..."
        items={SKILLS}
        defaultValue={["react", "typescript"]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "TagsInput states: empty, with a description, required (the label gets an asterisk), invalid with an error message below the tags, disabled, and read-only. Disabled and read-only both stop the dropdown from opening; disabled also dims the tags and their remove buttons.",
      },
    },
  },
};
