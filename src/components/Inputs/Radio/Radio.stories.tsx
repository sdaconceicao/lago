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
