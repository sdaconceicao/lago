import type { Meta, StoryObj } from "@storybook/react";
import css from "../Flex/Flex.stories.module.css";
import { HStack } from "../HStack/HStack";
import { VStack } from "./VStack";

const meta: Meta<typeof VStack> = {
  title: "Components/Layout/VStack",
  component: VStack,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A vertical Flex preset with stretched children and four spacing units. VStack shares Stack's defaults and offers an explicit vertical name alongside HStack. All defaults remain overridable.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VStack>;

export const Default: Story = {
  args: {
    gap: 4,
    className: css.frame,
    children: (
      <>
        <span className={css.item}>Account</span>
        <span className={css.item}>Notifications</span>
        <span className={css.item}>Privacy</span>
      </>
    ),
  },
};

export const Alignment: Story = {
  render: () => (
    <HStack align="stretch" wrap="wrap">
      {(["stretch", "flex-start", "center", "flex-end"] as const).map(
        (align) => (
          <VStack key={align} align={align} className={css.card}>
            <strong>{align}</strong>
            <span className={css.item}>Short</span>
            <span className={css.item}>Longer content</span>
          </VStack>
        )
      )}
    </HStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Cross-axis alignment controls the width and horizontal placement of children in a vertical stack. Stretch fills the available width; start, center, and end keep each child's content width.",
      },
    },
  },
};
