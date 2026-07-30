import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An indeterminate loading spinner with an optional label below it. Spinner is a ProgressCircle in its indeterminate state — it borrows that component's track, arc, and continuous spin — stacked over a caption that names what is loading. Reach for it while work of unknown length is in flight: a page hydrating, a query running, an upload with no progress to report. When the work can report progress, use ProgressBar or ProgressCircle instead, so the user can see how far along it is. The `label` becomes the spinner's accessible name; without one it announces as \"Loading\" unless you pass your own `aria-label`.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    label: "Loading…",
    size: "md",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "3rem" }}>
      <Spinner {...args} size="sm" label="Small" />
      <Spinner {...args} size="md" label="Medium (default)" />
      <Spinner {...args} size="lg" label="Large" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Spinner supports the three shared field sizes: "sm" draws a 16px circle with 12px caption text, "md" (the default) a 24px circle with 14px text, and "lg" a 32px circle with 16px text. The root renders `data-field-size`, so the caption and the gap above it come from the same `--field-*` tokens the fields use — give a spinner the same `size` as the fields or buttons it sits among and the type will match.',
      },
    },
  },
};

export const Labels: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "3rem" }}>
      <Spinner {...args} label={undefined} />
      <Spinner {...args} label="Loading" />
      <Spinner
        {...args}
        label="Loading your invoices, this can take a moment"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The label is optional and sits centered below the circle. Naming the work ("Loading your invoices…") tells the user what they are waiting on and gives the spinner its accessible name, so prefer it to a bare circle wherever there is room; a long caption wraps and stays centered. Drop the label — the leftmost example — where the surrounding copy already says what is happening, or where the spinner replaces a button label; it then announces as "Loading" unless you pass an `aria-label` of your own.',
      },
    },
  },
};

export const InContext: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 360,
        height: 200,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <Spinner {...args} label="Loading your invoices…" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The usual placement: centered in the region the content will fill, at the size of the type around it. Holding the region's dimensions while it loads keeps the rest of the layout from jumping when the content arrives.",
      },
    },
  },
};
