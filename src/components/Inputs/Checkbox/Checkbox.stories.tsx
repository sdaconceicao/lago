import type { Meta, StoryFn } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { CheckboxGroup } from "./CheckboxGroup/CheckboxGroup";
import { Checkbox } from "./CheckboxItem/Checkbox";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A control that lets the user select or deselect an option. A single Checkbox works standalone; wrapping several in a CheckboxGroup manages their selected values, keyboard navigation, and a shared label. Checkboxes also support an indeterminate state to represent a partially selected group.",
      },
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Checkbox>;

export const Example: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <Checkbox defaultSelected>Unsubscribe</Checkbox>
  </div>
);

export const CheckboxGroupUsage: Story = () => (
  <CheckboxGroup label="Favorite sports" defaultValue={["soccer"]}>
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);
CheckboxGroupUsage.storyName = "CheckboxGroup Usage";
CheckboxGroupUsage.parameters = {
  docs: {
    description: {
      story:
        "A CheckboxGroup is a group of Checkbox items that are mutually exclusive and share a common label.",
    },
  },
};

export const Sizes: Story = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <CheckboxGroup label="Small" size="sm" defaultValue={["soccer"]}>
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball" description="Spring and summer">
        Baseball
      </Checkbox>
    </CheckboxGroup>
    <CheckboxGroup label="Medium (default)" size="md" defaultValue={["soccer"]}>
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball" description="Spring and summer">
        Baseball
      </Checkbox>
    </CheckboxGroup>
    <CheckboxGroup label="Large" size="lg" defaultValue={["soccer"]}>
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball" description="Spring and summer">
        Baseball
      </Checkbox>
    </CheckboxGroup>
  </div>
);

/**
 * Confirms the checkbox needs no size rules of its own: every metric here comes
 * from an inherited `--field-*` token, so the group's `data-field-size` scopes
 * the whole subtree.
 *
 * It also pins the one deliberate irregularity in the scale — the box steps 16 →
 * 18 → 18, not three times — so a later pass does not "finish" it by inventing a
 * larger `lg` box. Measured rather than read off the stylesheet, because the
 * hanging indent is a `calc()` of two tokens and only the layout knows the sum.
 */
Sizes.play = async ({ canvasElement }) => {
  const measured = [
    ...canvasElement.querySelectorAll(".react-aria-CheckboxGroup"),
  ].map((group) => {
    const button = group.querySelector(".react-aria-CheckboxButton");
    const description = group.querySelector('[slot="description"]');
    if (!button || !description) throw new Error("checkbox parts not found");
    // The box is the only element wrapping the checkmark; its class is hashed.
    const box = button.querySelector("svg")?.parentElement;
    if (!box) throw new Error("checkbox box not found");

    return {
      size: group.getAttribute("data-field-size"),
      box: Math.round(box.getBoundingClientRect().height),
      gap: getComputedStyle(button).columnGap,
      groupGap: getComputedStyle(
        group.querySelector(".checkbox-items") as Element
      ).rowGap,
      fontSize: getComputedStyle(button).fontSize,
      // Hangs the helper text clear of the box: box + gap.
      indent: getComputedStyle(description).marginLeft,
    };
  });

  expect(measured).toEqual([
    {
      size: "sm",
      box: 16,
      gap: "4px",
      groupGap: "8px",
      fontSize: "12px",
      indent: "20px",
    },
    {
      size: "md",
      box: 18,
      gap: "6px",
      groupGap: "10px",
      fontSize: "14px",
      indent: "24px",
    },
    {
      size: "lg",
      box: 18,
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
        'Checkbox supports three sizes: "sm" is a 16px box with 12px text, a 4px gap, and 8px between items; "md" (the default) an 18px box with 14px text, a 6px gap, and 10px between items; and "lg" an 18px box with 16px text, an 8px gap, and 12px between items. The box steps only once, from `sm` to `md` — 18px already reads small and there is no legible size between 16 and 18 — so the difference between `md` and `lg` is in the type spacing rather than the box, and a default checkbox is unchanged at 18px. Setting `size` on the CheckboxGroup scopes every item inside it, as shown here; a standalone Checkbox takes its own `size`, and an item may override the group. A Checkbox is not a field box, so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them — matching the size only keeps the type and control weight consistent across a form.',
    },
  },
};
