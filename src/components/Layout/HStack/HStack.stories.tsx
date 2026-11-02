import type { Meta, StoryObj } from "@storybook/react";
import css from "../Flex/Flex.stories.module.css";
import { HStack } from "./HStack";

const meta: Meta<typeof HStack> = {
  title: "Components/Layout/HStack",
  component: HStack,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A horizontal Flex preset with centered cross-axis alignment and four spacing units between children. Direction and alignment are defaults that accept scalar or responsive overrides.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HStack>;

export const Default: Story = {
  args: {
    gap: 4,
    className: css.frame,
    children: (
      <>
        <span className={css.item}>Avatar</span>
        <span>Ada Lovelace</span>
        <span className={css.item}>Member</span>
      </>
    ),
  },
};

export const ResponsiveDirection: Story = {
  args: {
    elementType: "nav",
    "aria-label": "Project navigation",
    direction: { base: "column", md: "row" },
    align: { base: "flex-start", md: "center" },
    gap: { base: 2, md: 4 },
    children: (
      <>
        <a href="#overview">Overview</a>
        <a href="#activity">Activity</a>
        <a href="#settings">Settings</a>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "An HStack can become a column at narrow widths. This semantic navigation uses smaller spacing on phones, then restores a centered row from md without changing the document order.",
      },
    },
  },
};
