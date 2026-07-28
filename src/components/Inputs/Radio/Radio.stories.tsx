import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
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
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Radio supports two sizes: "sm" scales the indicator, label text, and spacing down so the control sits comfortably beside 28px-tall fields, and "md" (the default) is the standard control. Setting `size` on the RadioGroup scopes every item inside it, as shown here; an individual Radio may override it. A Radio is not a field box, so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them — matching the size only keeps the type and control weight consistent across a compact form.',
    },
  },
};
