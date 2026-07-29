import type { Meta, StoryFn } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { DropZone, Text } from "./DropZone";

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  args: {
    onDrop: fn(),
    onDropEnter: fn(),
    onDropExit: fn(),
    onDropMove: fn(),
    onDropActivate: fn(),
    onHoverStart: fn(),
    onHoverEnd: fn(),
    onHoverChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A drop target that accepts files via drag and drop. Use the `getDropOperation` and `onDrop` props to handle dropped items, and render `Text` inside to provide instructions.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof DropZone>;

export const Example: Story = (args) => (
  <DropZone {...args} style={{ width: 320, height: 160 }}>
    <Text>Drag files here to upload</Text>
  </DropZone>
);

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <DropZone {...args} size="sm" style={{ width: 320 }}>
      <Text>Small — drag files here</Text>
    </DropZone>
    <DropZone {...args} size="md" style={{ width: 320 }}>
      <Text>Medium (default) — drag files here</Text>
    </DropZone>
    <DropZone {...args} size="lg" style={{ width: 320 }}>
      <Text>Large — drag files here</Text>
    </DropZone>
  </div>
);

/**
 * Reads the box back from the live layout. The minimum height and block padding
 * are the drop zone's own shape rather than shared tokens, so each step has to
 * be measured to know it landed.
 *
 * `minHeight` and `boxHeight` are both asserted because the drop zone is
 * `content-box`: the minimum sizes the content, and the block padding plus the
 * 1px border sit outside it. So the 24px-apart minimums render as a box that
 * steps by 40px, and reading only the declared minimum would miss it.
 */
Sizes.play = async ({ canvasElement }) => {
  const measured = [
    ...canvasElement.querySelectorAll(".react-aria-DropZone"),
  ].map((zone) => {
    const style = getComputedStyle(zone);
    return {
      size: zone.getAttribute("data-field-size"),
      minHeight: style.minHeight,
      boxHeight: Math.round(zone.getBoundingClientRect().height),
      paddingBlock: style.paddingTop,
      paddingInline: style.paddingLeft,
      fontSize: style.fontSize,
      radius: style.borderTopLeftRadius,
    };
  });

  expect(measured).toEqual([
    {
      size: "sm",
      minHeight: "48px",
      boxHeight: 66,
      paddingBlock: "8px",
      paddingInline: "12px",
      fontSize: "12px",
      radius: "6px",
    },
    {
      size: "md",
      minHeight: "72px",
      boxHeight: 106,
      paddingBlock: "16px",
      paddingInline: "12px",
      fontSize: "14px",
      radius: "8px",
    },
    {
      size: "lg",
      minHeight: "96px",
      boxHeight: 146,
      paddingBlock: "24px",
      paddingInline: "12px",
      fontSize: "16px",
      radius: "8px",
    },
  ]);
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'DropZone supports three sizes, which scale its text, radius, block padding, and minimum height: "sm" is a compact target with 12px text, 8px of block padding, a 48px minimum height, and a 6px radius; "md" (the default) has 14px text, 16px of block padding, a 72px minimum height, and an 8px radius; "lg" is the roomy target with 16px text, 24px of block padding, and a 96px minimum height. The minimum sizes the content box, so with the padding and border the empty targets render 66px, 106px, and 146px tall — a 40px step at each size. The inline padding stays at 12px throughout, being a gutter for centred text rather than a text inset. The size follows the field scale, so a DropZone inside a `<Form size="sm">` becomes compact along with the fields around it. Unlike a TextField or Select, a DropZone is a box target rather than a single-line control, so it will never row-align with the fields beside it.',
    },
  },
};

export const Disabled: Story = (args) => (
  <DropZone {...args} isDisabled style={{ width: 320, height: 160 }}>
    <Text>Uploads are disabled</Text>
  </DropZone>
);
