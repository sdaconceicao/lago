import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Password } from "./Password";

const meta: Meta<typeof Password> = {
  component: Password,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'A masked field for entering a password. Password is a TextField locked to `type="password"` with a trailing button that reveals the value in plain text, so it carries the same label, description, validation states, and field sizing as every other field and lines up with them in a form. Set `isRevealable` to false to drop the reveal button, and pass `autoComplete` — `"current-password"` on a sign-in form, `"new-password"` where the user is choosing one — so browsers and password managers fill and save the right value.',
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Password",
    placeholder: "Enter your password",
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Password>;

export const Default: Story = {
  args: {
    autoComplete: "current-password",
    isRevealable: true,
    size: "md",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Password {...args} size="sm" label="Small" />
      <Password {...args} size="md" label="Medium (default)" />
      <Password {...args} size="lg" label="Large" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Password supports the three shared field sizes: "sm" renders a compact 28px-tall field with 12px text, "md" (the default) a 36px-tall field with 14px text, and "lg" a roomy 48px-tall field with 16px text. The reveal button scales with the field, so a Password lines up exactly with a TextField, Select, or DatePicker placed beside it in a row.',
      },
    },
  },
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Password {...args} label="Default" />
      <Password
        {...args}
        label="With a description"
        description="At least 12 characters, including a number."
      />
      <Password
        {...args}
        label="Invalid"
        defaultValue="short"
        isInvalid
        errorMessage="Password must be at least 12 characters."
      />
      <Password {...args} label="Disabled" defaultValue="hunter2" isDisabled />
      <Password {...args} label="Required" isRequired />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Password inherits every TextField state. A `description` renders below the field as helper text — the place to state the password rules. `isInvalid` colours the field and swaps the description for `errorMessage`. `isDisabled` greys out the input and its reveal button together, so a masked value cannot be unmasked while the field is inert. `isRequired` marks the label.",
      },
    },
  },
};

export const Reveal: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Password {...args} label="Revealable (default)" defaultValue="hunter2" />
      <Password
        {...args}
        label="Always masked"
        defaultValue="hunter2"
        isRevealable={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'By default Password shows an eye button that unmasks the value so the user can check what they typed; pressing it again masks the value and the button\'s accessible name flips between "Show password" and "Hide password". Set `isRevealable` to false where the value must stay masked — on a shared or observed screen, for instance — and the field renders as a plain masked input with no trailing button.',
      },
    },
  },
};
