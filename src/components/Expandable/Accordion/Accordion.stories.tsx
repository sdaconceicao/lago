import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Accordion } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  args: {
    onExpandedChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A vertically stacked set of collapsible items built on Disclosure and DisclosureGroup. Compose it from Accordion.Item, Accordion.Header, and Accordion.Panel. By default only one item is open at a time; set allowsMultipleExpanded to let several stay open together.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// Default story (MUST be first) - connects to the Controls panel.
export const Default: Story = {
  args: {
    allowsMultipleExpanded: false,
    defaultExpandedKeys: ["shipping"],
  },
  render: (args) => (
    <Accordion {...args}>
      <Accordion.Item id="shipping">
        <Accordion.Header>Shipping</Accordion.Header>
        <Accordion.Panel>
          Choose a delivery speed and enter your shipping address.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="billing">
        <Accordion.Header>Billing</Accordion.Header>
        <Accordion.Panel>
          Enter the billing address for your payment method.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="payment">
        <Accordion.Header>Payment</Accordion.Header>
        <Accordion.Panel>
          Select a card or add a new payment method.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ),
};

export const SingleExpanded: Story = {
  args: {
    allowsMultipleExpanded: false,
    defaultExpandedKeys: ["overview"],
  },
  render: (args) => (
    <Accordion {...args}>
      <Accordion.Item id="overview">
        <Accordion.Header>Overview</Accordion.Header>
        <Accordion.Panel>A summary of the account.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="activity">
        <Accordion.Header>Activity</Accordion.Header>
        <Accordion.Panel>Recent activity for the account.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="settings">
        <Accordion.Header>Settings</Accordion.Header>
        <Accordion.Panel>Preferences and configuration.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Default behavior: with allowsMultipleExpanded left off, opening one item automatically collapses whichever item was previously open, so only a single panel is ever visible.",
      },
    },
  },
};

export const MultipleExpanded: Story = {
  args: {
    allowsMultipleExpanded: true,
    defaultExpandedKeys: ["overview", "activity"],
  },
  render: (args) => (
    <Accordion {...args}>
      <Accordion.Item id="overview">
        <Accordion.Header>Overview</Accordion.Header>
        <Accordion.Panel>A summary of the account.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="activity">
        <Accordion.Header>Activity</Accordion.Header>
        <Accordion.Panel>Recent activity for the account.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="settings">
        <Accordion.Header>Settings</Accordion.Header>
        <Accordion.Panel>Preferences and configuration.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Setting allowsMultipleExpanded lets any number of items stay open at once, so expanding one item leaves the others untouched.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    defaultExpandedKeys: ["overview"],
  },
  render: (args) => (
    <Accordion {...args}>
      <Accordion.Item id="overview">
        <Accordion.Header>Overview</Accordion.Header>
        <Accordion.Panel>A summary of the account.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="activity">
        <Accordion.Header>Activity</Accordion.Header>
        <Accordion.Panel>Recent activity for the account.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Passing isDisabled on the Accordion disables every item's trigger at once, preventing the panels from being toggled.",
      },
    },
  },
};
