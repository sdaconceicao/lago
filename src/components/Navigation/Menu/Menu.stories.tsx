import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "@/components/Button/Button";
import { Menu, MenuItem, MenuTrigger, SubmenuTrigger } from "./Menu";

const meta: Meta<typeof Menu> = {
  component: Menu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A list of actions or options that a user can choose from, typically opened from a MenuTrigger (such as a button). MenuItems can be disabled and nested into submenus via SubmenuTrigger to create hierarchical menus.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Menu>;

export const Example: Story = (args) => (
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu {...args}>
      <MenuItem>Favorite</MenuItem>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Delete</MenuItem>
      <SubmenuTrigger>
        <MenuItem>Share</MenuItem>
        <Menu>
          <MenuItem>SMS</MenuItem>
          <MenuItem>Email</MenuItem>
        </Menu>
      </SubmenuTrigger>
    </Menu>
  </MenuTrigger>
);

Example.args = {};
