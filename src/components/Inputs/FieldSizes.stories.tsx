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
import { RadioGroup } from "@/components/Inputs/Radio/RadioGroup/RadioGroup";
import { Radio } from "@/components/Inputs/Radio/RadioItem/Radio";
import { SearchField } from "@/components/Inputs/Search/SearchField/SearchField";
import { Select, SelectItem } from "@/components/Inputs/Select/Select";
import { Slider } from "@/components/Inputs/Slider/Slider";
import { Switch } from "@/components/Inputs/Switch/Switch";
import { TextArea } from "@/components/Inputs/TextArea/TextArea";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";

/**
 * Every field-like input takes a `size` prop. `md` (the default) is a 48px-tall
 * control and `sm` is a compact 28px one. Controls of the same size share their
 * outer height, border radius, font size, and text inset, so any mix of them
 * lines up when placed in a row.
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
    <SearchField aria-label="Search" size={size} placeholder="Search" />
    <Select aria-label="Select" size={size}>
      <SelectItem id="a">Apple</SelectItem>
      <SelectItem id="b">Banana</SelectItem>
    </Select>
    <MultiSelect aria-label="Multi" size={size} placeholder="Multi">
      <MultiSelectItem id="a">Apple</MultiSelectItem>
      <MultiSelectItem id="b">Banana</MultiSelectItem>
    </MultiSelect>
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
 * (Select, MultiSelect) split this between the group and the input inside it,
 * so both contributions have to be summed.
 */
const textInset = (field: Element) => {
  const inner = field.matches(".react-aria-Group")
    ? field.querySelector(
        ".react-aria-Input, .react-aria-DateInput, .react-aria-ComboBoxValue"
      )
    : null;
  return (
    px(getComputedStyle(field).paddingLeft) +
    (inner ? px(getComputedStyle(inner).paddingLeft) : 0)
  );
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
  "ComboBox", // Select and MultiSelect
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
 * Where a control's trailing trigger sits, measured from the field box's own
 * edges. Every control that has one must place it identically, whatever
 * mechanism positions it.
 */
const triggerBox = (field: Element) => {
  const button = field.querySelector(".field-Button");
  if (!button) return null;
  const fieldRect = field.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  return {
    size: `${Math.round(buttonRect.width)}x${Math.round(buttonRect.height)}`,
    fromEnd: Math.round(fieldRect.right - buttonRect.right),
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
      name: control.className.split(" ")[0],
      height: Math.round(field.getBoundingClientRect().height),
      radius: style.borderTopLeftRadius,
      fontSize: style.fontSize,
      inset: textInset(field),
      trigger: triggerBox(field),
    };
  });

/**
 * Every field-like control at both sizes. The `play` function is the actual
 * contract: within a row, every control must report the same height, border
 * radius, font size, and text inset.
 */
export const Alignment: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <FieldRow size="md" />
      <FieldRow size="sm" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const expected = {
      md: { height: 48, inset: 16 },
      sm: { height: 28, inset: 8 },
    };

    for (const size of ["md", "sm"] as const) {
      const row = canvasElement.querySelector<HTMLElement>(
        `[data-testid="row-${size}"]`
      );
      if (!row) throw new Error(`missing ${size} row`);

      const measured = measureRow(row);
      const [first] = measured;
      // Guard the TEMPLATE filter above from silently dropping a real control.
      expect(measured, `${size}: every control measured`).toHaveLength(10);

      for (const control of measured) {
        expect(
          control,
          `${size}: ${control.name} must match ${first.name}`
        ).toMatchObject({
          height: expected[size].height,
          radius: first.radius,
          fontSize: first.fontSize,
          inset: expected[size].inset,
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
    }
  },
};

Alignment.parameters = {
  docs: {
    description: {
      story:
        "Each row mixes every single-line control at one size. The assertions check that height, border radius, font size, and text inset are identical across the row — 48px/8px/14px/16px at `md` and 28px/6px/12px/8px at `sm`.",
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
        <TextField label="Name" placeholder="Text" description="md fields" />
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
    expect(heights).toEqual([48, 28]);
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
      {(["md", "sm"] as const).map((size) => (
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
        data-testid="pair-md"
      >
        <TextField aria-label="Text" placeholder="md field" />
        <Button size="lg">Submit</Button>
      </div>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 12 }}
        data-testid="pair-sm"
      >
        <TextField aria-label="Text" size="sm" placeholder="sm field" />
        <Button size="sm">Submit</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [testId, height] of [
      ["pair-md", 48],
      ["pair-sm", 28],
    ] as const) {
      const row = canvasElement.querySelector(`[data-testid="${testId}"]`);
      const measured = [
        row?.querySelector(".react-aria-Input"),
        row?.querySelector("button"),
      ].map((el) => Math.round(el?.getBoundingClientRect().height ?? 0));
      expect(measured, testId).toEqual([height, height]);
    }
  },
};

ButtonPairing.parameters = {
  docs: {
    description: {
      story:
        'A row of `md` fields (48px) pairs with `<Button size="lg">`; a row of `sm` fields (28px) pairs with `<Button size="sm">`. The default 32px button matches neither field height on purpose — it is the right size for toolbars and dialog footers.',
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
      {(["md", "sm"] as const).map((size) => (
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
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-testid="populated-sm"]'
    );
    if (!row) throw new Error("missing sm row");

    const measured = measureRow(row);
    expect(measured, "sm: every control measured").toHaveLength(3);

    // A populated compact field must not grow, and its toggle must stay put.
    for (const control of measured) {
      expect(control, `sm: ${control.name}`).toMatchObject({
        height: 28,
        trigger: { size: "20x20", fromEnd: 4, fromTop: 4 },
      });
    }
  },
};

PopulatedMultiSelect.parameters = {
  docs: {
    description: {
      story:
        "At `sm` the tags never wrap — the row scrolls horizontally — so the field stays exactly 28px tall and its toggle stays aligned with the Select and DatePicker beside it. At `md` the tags do wrap and the field grows to fit them, which is why these rows align to the top rather than the bottom.",
    },
  },
};
