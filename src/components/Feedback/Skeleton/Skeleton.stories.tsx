import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A placeholder in the shape of the content that is still loading, shimmering until it arrives. Three shapes cover most of what a page is made of — `box` for an image, chart or map, `circle` for an avatar or icon, and `line` for a line of text — and two arrangements, `Skeleton.Paragraph` and `Skeleton.Card`, cover the compositions that come up most. Reach for a skeleton over a Spinner when you know what the content will look like and roughly how much room it needs: holding the shape of the page keeps the layout from jumping as each piece lands. Skeletons are decorative, so they are hidden from assistive technology unless you pass a `label` — name the one that stands for the whole loading region, not each shape in it.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: "box",
    edges: "round",
    width: 320,
  },
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      <Skeleton {...args} variant="box" width={160} height={100} />
      <Skeleton {...args} variant="circle" />
      <Skeleton {...args} variant="line" width={200} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The three shapes every skeleton is built from. "box" (the default) stands in for a block of content — an image, a chart, a map — and fills its container at 120px tall until sized. "circle" stands in for an avatar or an icon, 36px across, and stays round when given only a width. "line" stands in for a single line of text, as tall as the font size it inherits, so a skeleton dropped into larger type grows with it.',
      },
    },
  },
};

export const Edges: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      <Skeleton {...args} edges="round" width={160} height={100} />
      <Skeleton {...args} edges="straight" width={160} height={100} />
      <Skeleton {...args} variant="line" edges="round" width={160} />
      <Skeleton {...args} variant="line" edges="straight" width={160} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Corners are rounded by default, at the theme radius, so a placeholder matches the cards and images it stands in for. A line rounds to a pill instead — at one line of text tall, an 8px radius is most of the height already. Pass `edges="straight"` for content that has square corners of its own, such as a full-bleed image or a table cell. A circle ignores the prop: the shape is the point.',
      },
    },
  },
};

export const Sizing: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: 320,
      }}
    >
      <Skeleton {...args} variant="line" />
      <Skeleton {...args} variant="line" width="60%" />
      <Skeleton {...args} variant="line" width={120} />
      <Skeleton {...args} variant="line" style={{ fontSize: "1.75rem" }} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`width` and `height` take a number, read as pixels, or any CSS length as a string — the first three lines here are full width, 60% and 120px. Left alone, a box or a line fills its container, which is usually what you want: size the region and let the skeletons follow it. The last line sets no height at all; it takes 1em of the font size on it, which is how a skeleton standing in for a heading is sized.",
      },
    },
  },
};

export const Paragraph: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        width: 360,
      }}
    >
      <Skeleton.Paragraph />
      <Skeleton.Paragraph lines={5} />
      <Skeleton.Paragraph edges="straight" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`Skeleton.Paragraph` stands in for a block of copy: three lines by default, the last one short and the rest alternating between two near-full widths, so it rags like prose instead of reading as a stack of identical bars. `lines` sets the count for longer or shorter passages — the last line stays short at any count — and `edges` and `lineHeight` pass down to every line.",
      },
    },
  },
};

export const Card: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", width: 480 }}>
      <Skeleton.Card />
      <Skeleton.Card />
      <Skeleton.Card />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`Skeleton.Card` is a box with a line under it — the media of a card and the title beneath it. Repeat one per item you expect while a grid or a feed loads, so the layout is already the right size when the real cards replace it. `height` sizes the box and `lineHeight` the line, leaving the card itself to fill the column it is placed in.",
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        width: 420,
        padding: "1.5rem",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Skeleton variant="circle" label="Loading your invoices" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            flex: 1,
          }}
        >
          <Skeleton variant="line" width="45%" />
          <Skeleton
            variant="line"
            width="30%"
            style={{ fontSize: "0.75rem" }}
          />
        </div>
      </div>
      <Skeleton variant="box" height={140} />
      <Skeleton.Paragraph />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The way skeletons are meant to be used: composed into the shape of the thing that is loading, at the size it will be, so nothing moves when the content arrives. Every shape shares one shimmer, so the region reads as a single object rather than as a crowd of separate animations. Only the first skeleton carries a `label` — it announces the wait once, and the rest stay hidden from assistive technology.",
      },
    },
  },
};
