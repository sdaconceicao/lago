import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { SearchField } from "./SearchField";

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  args: {
    onSearch: fn(),
    onChange: fn(),
    onClear: fn(),
    onSubmit: fn(),
    onKeyDown: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A search input styled to match the TextField, with a trailing search button and a clear button that appears while the field has a value. Typing fires a debounced onSearch (configurable via debounceDelay). For a suggestions dropdown, use SearchFieldWithSuggestions.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SearchField>;

export const Default: Story = {
  args: {
    label: "Search",
    placeholder: "Search documents",
  },
};

export const States: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: 320,
      }}
    >
      <SearchField
        label="Default"
        placeholder="Search documents"
        description="Searches every folder you can access."
      />
      <SearchField label="Required" placeholder="Search documents" isRequired />
      <SearchField
        label="Disabled"
        placeholder="Search documents"
        defaultValue="quarterly report"
        isDisabled
      />
      <SearchField
        label="Invalid"
        defaultValue="!!!"
        isInvalid
        errorMessage="Queries can only contain letters and numbers."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "SearchField supports the shared field states: a description below the field, a required label marker, a disabled field (input and buttons), and an invalid state with an error message.",
      },
    },
  },
};
