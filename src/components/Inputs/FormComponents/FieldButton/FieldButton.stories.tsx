import { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Eye, EyeOff, X } from "lucide-react";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { FieldButton } from "./FieldButton";

const meta: Meta<typeof FieldButton> = {
  component: FieldButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A compact, square icon button styled to sit inside a form field — commonly used for clear, reveal-password, or dropdown-toggle actions. It powers the trigger buttons in DatePicker, Select, and MultiSelect. Pass it to a TextField's `button` slot (or drop it in as the last child of any field container) and it sizes and aligns itself automatically; no per-field overrides required.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // The button holds an icon, not editable text, and wires its own onPress.
    children: { table: { disable: true } },
    onPress: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryFn<typeof FieldButton>;

/**
 * A clearable search field. The FieldButton is passed to the TextField's
 * `button` slot, so it shares the field's inset surface and lines up with the
 * DatePicker and Select fields. It clears the input on press and only appears
 * while there is text to clear. Toggle `isDisabled` in the controls to see the
 * disabled styling.
 */
export const Example: Story = (args) => {
  const [value, setValue] = useState("Hello world");
  return (
    <div style={{ width: 260 }}>
      <TextField
        label="Search"
        value={value}
        onChange={setValue}
        placeholder="Type to search…"
        button={
          value ? (
            <FieldButton
              {...args}
              aria-label="Clear"
              onPress={() => setValue("")}
            >
              <X />
            </FieldButton>
          ) : undefined
        }
      />
    </div>
  );
};

/**
 * A password field with a reveal toggle. Pressing the FieldButton switches the
 * input between hidden and visible and swaps the eye icon accordingly.
 */
export const RevealPassword: Story = () => {
  const [value, setValue] = useState("hunter2");
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ width: 260 }}>
      <TextField
        label="Password"
        value={value}
        onChange={setValue}
        type={visible ? "text" : "password"}
        placeholder="Enter a password"
        button={
          <FieldButton
            aria-label={visible ? "Hide password" : "Show password"}
            onPress={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff /> : <Eye />}
          </FieldButton>
        }
      />
    </div>
  );
};

RevealPassword.parameters = {
  docs: {
    description: {
      story:
        "A common reveal-password pattern: the FieldButton toggles the input's type between `password` and `text`, and swaps between the eye and eye-off icons to reflect the current state.",
    },
  },
};

/**
 * The FieldButton in its enabled and disabled states. When disabled it drops
 * its background and dims to the disabled text color.
 */
export const States: Story = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      width: 260,
    }}
  >
    <TextField
      label="Enabled"
      defaultValue="Hello world"
      button={
        <FieldButton aria-label="Clear">
          <X />
        </FieldButton>
      }
    />
    <TextField
      label="Disabled"
      defaultValue="Hello world"
      isDisabled
      button={
        <FieldButton aria-label="Clear" isDisabled>
          <X />
        </FieldButton>
      }
    />
  </div>
);

States.parameters = {
  docs: {
    description: {
      story:
        "The FieldButton's enabled and disabled appearance. Disabling the surrounding TextField also disables the button, which removes its fill and dims the icon to the disabled text color.",
    },
  },
};
