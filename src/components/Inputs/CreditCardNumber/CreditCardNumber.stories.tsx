import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { CreditCardNumber } from "./CreditCardNumber";
import { isValidCardNumber } from "./CreditCardNumber.utils";

const meta: Meta<typeof CreditCardNumber> = {
  component: CreditCardNumber,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A field for entering a card number. CreditCardNumber is a TextField that masks what the user types — digits only, grouped the way the brand groups them, capped at the brand's longest form — and shows the mark of the brand it recognises from the leading digits, so it carries the same label, description, validation states, and field sizing as every other field and lines up with them in a payment form. Brands are matched against their issuer identification numbers in the field itself: there is no lookup library, no network call, and no card data leaving the component. `onChange` reports the masked value, which can be passed straight back as `value`; `getCardDigits` returns the raw number and `isValidCardNumber` runs the length and Luhn checks before submit.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Card number",
    placeholder: "1234 5678 9012 3456",
    onChange: fn(),
    onBrandChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof CreditCardNumber>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <CreditCardNumber {...args} size="sm" label="Small" />
      <CreditCardNumber {...args} size="md" label="Medium (default)" />
      <CreditCardNumber {...args} size="lg" label="Large" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'CreditCardNumber supports the three shared field sizes: "sm" renders a compact 28px-tall field with 12px text, "md" (the default) a 36px-tall field with 14px text, and "lg" a roomy 48px-tall field with 16px text. The brand mark scales with the field, so a CreditCardNumber lines up exactly with a TextField, Select, or DatePicker placed beside it in a row.',
      },
    },
  },
};

export const Brands: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <CreditCardNumber
        {...args}
        label="Visa"
        defaultValue="4242424242424242"
      />
      <CreditCardNumber
        {...args}
        label="Mastercard"
        defaultValue="5555555555554444"
      />
      <CreditCardNumber
        {...args}
        label="American Express"
        defaultValue="378282246310005"
      />
      <CreditCardNumber
        {...args}
        label="Discover"
        defaultValue="6011111111111117"
      />
      <CreditCardNumber
        {...args}
        label="Diners Club"
        defaultValue="36227206271667"
      />
      <CreditCardNumber {...args} label="JCB" defaultValue="3566002020360505" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The brand is read from the leading digits and changes both the mask and the mark in the field. Visa, Mastercard, Discover, JCB, UnionPay, and Maestro group in fours; American Express groups 4-6-5 and Diners Club 4-6-4, and each brand stops at the longest number it issues. Marks come from `react-payment-logos` and all share one card canvas, so the slot reserves their width from the start and the field never reflows as the brand resolves. Until the digits settle on one brand — "6" alone could open a Discover, UnionPay, or Maestro number — the slot holds an outline card icon rather than a card, so an unrecognised number is never mistaken for a recognised one. The mark is hidden from assistive technology; the brand is announced instead through a polite status message, so a screen reader hears "Visa card" once rather than on every keystroke.',
      },
    },
  },
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <CreditCardNumber {...args} label="Default" />
      <CreditCardNumber
        {...args}
        label="With a description"
        description="The 16 digits across the front of the card."
      />
      <CreditCardNumber
        {...args}
        label="Invalid"
        defaultValue="4242424242424241"
        isInvalid
        errorMessage="That card number does not look right."
      />
      <CreditCardNumber
        {...args}
        label="Disabled"
        defaultValue="4242424242424242"
        isDisabled
      />
      <CreditCardNumber {...args} label="Required" isRequired />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "CreditCardNumber inherits every TextField state. A `description` renders below the field as helper text. `isInvalid` colours the field and swaps the description for `errorMessage`, which is associated with the input so a screen reader reads it as the field's description. `isDisabled` greys out the input and drains the colour from the brand mark, which stays visible — a number the user cannot edit is still one they may need to check. `isRequired` marks the label.",
      },
    },
  },
};

export const Validation: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    const [isInvalid, setIsInvalid] = useState(false);

    return (
      <CreditCardNumber
        {...args}
        label="Card number"
        description="Try 4242 4242 4242 4242."
        value={value}
        isInvalid={isInvalid}
        errorMessage="Check the number and try again."
        onChange={(next) => {
          setValue(next);
          setIsInvalid(false);
        }}
        onBlur={() => setIsInvalid(value !== "" && !isValidCardNumber(value))}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The field masks and identifies a number but does not decide whether it is acceptable, so validation stays with the form. `isValidCardNumber` checks that the number is a length its brand issues and that it passes the Luhn checksum, which catches mistyped and transposed digits — not whether the card exists, which only the payment processor can answer. Run it on blur, as here, or on submit, and drive `isInvalid` and `errorMessage` with the result.",
      },
    },
  },
};
