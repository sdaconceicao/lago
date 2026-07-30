import type { Meta, StoryFn } from "@storybook/react";
import { Search } from "lucide-react";
import { fn } from "storybook/test";
import { FieldButton } from "@/components/Inputs/FormComponents/index";
import { SelectItem } from "@/components/Inputs/Select/Select";
import { AffixSelect } from "./BaseComponents/AffixSelect";
import { TextFieldWithAffixes } from "./TextFieldWithAffixes";

const meta: Meta<typeof TextFieldWithAffixes> = {
  component: TextFieldWithAffixes,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input flanked by an optional prefix and suffix, all sharing a single inset field surface with a vertical border between each segment. Use it for values that read as one unit with a fixed part — a URL scheme, a currency, a unit of measure — where the fixed part is either static text or a dropdown. It accepts every TextField prop, so its label, description, validation, sizing, and trailing button all behave identically. The one difference is `onChange`, which reports the input's text and both affix selections as a single value.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof TextFieldWithAffixes>;

export const Example: Story = (args) => <TextFieldWithAffixes {...args} />;

Example.args = {
  label: "Website",
  placeholder: "your-site",
  prefix: "https://",
  suffix: ".com",
};

export const Affixes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextFieldWithAffixes {...args} label="Prefix only" prefix="https://" />
    <TextFieldWithAffixes {...args} label="Suffix only" suffix="@example.com" />
    <TextFieldWithAffixes {...args} label="Both" prefix="$" suffix="USD" />
    <TextFieldWithAffixes {...args} label="Icon prefix" prefix={<Search />} />
  </div>
);

Affixes.args = {
  placeholder: "Enter a value",
};

Affixes.parameters = {
  docs: {
    description: {
      story:
        "Either affix is optional, so a field can carry a prefix, a suffix, or both. Each affix renders in its own segment separated from the input by a vertical border, and the segments hug their content so the input keeps the remaining width. An affix accepts any node — the text here is muted so the value the user types stays the most prominent, and icons are scaled to the field's icon size automatically.",
    },
  },
};

export const Dropdowns: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextFieldWithAffixes
      {...args}
      label="Dropdown prefix"
      placeholder="your-site.com"
      prefix={
        <AffixSelect aria-label="Scheme" defaultSelectedKey="https">
          <SelectItem id="https">https://</SelectItem>
          <SelectItem id="http">http://</SelectItem>
        </AffixSelect>
      }
    />
    <TextFieldWithAffixes
      {...args}
      label="Dropdown suffix"
      placeholder="0.00"
      prefix="$"
      suffix={
        <AffixSelect aria-label="Currency" defaultSelectedKey="usd">
          <SelectItem id="usd">USD</SelectItem>
          <SelectItem id="eur">EUR</SelectItem>
          <SelectItem id="gbp">GBP</SelectItem>
        </AffixSelect>
      }
    />
    <TextFieldWithAffixes
      {...args}
      label="Dropdowns on both ends"
      placeholder="100"
      prefix={
        <AffixSelect aria-label="Measure" defaultSelectedKey="weight">
          <SelectItem id="weight">Weight</SelectItem>
          <SelectItem id="volume">Volume</SelectItem>
        </AffixSelect>
      }
      suffix={
        <AffixSelect aria-label="Unit" defaultSelectedKey="kg">
          <SelectItem id="kg">kg</SelectItem>
          <SelectItem id="lb">lb</SelectItem>
        </AffixSelect>
      }
    />
  </div>
);

Dropdowns.parameters = {
  docs: {
    description: {
      story:
        "An affix can be a dropdown instead of static text: pass an AffixSelect, which takes the same options and selection props as Select but draws no field surface of its own. Its trigger fills the segment edge to edge so the hover background stops at the separators, and it inherits the field's size for its portaled popover — no need to repeat the `size` prop. Because it has no visible label, `aria-label` is required. Picking an option fires the field's `onChange` as well as the dropdown's own `onSelectionChange`.",
    },
  },
};

export const ChangeHandling: Story = (args) => (
  <TextFieldWithAffixes {...args} />
);

ChangeHandling.args = {
  label: "Price",
  placeholder: "0.00",
  prefix: (
    <AffixSelect aria-label="Currency" defaultSelectedKey="usd">
      <SelectItem id="usd">$</SelectItem>
      <SelectItem id="eur">€</SelectItem>
      <SelectItem id="gbp">£</SelectItem>
    </AffixSelect>
  ),
  suffix: (
    <AffixSelect aria-label="Period" defaultSelectedKey="month">
      <SelectItem id="month">/ month</SelectItem>
      <SelectItem id="year">/ year</SelectItem>
    </AffixSelect>
  ),
};

ChangeHandling.parameters = {
  docs: {
    description: {
      story:
        'A single `onChange` covers the whole control: it fires when the user types and when either dropdown changes, and every call receives the same shape — `{ value, prefix, suffix }`. Typing "9" here reports `{ value: "9", prefix: "usd", suffix: "month" }`; switching the period to yearly then reports `{ value: "9", prefix: "usd", suffix: "year" }`. Affix selections are present from the first call, since each dropdown registers what it mounted with, and a static affix contributes nothing because it has no value to select. Check the Actions panel to watch the payload as you interact.',
    },
  },
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextFieldWithAffixes {...args} size="sm" label="Small" />
    <TextFieldWithAffixes {...args} size="md" label="Medium (default)" />
    <TextFieldWithAffixes {...args} size="lg" label="Large" />
  </div>
);

Sizes.args = {
  placeholder: "0.00",
  prefix: "$",
  suffix: (
    <AffixSelect aria-label="Currency" defaultSelectedKey="usd">
      <SelectItem id="usd">USD</SelectItem>
      <SelectItem id="eur">EUR</SelectItem>
    </AffixSelect>
  ),
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'The field supports the same three sizes as every other field: "sm" renders a compact 28px-tall field with 12px text and an 8px text inset, "md" (the default) a 36px-tall field with 14px text and a 12px inset, and "lg" a roomy 48px-tall field with 16px text and a 16px inset. The affix segments and any dropdown inside them scale with the field, so it lines up with a TextField, Select, or DatePicker of the same size placed beside it.',
    },
  },
};

export const States: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextFieldWithAffixes {...args} label="Default" />
    <TextFieldWithAffixes
      {...args}
      label="Disabled"
      isDisabled
      defaultValue="lago"
    />
    <TextFieldWithAffixes
      {...args}
      label="Read only"
      isReadOnly
      defaultValue="lago"
    />
    <TextFieldWithAffixes
      {...args}
      label="Invalid"
      isInvalid
      defaultValue="not a domain"
      errorMessage="Enter a valid domain."
    />
    <TextFieldWithAffixes
      {...args}
      label="Required with a description"
      isRequired
      description="We only use this for your public profile."
    />
  </div>
);

States.args = {
  placeholder: "your-site",
  prefix: "https://",
  suffix: ".com",
};

States.parameters = {
  docs: {
    description: {
      story:
        "The field surface carries the state for every segment at once. Disabled mutes the input value and drops the field border and its separators to the disabled border color, while the affixes hold their muted-but-legible color so they stay above the 4.5:1 contrast minimum; invalid turns the field border and its separators red and reveals the error message below. Because the separators read the field's own border color, they also follow the hover state — there is nothing to keep in sync per segment.",
    },
  },
};

export const WithTrailingButton: Story = (args) => (
  <TextFieldWithAffixes {...args} />
);

WithTrailingButton.args = {
  label: "Website",
  placeholder: "your-site",
  prefix: "https://",
  suffix: ".com",
  button: <FieldButton aria-label="Clear">×</FieldButton>,
};

WithTrailingButton.parameters = {
  docs: {
    description: {
      story:
        "The TextField `button` prop still works: a trailing control such as a clear or reveal action renders inside the input segment rather than in a segment of its own, so it stays visually attached to the value it acts on and no extra separator appears. Its trailing inset tightens to match the TextField field group.",
    },
  },
};
