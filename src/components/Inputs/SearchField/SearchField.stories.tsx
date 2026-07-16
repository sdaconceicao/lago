import type { Meta, StoryFn } from "@storybook/react";
import { SearchField } from "./SearchField";

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input designed for searching, typically with a search icon and a clear (cancel) button. SearchField supports a label, placeholder, and an onSubmit / onChange for live or submitted queries, and is optimized for filtering content.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof SearchField>;

export const Example: Story = (args) => <SearchField {...args} />;

Example.args = {
  label: "Search",
  placeholder: "Search documents",
};
