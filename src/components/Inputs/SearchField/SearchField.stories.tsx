import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  SearchField,
  type SearchFieldProps,
  type SearchSuggestion,
} from "./SearchField";

const meta: Meta<typeof SearchField> = {
  component: SearchField,
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
      <SearchField
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

const DebouncedSearchDemo = (args: SearchFieldProps) => {
  const [searches, setSearches] = useState<string[]>([]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: 320,
      }}
    >
      <SearchField
        {...args}
        onSearch={(value) => setSearches((prev) => [value, ...prev])}
      />
      <div>
        <strong>onSearch calls (newest first):</strong>
        <ol reversed style={{ margin: "0.5rem 0 0", paddingLeft: "1.5rem" }}>
          {searches.map((search, index) => (
            <li key={`${searches.length - index}-${search}`}>
              {search || <em>(empty)</em>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export const DebouncedSearch: Story = {
  render: (args) => <DebouncedSearchDemo {...args} />,
  args: {
    label: "Search",
    placeholder: "Type quickly, then pause",
    debounceDelay: 500,
  },
  parameters: {
    docs: {
      description: {
        story:
          "onSearch fires once the user stops typing for debounceDelay milliseconds (500 here, 300 by default), so rapid keystrokes collapse into a single search. The list below records each onSearch call — type a word quickly and only the final value appears.",
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
