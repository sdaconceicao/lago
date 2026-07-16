import type { Meta, StoryFn } from "@storybook/react";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A clickable element that navigates the user to another page or resource, either within the app or externally. Links are styled distinctly from buttons to signal navigation and support href, target, and other anchor behaviors.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Link>;

export const Example: Story = (args) => <Link {...args}>The missing link</Link>;

Example.args = {
  href: "https://www.imdb.com/title/tt6348138/",
  target: "_blank",
};
