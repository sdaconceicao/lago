import type { Meta, StoryFn } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { RadioGroup } from "./RadioGroup/RadioGroup";
import { Radio } from "./RadioItem/Radio";

const meta: Meta<typeof Radio> = {
  component: Radio,
  args: {
    onPress: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onFocusChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A Radio is a single option that renders its label next to the radio indicator, with an optional description below. Radios must live inside a RadioGroup, which manages the selected value, keyboard navigation, and accessibility labeling for a set of mutually exclusive choices.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Radio>;

export const Example: Story = () => (
  <RadioGroup aria-label="Notifications" defaultValue="on">
    <Radio value="on">Enable notifications</Radio>
  </RadioGroup>
);

export const RadioGroupUsage: Story = () => (
  <RadioGroup label="Plan" defaultValue="pro">
    <Radio value="free" description="For personal projects">
      Free
    </Radio>
    <Radio value="pro" description="Best for growing teams">
      Pro
    </Radio>
    <Radio value="enterprise" isDisabled description="Talk to sales">
      Enterprise
    </Radio>
  </RadioGroup>
);
RadioGroupUsage.storyName = "RadioGroup Usage";
RadioGroupUsage.parameters = {
  docs: {
    description: {
      story:
        "A RadioGroup is a group of Radio items that are mutually exclusive and share a common label.",
    },
  },
};

export const Sizes: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <RadioGroup label="Small" size="sm" defaultValue="pro">
      <Radio value="free">Free</Radio>
      <Radio value="pro" description="Best for growing teams">
        Pro
      </Radio>
    </RadioGroup>
    <RadioGroup label="Medium (default)" size="md" defaultValue="pro">
      <Radio value="free">Free</Radio>
      <Radio value="pro" description="Best for growing teams">
        Pro
      </Radio>
    </RadioGroup>
    <RadioGroup label="Large" size="lg" defaultValue="pro">
      <Radio value="free">Free</Radio>
      <Radio value="pro" description="Best for growing teams">
        Pro
      </Radio>
    </RadioGroup>
  </div>
);

/**
 * Confirms the radio needs no size rules of its own: every metric here comes
 * from an inherited `--field-*` token, so the group's `data-field-size` scopes
 * the whole subtree.
 *
 * It also pins the one deliberate irregularity in the scale — the indicator
 * steps 16 → 18 → 18, not three times — so a later pass does not "finish" it by
 * inventing a larger `lg` indicator. Measured rather than read off the
 * stylesheet, because the hanging indent is a `calc()` of two tokens and only
 * the layout knows the sum.
 */
Sizes.play = async ({ canvasElement }) => {
  const measured = [
    ...canvasElement.querySelectorAll(".react-aria-RadioGroup"),
  ].map((group) => {
    const button = group.querySelector(".react-aria-RadioButton");
    const description = group.querySelector('[slot="description"]');
    if (!button || !description) throw new Error("radio parts not found");
    // The indicator is the button's only child element; its class is hashed.
    const indicator = button.querySelector(":scope > div");
    if (!indicator) throw new Error("radio indicator not found");

    return {
      size: group.getAttribute("data-field-size"),
      indicator: Math.round(indicator.getBoundingClientRect().height),
      gap: getComputedStyle(button).columnGap,
      groupGap: getComputedStyle(group.querySelector(".radio-items") as Element)
        .rowGap,
      fontSize: getComputedStyle(button).fontSize,
      // Hangs the helper text clear of the indicator: indicator + gap.
      indent: getComputedStyle(description).marginLeft,
    };
  });

  expect(measured).toEqual([
    {
      size: "sm",
      indicator: 16,
      gap: "4px",
      groupGap: "8px",
      fontSize: "12px",
      indent: "20px",
    },
    {
      size: "md",
      indicator: 18,
      gap: "6px",
      groupGap: "10px",
      fontSize: "14px",
      indent: "24px",
    },
    {
      size: "lg",
      indicator: 18,
      gap: "8px",
      groupGap: "12px",
      fontSize: "16px",
      indent: "26px",
    },
  ]);
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Radio supports three sizes: "sm" is a 16px indicator with 12px text, a 4px gap, and 8px between options; "md" (the default) an 18px indicator with 14px text, a 6px gap, and 10px between options; and "lg" an 18px indicator with 16px text, an 8px gap, and 12px between options. The indicator steps only once, from `sm` to `md` — 18px already reads small and there is no legible size between 16 and 18 — so the difference between `md` and `lg` is in the type spacing rather than the indicator, and a default radio is unchanged at 18px. Setting `size` on the RadioGroup scopes every item inside it, as shown here; an individual Radio may override it. A Radio is not a field box, so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them — matching the size only keeps the type and control weight consistent across a form.',
    },
  },
};
