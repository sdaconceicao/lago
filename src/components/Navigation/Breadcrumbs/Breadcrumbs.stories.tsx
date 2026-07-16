import type { Meta, StoryFn } from "@storybook/react";
import { Breadcrumb, Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A list of links that show the current page's location within a hierarchical site structure. Each Breadcrumb is typically a link; the last item represents the current page and is not interactive.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Breadcrumbs>;

export const Example: Story = (args) => (
  <Breadcrumbs {...args}>
    <Breadcrumb href="/">Home</Breadcrumb>
    <Breadcrumb href="/react-aria/">React Aria</Breadcrumb>
    <Breadcrumb>Breadcrumbs</Breadcrumb>
  </Breadcrumbs>
);
