import type { Meta, StoryFn } from "@storybook/react";
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
} from "@/components/Disclosure/Disclosure";
import { DisclosureGroup } from "./DisclosureGroup";

const meta: Meta<typeof DisclosureGroup> = {
  component: DisclosureGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A group of Disclosures that can be expanded and collapsed. The group manages the expanded state of its children, optionally allowing only one Disclosure to be open at a time via the expandedKeys / defaultExpandedKeys props.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof DisclosureGroup>;

export const Example: Story = (args) => (
  <DisclosureGroup {...args}>
    <Disclosure id="personal">
      <DisclosureHeader>Personal Information</DisclosureHeader>
      <DisclosurePanel>
        <p>Personal information form here.</p>
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id="billing">
      <DisclosureHeader>Billing Address</DisclosureHeader>
      <DisclosurePanel>
        <p>Billing address form here.</p>
      </DisclosurePanel>
    </Disclosure>
  </DisclosureGroup>
);

Example.args = {
  defaultExpandedKeys: ["personal"],
};
