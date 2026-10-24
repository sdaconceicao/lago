import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { TextArea } from "./TextArea";

const meta: Meta<typeof TextArea> = {
  component: TextArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A multi-line text input for longer freeform text such as comments or descriptions. TextArea includes a label, optional description, placeholder, and validation states, and shares the label, help text, and inset field styling of TextField.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Tell us a little about yourself",
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof TextArea>;

export const Default: Story = (args) => <TextArea {...args} />;

Default.args = {
  label: "Bio",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextArea {...args} size="sm" label="Small" />
    <TextArea {...args} size="md" label="Medium (default)" />
    <TextArea {...args} size="lg" label="Large" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        "TextArea uses the same text insets as TextField: 12px text and 8px horizontal padding at sm, 14px and 12px at md, and 16px and 16px at lg. A single row matches the corresponding TextField height; each additional row adds one body-text line. The native default is two rows, and the textarea remains vertically resizable.",
    },
  },
};

export const Rows: Story = (args) => (
  <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
    <TextArea {...args} label="One line" rows={1} />
    <TextArea {...args} label="Three lines" rows={3} />
    <TextArea {...args} label="Six lines" rows={6} />
  </div>
);

Rows.parameters = {
  docs: {
    description: {
      story:
        "The rows prop sets the initial number of visible text lines. Additional content scrolls within the textarea, and users can still resize it vertically.",
    },
  },
};
