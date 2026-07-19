import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import {
  SearchField,
  type SearchFieldProps,
  type SearchSuggestion,
} from "./SearchField";

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  args: {
    onSearch: fn(),
    onSuggestionSelect: fn(),
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
          "A search input styled to match the TextField, with a trailing search button and a clear button that appears while the field has a value. Typing fires a debounced onSearch (configurable via debounceDelay), and suggestions — static or loaded from a promise-based API — are offered in a dropdown and selectable via keyboard or pointer.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SearchField>;

const FRUITS: SearchSuggestion[] = [
  { id: "apple", label: "Apple" },
  { id: "apricot", label: "Apricot" },
  { id: "banana", label: "Banana" },
  { id: "blueberry", label: "Blueberry" },
  { id: "cherry", label: "Cherry" },
  { id: "grape", label: "Grape" },
  { id: "mango", label: "Mango" },
  { id: "orange", label: "Orange" },
  { id: "peach", label: "Peach" },
  { id: "pineapple", label: "Pineapple" },
  { id: "strawberry", label: "Strawberry" },
];

/** Simulates a promise-based search API with a little network latency. */
const searchFruits = (query: string): Promise<SearchSuggestion[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          FRUITS.filter((fruit) =>
            fruit.label.toLowerCase().includes(query.trim().toLowerCase())
          )
        ),
      600
    )
  );

export const Default: Story = {
  args: {
    label: "Search",
    placeholder: "Search documents",
  },
};

export const WithSuggestions: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <SearchField {...args} />
    </div>
  ),
  args: {
    label: "Search fruit",
    placeholder: "Start typing…",
    suggestions: FRUITS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A static suggestions list passed via the suggestions prop. Entries are filtered client-side against the query (case-insensitive contains) and shown in a dropdown; picking one fills the field and fires onSuggestionSelect. Use loadSuggestions instead when the list should come from an API.",
      },
    },
  },
};

const AsyncSuggestionsDemo = (args: SearchFieldProps) => {
  return <SearchField {...args} loadSuggestions={searchFruits} />;
};

export const WithAsyncSuggestions: Story = {
  render: (args) => <AsyncSuggestionsDemo {...args} />,
  args: {
    label: "Search fruit",
    placeholder: "Start typing…",
    description: "Suggestions load from a simulated API with 600ms latency.",
    debounceDelay: 300,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A promise-based API example. loadSuggestions receives the query and returns a promise of suggestions; calls are debounced by debounceDelay, a loading state shows in the dropdown while the promise is pending, and out-of-order responses are discarded so only the latest query's results appear. Picking a suggestion fills the field and fires onSuggestionSelect.",
      },
    },
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
