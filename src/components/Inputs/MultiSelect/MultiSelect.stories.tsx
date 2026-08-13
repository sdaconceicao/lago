import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import type { PresenceStatus } from "@/components/Feedback/StatusIndicator/StatusIndicator";
import { Avatar } from "@/components/Media/Avatar/Avatar";
import { Text } from "@/components/Typography/index";
import { MultiSelect, MultiSelectItem } from "./MultiSelect";

const fruits = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "carrot", name: "Carrot" },
  { id: "date", name: "Date" },
  { id: "eggplant", name: "Eggplant" },
  { id: "fig", name: "Fig" },
  { id: "grape", name: "Grape" },
];

type Fruit = (typeof fruits)[number];

const meta: Meta<typeof MultiSelect> = {
  component: MultiSelect,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A multi-select combobox. Typing in the input filters the list, options toggle with checkboxes and remain visible while the menu stays open, and selected items render as removable tags or comma-separated text. Backspace in an empty input removes the most recently selected item.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Fruits",
    placeholder: "Search fruits...",
    displayMode: "tags",
    onChange: fn(),
    onSelectionChange: fn(),
    onOpenChange: fn(),
    onInputChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  argTypes: {
    displayMode: {
      control: "select",
      options: ["tags", "text"],
    },
    children: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: (args) => (
    <MultiSelect {...args} defaultItems={fruits}>
      {(item) => (
        <MultiSelectItem id={(item as Fruit).id}>
          {(item as Fruit).name}
        </MultiSelectItem>
      )}
    </MultiSelect>
  ),
};

interface Person {
  id: string;
  name: string;
  role: string;
  status: PresenceStatus;
}

const people: Person[] = [
  { id: "ada", name: "Ada Lovelace", role: "Engineering", status: "online" },
  { id: "grace", name: "Grace Hopper", role: "Compilers", status: "busy" },
  { id: "alan", name: "Alan Turing", role: "Research", status: "idle" },
  {
    id: "katherine",
    name: "Katherine Johnson",
    role: "Flight dynamics",
    status: "offline",
  },
];

export const CustomItemRenderer: Story = {
  render: (args) => (
    <MultiSelect {...args} defaultItems={people}>
      {(item) => {
        const person = item as Person;
        return (
          <MultiSelectItem id={person.id} textValue={person.name}>
            <Avatar
              size="sm"
              name={person.name}
              alt=""
              status={person.status}
              statusLabel=""
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text slot="label">{person.name}</Text>
              <Text slot="description">{person.role}</Text>
            </div>
          </MultiSelectItem>
        );
      }}
    </MultiSelect>
  ),
  args: {
    label: "Reviewers",
    placeholder: "Search people...",
    defaultValue: ["ada"],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Passing a function as children renders each option yourself: the function receives an entry from defaultItems and returns a MultiSelectItem, whose children can be any ReactNode — here an Avatar with a presence dot beside a name and role. The shared checkbox indicator is still rendered for you, ahead of whatever you return. Two things to keep in mind. Set textValue on the item: with non-string children the component has no text to fall back on, and textValue is what typeahead filtering matches and what the field shows for a selection — the tag chips in "tags" mode and the comma-separated list in "text" mode both read it, so without it a selected option has no visible label. Use Text slot="label" and slot="description" for the two lines rather than plain elements, so they pick up the dropdown\'s own label and description styling, including at the other sizes and in the highlighted state.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <MultiSelect<Fruit>
        label="Small"
        size="sm"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana", "carrot"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Medium (default)"
        size="md"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana", "carrot"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Large"
        size="lg"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana", "carrot"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'MultiSelect supports three sizes: "sm" renders a compact 28px-tall field with 12px text and 20px tag chips, "md" (the default) a 36px-tall field with 14px text and 24px chips, and "lg" a roomy 48px-tall field with 16px text and 32px chips. The size also travels to the dropdown, so its options and checkboxes scale with the field. "sm" and "md" keep a fixed height: their tags never wrap, so the field stays exactly 28px or 36px tall however many items are selected and keeps lining up with the controls beside it. That matters most at "md", the default: measured, a wrapping 36px field reaches 66px on two chips in any column narrower than about 270px, which is most form columns. What does not fit collapses into a "+N" counter instead — see the Overflow story. At "lg" the tags do wrap and the field grows to fit them, showing a whole selection at once at the cost of no longer matching the height of its neighbours.',
      },
    },
  },
};

export const DisplayModes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <MultiSelect<Fruit>
        label="Tags display"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Text display"
        placeholder="Search fruits..."
        displayMode="text"
        defaultItems={fruits}
        defaultValue={["apple", "carrot"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'MultiSelect supports two display modes for selected items: "tags" (default) renders removable tag chips with close buttons, while "text" renders a comma-separated list. In both modes items can be toggled from the dropdown and removed with Backspace when the input is empty.',
      },
    },
  },
};

const counties = [
  "Philadelphia",
  "Northumberland",
  "Westmoreland",
  "Susquehanna",
  "Lackawanna",
  "Erie",
];

type County = { id: string; name: string };

const countyItems: County[] = counties.map((name) => ({
  id: name.toLowerCase(),
  name: `${name} County`,
}));

const OVERFLOW_WIDTHS = [200, 320, 560, 800] as const;

export const Overflow: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {OVERFLOW_WIDTHS.map((width) => (
        <div key={width} style={{ width }} data-testid={`overflow-${width}`}>
          <MultiSelect<County>
            label={`${width}px column`}
            placeholder="All counties"
            defaultItems={countyItems}
            defaultValue={countyItems.map((county) => county.id)}
          >
            {(item) => (
              <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>
            )}
          </MultiSelect>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const results = OVERFLOW_WIDTHS.map((width) => {
      const root = canvasElement.querySelector<HTMLElement>(
        `[data-testid="overflow-${width}"]`
      );
      if (!root) throw new Error(`missing ${width}px column`);

      const field = root.querySelector<HTMLElement>(".react-aria-Group");
      if (!field) throw new Error(`no field in the ${width}px column`);

      const tags = [...root.querySelectorAll<HTMLElement>(".react-aria-Tag")];
      // The offscreen measuring probe is a counter too; the visible one is the
      // one that takes part in layout.
      const counter = [
        ...root.querySelectorAll<HTMLElement>("[class*='counter']"),
      ].find((element) => getComputedStyle(element).visibility !== "hidden");

      return { width, field, tags, counter };
    });

    for (const { width, field, tags, counter } of results) {
      const label = `${width}px column`;

      // The whole point of collapsing rather than scrolling: the field is
      // still exactly one row, and nothing has spilled out of it.
      expect(
        Math.round(field.getBoundingClientRect().height),
        `${label}: field height`
      ).toBe(36);
      expect(field.scrollWidth, `${label}: no overflow`).toBeLessThanOrEqual(
        field.clientWidth + 1
      );

      expect(tags.length, `${label}: at least one tag`).toBeGreaterThan(0);

      for (const tag of tags) {
        // A tag squeezed narrower than its content is the bug this story
        // exists for: the label ellipsises away and the remove button goes
        // with it. The one exception is the floor — when a single tag is all
        // that is rendered there is nothing left to collapse, so it is allowed
        // to ellipsise rather than be dropped for a bare count.
        if (tags.length > 1) {
          expect(
            tag.scrollWidth,
            `${label}: "${tag.textContent}" not clipped`
          ).toBeLessThanOrEqual(tag.clientWidth + 1);
        }

        const remove = tag.querySelector("button");
        expect(
          remove,
          `${label}: "${tag.textContent}" has a remove button`
        ).not.toBeNull();
        expect(
          remove?.getBoundingClientRect().width ?? 0,
          `${label}: remove button is hittable`
        ).toBeGreaterThanOrEqual(12);
      }

      // Even the ellipsised floor tag keeps a readable amount of its label.
      if (tags.length === 1) {
        expect(
          tags[0].getBoundingClientRect().width,
          `${label}: floor tag is still legible`
        ).toBeGreaterThan(40);
      }

      const hidden = countyItems.length - tags.length;
      if (hidden > 0) {
        expect(counter, `${label}: counter is rendered`).toBeTruthy();
        expect(counter?.textContent, `${label}: counter text`).toContain(
          `+${hidden}`
        );
      } else {
        expect(
          counter,
          `${label}: no counter when everything fits`
        ).toBeUndefined();
      }
    }

    // The count is measured, not fixed: a wider column spends the room it has
    // on more tags rather than leaving it empty. Asserted as a trend rather
    // than a step per column, because how many tags a given width fits depends
    // on font metrics — the exact numbers are not the contract.
    const visible = results.map((result) => result.tags.length);
    for (let i = 1; i < visible.length; i++) {
      expect(
        visible[i],
        `${OVERFLOW_WIDTHS[i]}px shows no fewer than ${OVERFLOW_WIDTHS[i - 1]}px`
      ).toBeGreaterThanOrEqual(visible[i - 1]);
    }
    expect(
      visible[visible.length - 1],
      "the widest column shows more than the narrowest"
    ).toBeGreaterThan(visible[0]);
  },
};

Overflow.parameters = {
  docs: {
    description: {
      story:
        'At "sm" and "md" the field is a single fixed-height row, so a selection that does not fit is not shrunk to fit: the tags that fit are rendered at their natural width and the rest collapse into a "+N" counter. How many fit is measured rather than configured, so the same component fills a wide column with tags and a narrow sidebar with one tag and a count — labels of different lengths included. The three columns here hold the same six selected counties. Each visible tag keeps its full label and a hit-testable remove button, the count is announced to screen readers as "N more selected", and the field never leaves 36px.',
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <MultiSelect<Fruit>
        label="Default"
        placeholder="Search fruits..."
        defaultItems={fruits}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="With selected items"
        placeholder="Search fruits..."
        defaultItems={fruits}
        defaultValue={["apple", "banana", "fig"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="With description"
        placeholder="Search fruits..."
        description="Pick one or more fruits"
        defaultItems={fruits}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Invalid"
        placeholder="Search fruits..."
        isInvalid
        errorMessage="Please select at least one fruit"
        defaultItems={fruits}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
      <MultiSelect<Fruit>
        label="Disabled"
        placeholder="Search fruits..."
        isDisabled
        defaultItems={fruits}
        defaultValue={["apple"]}
      >
        {(item) => <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>}
      </MultiSelect>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "MultiSelect states: default, with selected items, with a description, invalid with an error message, and disabled. The invalid state highlights the field border and shows the error below it; the disabled state prevents all interaction.",
      },
    },
  },
};
