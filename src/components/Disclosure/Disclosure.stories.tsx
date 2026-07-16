import type { Meta, StoryFn } from "@storybook/react";
import { Disclosure, DisclosureHeader, DisclosurePanel } from "./Disclosure";

const meta: Meta<typeof Disclosure> = {
  component: Disclosure,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A collapsible section that shows or hides its associated content panel. The DisclosureHeader acts as the trigger (typically a button) that toggles the panel open or closed, and the DisclosurePanel holds the expandable content.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Disclosure>;

export const Example: Story = (args) => (
  <Disclosure {...args}>
    <DisclosureHeader>Manage your account</DisclosureHeader>
    <DisclosurePanel>Details on managing your account</DisclosurePanel>
  </Disclosure>
);
