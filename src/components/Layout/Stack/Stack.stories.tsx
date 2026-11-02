import type { Meta, StoryObj } from "@storybook/react";
import css from "../Flex/Flex.stories.module.css";
import { HStack } from "../HStack/HStack";
import { Stack } from "./Stack";

const meta: Meta<typeof Stack> = {
  title: "Components/Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A vertical Flex preset with stretched children and four theme spacing units between them. Semantic elements, responsive values, and all layout defaults remain overridable.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {
    gap: 4,
    className: css.frame,
    children: (
      <>
        <span className={css.item}>Overview</span>
        <span className={css.item}>Activity</span>
        <span className={css.item}>Settings</span>
      </>
    ),
  },
};

export const SemanticComposition: Story = {
  render: () => (
    <Stack elementType="section" aria-label="Project summary" gap={6}>
      <HStack justify="space-between" wrap="wrap">
        <h2>Project summary</h2>
        <span className={css.item}>Updated today</span>
      </HStack>
      <Stack direction={{ base: "column", lg: "row" }}>
        <article className={css.card}>
          <h3>Design</h3>
          <p>Review the next set of components.</p>
        </article>
        <article className={css.card}>
          <h3>Development</h3>
          <p>Build consistent layouts with shared spacing.</p>
        </article>
      </Stack>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Compose semantic sections with nested stacks. The section stays vertical, while its content switches from a column on phones to a row at lg. Native HTML styles size the cards and headings.",
      },
    },
  },
};
