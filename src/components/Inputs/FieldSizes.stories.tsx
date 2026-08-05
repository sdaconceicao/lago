import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/Actions/Button/Button";
import { Checkbox } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import { ColorField } from "@/components/Inputs/Colors/ColorField/ColorField";
import { DateField } from "@/components/Inputs/Date/DateField/DateField";
import { DatePicker } from "@/components/Inputs/Date/DatePicker/DatePicker";
import { DateRangePicker } from "@/components/Inputs/Date/DateRangePicker/DateRangePicker";
import { TimeField } from "@/components/Inputs/Date/TimeField/TimeField";
import { DropZone } from "@/components/Inputs/DropZone/DropZone";
import { Form } from "@/components/Inputs/FormComponents/Form/Form";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import {
  MultiSelect,
  MultiSelectItem,
} from "@/components/Inputs/MultiSelect/MultiSelect";
import { NumberField } from "@/components/Inputs/NumberField/NumberField";
import { Password } from "@/components/Inputs/Password/Password";
import { RadioGroup } from "@/components/Inputs/Radio/RadioGroup/RadioGroup";
import { Radio } from "@/components/Inputs/Radio/RadioItem/Radio";
import { SearchField } from "@/components/Inputs/Search/SearchField/SearchField";
import { SearchFieldWithSuggestions } from "@/components/Inputs/Search/SearchFieldWIthSuggestions/SearchFieldWithSuggestions";
import { Select, SelectItem } from "@/components/Inputs/Select/Select";
import { Slider } from "@/components/Inputs/Slider/Slider";
import { Switch } from "@/components/Inputs/Switch/Switch";
import { TagsInput } from "@/components/Inputs/TagsInput/TagsInput";
import { TextArea } from "@/components/Inputs/TextArea/TextArea";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { AffixSelect } from "@/components/Inputs/TextFieldWithAffixes/BaseComponents/AffixSelect";
import { TextFieldWithAffixes } from "@/components/Inputs/TextFieldWithAffixes/TextFieldWithAffixes";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";

/**
 * Every field-like input takes a `size` prop: `sm` is a compact 28px control,
 * `md` (the default) is 36px, and `lg` is a roomy 48px. Controls of the same
 * size share their outer height, border radius, font size, and text inset, so
 * any mix of them lines up when placed in a row.
 *
 * The metrics come from the `--field-*` custom properties in `styles/theme.css`,
 * scoped by a `data-field-size` attribute on each component's root. Those
 * properties inherit, so every part of a control — its inner input, trigger
 * button, tag chips, label, and dropdown — picks up the field's size without
 * anything being passed down to it.
 */
const meta: Meta = {
  parameters: {
    layout: "padded",
  },
};

export default meta;

/** The controls that share a single field box and are expected to row-align. */
const FieldRow = ({ size }: { size: FieldSize }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      flexWrap: "wrap",
      gap: 12,
    }}
    data-testid={`row-${size}`}
  >
    <TextField aria-label="Text" size={size} placeholder="Text" />
    <TextFieldWithAffixes
      aria-label="Static affixes"
      data-testid="affixes-static"
      size={size}
      prefix="https://"
      suffix=".com"
      placeholder="site"
    />
    <TextFieldWithAffixes
      aria-label="Dropdown affix"
      data-testid="affixes-dropdown"
      size={size}
      placeholder="0.00"
      prefix={
        <AffixSelect aria-label="Currency" defaultSelectedKey="usd">
          <SelectItem id="usd">USD</SelectItem>
          <SelectItem id="eur">EUR</SelectItem>
        </AffixSelect>
      }
    />
    <Password aria-label="Password" size={size} placeholder="Password" />
    <SearchField aria-label="Search" size={size} placeholder="Search" />
    <SearchFieldWithSuggestions
      aria-label="Search with suggestions"
      size={size}
      placeholder="Search with suggestions"
      suggestions={[
        { id: "a", label: "Apple" },
        { id: "b", label: "Banana" },
        { id: "c", label: "Cherry" },
      ]}
    />
    <Select aria-label="Select" size={size}>
      <SelectItem id="a">Apple</SelectItem>
      <SelectItem id="b">Banana</SelectItem>
    </Select>
    <MultiSelect aria-label="Multi" size={size} placeholder="Multi">
      <MultiSelectItem id="a">Apple</MultiSelectItem>
      <MultiSelectItem id="b">Banana</MultiSelectItem>
    </MultiSelect>
    <TagsInput
      aria-label="Tags"
      size={size}
      placeholder="Tags"
      items={[
        { id: "a", label: "Apple" },
        { id: "b", label: "Banana" },
      ]}
    />
    <NumberField aria-label="Number" size={size} />
    <ColorField aria-label="Color" size={size} />
    <DateField aria-label="Date" size={size} />
    <TimeField aria-label="Time" size={size} />
    <DatePicker aria-label="Date picker" size={size} />
    <DateRangePicker aria-label="Date range" size={size} />
  </div>
);

const px = (value: string) => Number.parseFloat(value) || 0;

/**
 * The field box of a control: the `Group` that wraps input plus trigger, or the
 * bare input / date input when there is no group. A selector list returns the
 * first match in document order, so an ancestor group always wins over the
 * input nested inside it.
 */
const FIELD_BOX =
  ".react-aria-Group, .react-aria-DateInput, .react-aria-Input, textarea";

/**
 * The distance from the field's leading edge to its text. Group-based fields
 * (Select, MultiSelect) split this between the group and the input inside it, and
 * TextFieldWithAffixes puts it on the segment wrapping the input, so every box
 * between the field and its text contributes and all of them have to be summed.
 */
const textInset = (field: Element) => {
  const inner = field.matches(".react-aria-Group")
    ? field.querySelector(
        ".react-aria-Input, .react-aria-DateInput, .react-aria-ComboBoxValue"
      )
    : null;
  let total = px(getComputedStyle(field).paddingLeft);
  for (let box = inner; box && box !== field; box = box.parentElement) {
    total += px(getComputedStyle(box).paddingLeft);
  }
  return total;
};

/**
 * The controls in a row, matched on their stable global root class. Selecting
 * them explicitly rather than walking `row.children` skips react-aria's
 * non-visual siblings — the `<template>` holding pristine markup for form
 * reset, and the unclassed `<div>` wrapping hidden inputs for form submission.
 */
const ROOTS = [
  "TextField",
  "SearchField",
  "ComboBox", // Select, MultiSelect, and TagsInput
  "NumberField",
  "ColorField",
  "DateField",
  "TimeField",
  "DatePicker",
  "DateRangePicker",
]
  .map((name) => `.react-aria-${name}`)
  .join(", ");

/**
 * An affix dropdown. Select and MultiSelect are built on ComboBox, so this class
 * only ever appears on the dropdown inside a TextFieldWithAffixes affix — which
 * is the one field trigger that does not sit at the trailing edge.
 */
const AFFIX_DROPDOWN = ".react-aria-Select";

/**
 * Where a control's trailing trigger sits, measured from the field box's own
 * edges. Every control that has one must place it identically, whatever
 * mechanism positions it.
 */
const triggerBox = (field: Element) => {
  const button = [...field.querySelectorAll(".field-Button")].find(
    (candidate) => !candidate.closest(AFFIX_DROPDOWN)
  );
  if (!button) return null;
  const fieldRect = field.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  return {
    size: `${Math.round(buttonRect.width)}x${Math.round(buttonRect.height)}`,
    fromEnd: Math.round(fieldRect.right - buttonRect.right),
    fromTop: Math.round(buttonRect.top - fieldRect.top),
  };
};

/**
 * An affix dropdown's trigger, measured from the leading edge its affix sits at.
 * Its width is its own — it holds a value as well as a chevron — but its height
 * and inset have to match the trailing triggers in the row, since that is what
 * makes a field with a dropdown affix read as the Select and DatePicker beside it.
 */
const affixTriggerBox = (field: Element) => {
  const button = field.querySelector(`${AFFIX_DROPDOWN} .field-Button`);
  if (!button) return null;
  const fieldRect = field.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  return {
    height: Math.round(buttonRect.height),
    fromStart: Math.round(buttonRect.left - fieldRect.left),
    fromTop: Math.round(buttonRect.top - fieldRect.top),
  };
};

const measureRow = (row: HTMLElement) =>
  [...row.querySelectorAll(ROOTS)].map((control) => {
    const field = control.querySelector(FIELD_BOX);
    if (!field) {
      throw new Error(`no field box in ${control.className}`);
    }
    const style = getComputedStyle(field);
    return {
      // Three controls in the row are react-aria TextFields, so the affix fields
      // carry a testid to keep the failure messages telling them apart.
      name:
        control.getAttribute("data-testid") ?? control.className.split(" ")[0],
      height: Math.round(field.getBoundingClientRect().height),
      radius: style.borderTopLeftRadius,
      fontSize: style.fontSize,
      inset: textInset(field),
      trigger: triggerBox(field),
      affixTrigger: affixTriggerBox(field),
      // How far the field box sits below the top of its own control. Equal
      // heights are not enough to line up: anything rendered above the field
      // (a label, even an empty one) shifts it down inside its own root. This
      // is measured per control rather than against the row so it survives the
      // row wrapping onto a second line.
      offsetTop: Math.round(
        field.getBoundingClientRect().top - control.getBoundingClientRect().top
      ),
    };
  });

/**
 * Every field-like control at all three sizes. The `play` function is the
 * actual contract: within a row, every control must report the same height,
 * border radius, font size, text inset, and trailing-trigger placement.
 */
export const Alignment: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <FieldRow size="sm" />
      <FieldRow size="md" />
      <FieldRow size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const expected = {
      sm: { height: 28, inset: 8, triggerHeight: 20, triggerInset: 4 },
      md: { height: 36, inset: 12, triggerHeight: 24, triggerInset: 6 },
      lg: { height: 48, inset: 16, triggerHeight: 32, triggerInset: 8 },
    };

    for (const size of ["sm", "md", "lg"] as const) {
      const row = canvasElement.querySelector<HTMLElement>(
        `[data-testid="row-${size}"]`
      );
      if (!row) throw new Error(`missing ${size} row`);

      const measured = measureRow(row);
      const [first] = measured;
      // Guard the TEMPLATE filter above from silently dropping a real control.
      expect(measured, `${size}: every control measured`).toHaveLength(15);

      for (const control of measured) {
        expect(
          control,
          `${size}: ${control.name} must match ${first.name}`
        ).toMatchObject({
          height: expected[size].height,
          radius: first.radius,
          fontSize: first.fontSize,
          // A dropdown affix is a button, not text, so the value beside it is
          // inset by the trigger inset rather than the text inset — the same
          // distance a DatePicker leaves between its date and its calendar
          // button. Every other control in the row, the static-affix field
          // included, starts its text at the field's text inset.
          inset:
            control.name === "affixes-dropdown"
              ? expected[size].triggerInset
              : expected[size].inset,
          // None of these controls is given a label, so every field box must
          // start flush with the top of its own root.
          offsetTop: 0,
        });
      }

      // Trailing triggers must sit in the same place in every control that has
      // one, regardless of how each stylesheet positions it.
      const triggers = measured.filter((control) => control.trigger);
      const [firstTrigger] = triggers;
      for (const control of triggers) {
        expect(
          control.trigger,
          `${size}: ${control.name} trigger must match ${firstTrigger.name}`
        ).toEqual(firstTrigger.trigger);
      }

      // An affix dropdown puts a trigger at the leading edge instead. It has to
      // land at the inset the trailing triggers use, or a field with a dropdown
      // affix stops reading as part of the same set.
      const affixTriggers = measured.filter((control) => control.affixTrigger);
      expect(
        affixTriggers,
        `${size}: one affix dropdown measured`
      ).toHaveLength(1);
      expect(
        affixTriggers[0].affixTrigger,
        `${size}: affix dropdown trigger must sit where a trailing trigger does`
      ).toEqual({
        height: expected[size].triggerHeight,
        fromStart: firstTrigger.trigger?.fromEnd,
        fromTop: expected[size].triggerInset,
      });
    }
  },
};

Alignment.parameters = {
  docs: {
    description: {
      story:
        "Each row mixes every single-line control at one size. The assertions check that height, border radius, font size, text inset, and trailing-trigger placement are identical across the row: 28px/6px/12px/8px at `sm`, 36px/8px/14px/12px at `md`, and 48px/8px/16px/16px at `lg`.",
    },
  },
};

/**
 * Size is set per field, including inside a `Form`. Labels, descriptions, and
 * errors follow the field they belong to, so a compact form stays internally
 * consistent.
 */
export const InAForm: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 48 }}>
      <Form style={{ width: 240 }}>
        <TextField
          label="Name"
          placeholder="Text"
          description="md fields (default)"
        />
        <Select label="Fruit">
          <SelectItem id="a">Apple</SelectItem>
        </Select>
        <DatePicker label="Date" />
      </Form>
      <Form style={{ width: 240 }}>
        <TextField
          label="Name"
          size="sm"
          placeholder="Text"
          description="sm fields"
        />
        <Select label="Fruit" size="sm">
          <SelectItem id="a">Apple</SelectItem>
        </Select>
        <DatePicker label="Date" size="sm" />
      </Form>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const heights = [...canvasElement.querySelectorAll("form")].map((form) =>
      Math.round(
        form
          .querySelector(".react-aria-Input, .react-aria-Group")
          ?.getBoundingClientRect().height ?? 0
      )
    );
    expect(heights).toEqual([36, 28]);
  },
};

InAForm.parameters = {
  docs: {
    description: {
      story:
        "`Form` has no `size` of its own to cascade. Each field renders its own `data-field-size`, and a declaration on an element always beats an inherited one, so a form-level attribute would resize the labels while leaving the fields at their default. Pass `size` to each field; form-wide sizing would need a React context rather than CSS inheritance.",
    },
  },
};

/**
 * Controls whose shape means they never row-align with single-line fields.
 * `size` still scales their text, indicators, and spacing so they sit
 * comfortably beside compact fields.
 */
export const NonRowControls: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 48 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div
          key={size}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: 260,
          }}
        >
          <strong>{size}</strong>
          <TextArea aria-label="Notes" size={size} placeholder="Notes" />
          <Switch size={size}>Switch</Switch>
          <Slider aria-label="Slider" size={size} defaultValue={40} />
          <Checkbox size={size}>Checkbox</Checkbox>
          <RadioGroup aria-label="Radios" size={size}>
            <Radio value="a">First</Radio>
            <Radio value="b">Second</Radio>
          </RadioGroup>
          <ToggleButton size={size}>Toggle</ToggleButton>
          <DropZone size={size} />
        </div>
      ))}
    </div>
  ),
};

NonRowControls.parameters = {
  docs: {
    description: {
      story:
        "A TextArea is multi-line, a DropZone is a box target, and Slider/Switch/Checkbox/Radio are indicator controls rather than field boxes — none of them share a field height, so they are deliberately excluded from row alignment.",
    },
  },
};

/**
 * Buttons carry their own size scale so they never shrink just because they sit
 * inside a compact field's subtree. That means picking the button size that
 * matches the fields beside it.
 */
export const ButtonPairing: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 12 }}
        data-testid="pair-sm"
      >
        <TextField aria-label="Text" size="sm" placeholder="sm field (28px)" />
        <Button size="sm">Submit</Button>
      </div>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 12 }}
        data-testid="pair-md"
      >
        <TextField aria-label="Text" placeholder="md field (36px)" />
        <Button>Submit</Button>
      </div>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 12 }}
        data-testid="pair-lg"
      >
        <TextField aria-label="Text" size="lg" placeholder="lg field (48px)" />
        <Button size="lg">Submit</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [testId, height, font] of [
      ["pair-sm", 28, "12px"],
      ["pair-md", 36, "14px"],
      ["pair-lg", 48, "16px"],
    ] as const) {
      const row = canvasElement.querySelector(`[data-testid="${testId}"]`);
      const input = row?.querySelector(".react-aria-Input");
      const button = row?.querySelector("button");
      const measured = [input, button].map((el) =>
        Math.round(el?.getBoundingClientRect().height ?? 0)
      );
      expect(measured, testId).toEqual([height, height]);

      // Type steps 12 / 14 / 16 across the scale, and a field's text matches
      // the button beside it. Without this, `lg` silently shared `md`'s 14px
      // and read small on a 48px control.
      expect(
        [input, button].map((el) => el && getComputedStyle(el).fontSize),
        `${testId} type size`
      ).toEqual([font, font]);
    }
  },
};

ButtonPairing.parameters = {
  docs: {
    description: {
      story:
        'Buttons, ToggleButtons, and SegmentedControls carry their own `data-size` attribute rather than reading the `--field-*` tokens, so one placed inside a compact field\'s subtree never shrinks on its own. Their scale mirrors the field scale numerically — 28 / 36 / 48 — so `size="md"` lines up everywhere and every row here is an exact match, asserted in the `play` function.',
    },
  },
};

/**
 * A MultiSelect holding selections, beside the controls it has to line up with.
 * This is where a compact field is most likely to drift: the chips are real
 * layout, so if they wrapped they would push the field past its size.
 */
export const PopulatedMultiSelect: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div
          key={size}
          style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
          data-testid={`populated-${size}`}
        >
          <Select aria-label="Select" size={size}>
            <SelectItem id="a">Apple</SelectItem>
          </Select>
          <MultiSelect
            aria-label="Multi"
            size={size}
            defaultValue={["apple", "banana", "cherry"]}
          >
            <MultiSelectItem id="apple">Apple</MultiSelectItem>
            <MultiSelectItem id="banana">Banana</MultiSelectItem>
            <MultiSelectItem id="cherry">Cherry</MultiSelectItem>
          </MultiSelect>
          <DatePicker aria-label="Date picker" size={size} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // sm and md hold their height however many chips are selected; lg wraps and
    // grows on purpose, so it is not asserted here.
    const fixed = [
      { size: "sm", height: 28, trigger: { size: "20x20", fromEnd: 4 } },
      { size: "md", height: 36, trigger: { size: "24x24", fromEnd: 6 } },
    ] as const;

    for (const { size, height, trigger } of fixed) {
      const row = canvasElement.querySelector<HTMLElement>(
        `[data-testid="populated-${size}"]`
      );
      if (!row) throw new Error(`missing ${size} row`);

      const measured = measureRow(row);
      expect(measured, `${size}: every control measured`).toHaveLength(3);

      // A populated fixed-height field must not grow, and its toggle must stay
      // exactly where the Select's and DatePicker's toggles are.
      for (const control of measured) {
        expect(control, `${size}: ${control.name}`).toMatchObject({
          height,
          trigger: { ...trigger, fromTop: trigger.fromEnd },
          // The row is top-aligned, so an unequal offset here is exactly the
          // "not lined up" a reader sees, even with identical heights.
          offsetTop: 0,
        });
      }
    }
  },
};

PopulatedMultiSelect.parameters = {
  docs: {
    description: {
      story:
        "At `sm` and `md` the tags never wrap — the row scrolls horizontally — so the field holds its 28px or 36px height however many items are selected, and its toggle stays aligned with the Select and DatePicker beside it. At `lg` the tags do wrap and the field grows to fit them, which is why these rows align to the top rather than the bottom.",
    },
  },
};
