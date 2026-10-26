import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { TelephoneField } from "./TelephoneField";

const meta: Meta<typeof TelephoneField> = {
  component: TelephoneField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A telephone field with a country calling-code dropdown and a mask that formats digits as they are entered. TelephoneField shares TextField's labels, descriptions, validation states, and field sizes. Empty and local values default to the United States. Existing international prefixes are preserved; an explicit country disambiguates a calling code shared by several countries. The trigger shows the calling code, while dropdown options show country names and flags. `onChange` reports the full formatted string, including its calling code, and accepts that string back through `value`. Reset the field by restoring both controlled `value` and `country` props from the parent. Native `form.reset()` is not supported.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Telephone",
    defaultCountry: "US",
    format: "parentheses",
    placeholder: "(212) 555-0123",
    onChange: fn(),
    onCountryChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  argTypes: {
    format: {
      control: "select",
      options: ["parentheses", "spaces", "dashes", "digits"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TelephoneField>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField {...args} size="sm" label="Small" />
      <TelephoneField {...args} size="md" label="Medium (default)" />
      <TelephoneField {...args} size="lg" label="Large" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TelephoneField supports the shared "sm", "md", and "lg" field sizes, with heights of 28px, 36px, and 48px. The calling-code trigger and its dropdown follow the same size, keeping TelephoneField aligned with TextField and CreditCardNumber.',
      },
    },
  },
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField {...args} label="Default" />
      <TelephoneField
        {...args}
        label="With a description"
        description="Include the number where we can reach you."
      />
      <TelephoneField
        {...args}
        label="Invalid"
        defaultValue="212555"
        isInvalid
        errorMessage="Enter a complete telephone number."
      />
      <TelephoneField
        {...args}
        label="Disabled"
        defaultValue="2125550123"
        isDisabled
      />
      <TelephoneField
        {...args}
        label="Read only"
        defaultValue="2125550123"
        isReadOnly
      />
      <TelephoneField {...args} label="Required" isRequired />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "TelephoneField inherits TextField's helper text, error, disabled, read-only, and required states. Disabled and read-only fields also lock the country selector. The form controls validation through `isInvalid`, `errorMessage`, or `validate`.",
      },
    },
  },
};

export const Formats: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField
        {...args}
        label="Parentheses (default)"
        format="parentheses"
        defaultValue="2125550123"
      />
      <TelephoneField
        {...args}
        label="Spaces"
        format="spaces"
        defaultValue="2125550123"
      />
      <TelephoneField
        {...args}
        label="Dashes"
        format="dashes"
        defaultValue="2125550123"
      />
      <TelephoneField
        {...args}
        label="Digits"
        format="digits"
        defaultValue="2125550123"
      />
      <TelephoneField
        {...args}
        label="Custom mask"
        defaultValue="2125550123"
        mask="###.###.####"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Choose parentheses, spaces, dashes, or digits for the national number. A custom `mask` overrides `format`; each `#` accepts one digit and other characters are inserted as separators. In every format, `onChange` includes the country calling code and the formatted number.",
      },
    },
  },
};

export const CountryLists: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField
        {...args}
        label="United States, Canada, and United Kingdom"
        onlyCountries={["US", "CA", "GB"]}
      />
      <TelephoneField
        {...args}
        label="United Kingdom, with North America excluded"
        defaultCountry="GB"
        excludeCountries={["US", "CA"]}
        placeholder="20 7946 0958"
      />
      <TelephoneField
        {...args}
        label="Exclusions take priority"
        onlyCountries={["US", "CA", "GB"]}
        excludeCountries={["CA"]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Limit the dropdown with `onlyCountries` or remove entries with `excludeCountries`, using ISO country codes. Exclusions take priority when both lists contain a country. Changing the available options preserves the current number and does not silently select a replacement country. Flags load from a CDN when options are displayed.",
      },
    },
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("+1 (212) 555-0123");
    const [country, setCountry] = useState("US");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TelephoneField
          {...args}
          country={country}
          value={value}
          onChange={(next) => {
            setValue(next);
            args.onChange?.(next);
          }}
          onCountryChange={(next) => {
            setCountry(next);
            args.onCountryChange?.(next);
          }}
        />
        <output aria-label="Formatted telephone">{value || "Empty"}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Control the formatted string and selected country independently with `value`/`onChange` and `country`/`onCountryChange`. Selecting a country preserves the national digits and applies its mask. Digits beyond the new country's maximum length are discarded, so switching back does not restore them.",
      },
    },
  },
};
