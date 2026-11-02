import type { Meta, StoryObj } from "@storybook/react";
import css from "../Flex/Flex.stories.module.css";
import { Wrap } from "./Wrap";

const items = ["Design systems", "React", "TypeScript", "Accessibility", "CSS"];

const meta: Meta<typeof Wrap> = {
  title: "Components/Layout/Wrap",
  component: Wrap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A horizontal Flex preset that wraps children onto additional lines, centers them on the cross axis, and starts with four spacing units between items. Wrapping and every other default remain overridable.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Wrap>;

export const Default: Story = {
  args: {
    gap: 4,
    className: css.frame,
    style: { maxWidth: "26rem" },
    children: items.map((item) => (
      <span key={item} className={css.item}>
        {item}
      </span>
    )),
  },
};

export const SeparateAxisSpacing: Story = {
  args: {
    elementType: "ul",
    "aria-label": "Topics",
    className: css.list,
    style: { maxWidth: "26rem" },
    gap: 4,
    rowGap: 2,
    columnGap: "1.5rem",
    children: items.map((item) => (
      <li key={item} className={css.item}>
        {item}
      </li>
    )),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A semantic list with two spacing units between rows and an explicit 1.5rem between columns. rowGap and columnGap override gap independently and also accept responsive objects.",
      },
    },
  },
};
