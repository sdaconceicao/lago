import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { HStack } from "../HStack/HStack";
import { Stack } from "../Stack/Stack";
import { VStack } from "../VStack/VStack";
import { Wrap } from "../Wrap/Wrap";
import { Flex } from "./Flex";
import css from "./Flex.stories.module.css";

const items = (
  <>
    <span className={css.item}>First</span>
    <span className={css.item}>Second</span>
    <span className={css.item}>Third</span>
  </>
);

const meta: Meta<typeof Flex> = {
  title: "Components/Layout/Flex",
  component: Flex,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A server-renderable flex container with semantic HTML and responsive layout props. Numbers in gap, rowGap, and columnGap multiply the theme's --spacing unit; strings pass through as CSS lengths. Responsive objects use base, xs (20rem), sm (40rem), md (48rem), lg (64rem), and xl (80rem). Values carry forward until overridden, and each nested container starts with its own defaults.",
      },
    },
  },
  argTypes: {
    elementType: {
      control: "select",
      options: ["div", "section", "article", "nav", "main", "aside"],
    },
    direction: { control: "object" },
    align: { control: "object" },
    justify: { control: "object" },
    wrap: { control: "object" },
    gap: { control: "object" },
    rowGap: { control: "object" },
    columnGap: { control: "object" },
    inline: { control: "boolean" },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

export const Default: Story = {
  args: {
    direction: "row",
    align: "stretch",
    justify: "flex-start",
    wrap: "nowrap",
    gap: 4,
    inline: false,
    className: css.frame,
    children: items,
  },
};

export const Spacing: Story = {
  render: () => (
    <div className={css.samples}>
      <Flex className={css.frame} gap={1.5}>
        <span className={css.item}>1.5 spacing units</span>
        {items}
      </Flex>
      <Flex className={css.frame} gap="12px">
        <span className={css.item}>12px</span>
        {items}
      </Flex>
      <Flex className={css.frame} gap="1.5rem">
        <span className={css.item}>1.5rem</span>
        {items}
      </Flex>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Fractional numeric gaps follow the theme spacing unit, including density changes. Explicit px and rem strings keep their CSS meaning and bypass the spacing multiplier. Zero removes the gap, and values above ten remain valid spacing multipliers.",
      },
    },
  },
};

export const Presets: Story = {
  render: () => (
    <div className={css.samples}>
      <Stack className={css.frame}>{items}</Stack>
      <HStack className={css.frame}>{items}</HStack>
      <VStack className={css.frame} align="flex-start">
        {items}
      </VStack>
      <Wrap className={css.frame}>{items}</Wrap>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Stack and VStack start vertically with stretched children. HStack starts horizontally with centered cross-axis alignment. Wrap adds line wrapping. Every preset starts with four spacing units, and all defaults accept scalar or responsive overrides.",
      },
    },
  },
};

export const Responsive: Story = {
  render: () => (
    <div
      className={css.samples}
      style={{ "--spacing": "4px" } as CSSProperties}
    >
      <Flex
        data-testid="responsive-layout"
        className={css.frame}
        direction={{
          base: "column",
          xs: "row",
          sm: "column",
          md: "row",
          lg: "column",
          xl: "row",
        }}
        align={{
          base: "stretch",
          xs: "flex-start",
          sm: "center",
          md: "flex-end",
          lg: "baseline",
          xl: "stretch",
        }}
        justify={{
          base: "flex-start",
          xs: "center",
          sm: "flex-end",
          md: "space-between",
          lg: "space-around",
          xl: "space-evenly",
        }}
        wrap={{
          base: "nowrap",
          xs: "wrap",
          sm: "wrap-reverse",
          md: "nowrap",
          lg: "wrap",
          xl: "wrap-reverse",
        }}
        gap={{ base: 1, xs: 2, sm: 3, md: 4, lg: "20px", xl: "1.5rem" }}
        rowGap={{ sm: 5, lg: "28px" }}
        columnGap={{ md: "18px" }}
      >
        <span className={css.item}>Responsive parent</span>
        <Flex data-testid="responsive-nested" gap={2}>
          <span className={css.item}>Independent</span>
          <span className={css.item}>nested row</span>
        </Flex>
      </Flex>
      <Flex
        data-testid="responsive-sparse"
        className={css.frame}
        direction={{ md: "column" }}
        gap={{ base: 2, md: 4 }}
      >
        <span className={css.item}>Sparse overrides</span>
        <span className={css.item}>Only md changes this layout</span>
      </Flex>
      <VStack
        data-testid="responsive-preset"
        className={css.frame}
        direction={{ lg: "row" }}
      >
        <span className={css.item}>Overridable VStack</span>
        <span className={css.item}>Row from lg</span>
      </VStack>
      <Flex
        data-testid="responsive-lengths"
        className={css.frame}
        gap={{ base: "12px", md: "1.5rem" }}
      >
        <span className={css.item}>Explicit CSS lengths</span>
        <span className={css.item}>12px, then 1.5rem from md</span>
      </Flex>
      <p>
        Text with an inline container:{" "}
        <Flex elementType="span" data-testid="inline-layout" inline gap={1}>
          <span className={css.item}>Inline</span>
          <span className={css.item}>flex</span>
        </Flex>
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const index = [20, 40, 48, 64, 80].filter(
      (width) => window.matchMedia(`(min-width: ${width}rem)`).matches
    ).length;
    const layout = canvasElement.querySelector(
      '[data-testid="responsive-layout"]'
    );
    const nested = canvasElement.querySelector(
      '[data-testid="responsive-nested"]'
    );
    const sparse = canvasElement.querySelector(
      '[data-testid="responsive-sparse"]'
    );
    const preset = canvasElement.querySelector(
      '[data-testid="responsive-preset"]'
    );
    const lengths = canvasElement.querySelector(
      '[data-testid="responsive-lengths"]'
    );
    const inlineLayout = canvasElement.querySelector(
      '[data-testid="inline-layout"]'
    );
    if (!layout || !nested || !sparse || !preset || !lengths || !inlineLayout) {
      throw new Error("Responsive layout examples are missing.");
    }

    const computed = getComputedStyle(layout);
    expect(computed.flexDirection).toBe(
      ["column", "row", "column", "row", "column", "row"][index]
    );
    expect(computed.alignItems).toBe(
      ["stretch", "flex-start", "center", "flex-end", "baseline", "stretch"][
        index
      ]
    );
    expect(computed.justifyContent).toBe(
      [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly",
      ][index]
    );
    expect(computed.flexWrap).toBe(
      ["nowrap", "wrap", "wrap-reverse", "nowrap", "wrap", "wrap-reverse"][
        index
      ]
    );
    expect(computed.rowGap).toBe(
      ["4px", "8px", "20px", "20px", "28px", "28px"][index]
    );
    expect(computed.columnGap).toBe(
      ["4px", "8px", "12px", "18px", "18px", "18px"][index]
    );
    expect(getComputedStyle(nested).flexDirection).toBe("row");
    expect(getComputedStyle(nested).gap).toBe("8px");
    expect(getComputedStyle(nested).alignItems).toBe("stretch");
    expect(getComputedStyle(nested).justifyContent).toBe("flex-start");
    expect(getComputedStyle(nested).flexWrap).toBe("nowrap");
    expect(getComputedStyle(sparse).flexDirection).toBe(
      index >= 3 ? "column" : "row"
    );
    expect(getComputedStyle(sparse).gap).toBe(index >= 3 ? "16px" : "8px");
    expect(getComputedStyle(preset).flexDirection).toBe(
      index >= 4 ? "row" : "column"
    );
    const rem = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    expect(getComputedStyle(lengths).gap).toBe(
      index >= 3 ? `${1.5 * rem}px` : "12px"
    );
    expect(getComputedStyle(inlineLayout).display).toBe("inline-flex");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Resize the viewport to exercise xs (320px), sm (640px), md (768px), lg (1024px), and xl (1280px) at a 16px browser default. Sparse values carry forward; omitted base values use the component defaults, including VStack's column direction. Axis-specific gaps override gap independently, and a nested Flex retains its own layout. Explicit px and rem gaps keep their CSS meaning. The fixture fixes its spacing unit at 4px so measurements stay consistent across screen densities.",
      },
    },
  },
};
