import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { SearchSuggestion } from "../SearchField/SearchField.utils";
import {
  SearchFieldWithSuggestions,
  type SearchFieldWithSuggestionsProps,
} from "./SearchFieldWithSuggestions";

const meta: Meta<typeof SearchFieldWithSuggestions> = {
  component: SearchFieldWithSuggestions,
  args: {
    onSearch: fn(),
    onSuggestionSelect: fn(),
    onChange: fn(),
    onClear: fn(),
    onSubmit: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A SearchField with an attached suggestions dropdown. It composes the plain SearchField and layers a suggestions popover on top using react-aria's Autocomplete — the same primitive the CommandPalette uses. Suggestions are either static (via the suggestions prop, filtered client-side) or loaded from a promise (via loadSuggestions). Picking one fills the field and fires onSuggestionSelect; the same suggestion can be picked again after clearing.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SearchFieldWithSuggestions>;

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
  render: (args) => (
    <div style={{ width: 320 }}>
      <SearchFieldWithSuggestions {...args} />
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

const AsyncSuggestionsDemo = (args: SearchFieldWithSuggestionsProps) => {
  const [selected, setSelected] = useState<SearchSuggestion | null>(null);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: 320,
      }}
    >
      <SearchFieldWithSuggestions
        {...args}
        loadSuggestions={searchFruits}
        onSuggestionSelect={setSelected}
      />
      <span>
        {selected
          ? `Selected: ${selected.label} (id: ${selected.id})`
          : "Nothing selected yet."}
      </span>
    </div>
  );
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
      <SearchFieldWithSuggestions
        label="Default"
        placeholder="Search fruit"
        suggestions={FRUITS}
        description="Pick from the list or type your own query."
      />
      <SearchFieldWithSuggestions
        label="Required"
        placeholder="Search fruit"
        suggestions={FRUITS}
        isRequired
      />
      <SearchFieldWithSuggestions
        label="Disabled"
        placeholder="Search fruit"
        suggestions={FRUITS}
        defaultValue="Banana"
        isDisabled
      />
      <SearchFieldWithSuggestions
        label="Invalid"
        suggestions={FRUITS}
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
          "SearchFieldWithSuggestions supports the shared field states: a description below the field, a required label marker, a disabled field, and an invalid state with an error message.",
      },
    },
  },
};
