import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { RichTextEditor } from "./RichTextEditor";

const meta: Meta<typeof RichTextEditor> = {
  component: RichTextEditor,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A rich text editor for formatted prose, built on tiptap with lago's own toolbar, field shell, label, help text and validation. Because tiptap edits a `contenteditable` rather than an `input`, the label, description and error wiring are stated on the editable element directly instead of coming from a react-aria field — the accessible name and description therefore sit on the element that takes the typing. Every common formatting control is present by default; the `toolbar` prop reorders or narrows the set.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Write something…",
    onChange: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof RichTextEditor>;

export const Example: Story = (args) => <RichTextEditor {...args} />;

Example.args = {
  label: "Release notes",
  description: "Supports headings, lists, links and inline formatting.",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <RichTextEditor {...args} size="sm" label="Small" />
    <RichTextEditor {...args} size="md" label="Medium (default)" />
    <RichTextEditor {...args} size="lg" label="Large" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'RichTextEditor supports the same three field sizes as every other input: "sm" renders 28px toolbar buttons with 12px text, "md" (the default) renders 36px buttons with 14px text, and "lg" renders 48px buttons with 16px text. The size scales the toolbar buttons, the field padding, and the content text together, and the minimum content height is one single-line field of that size plus a second row of text, matching TextArea so the two read as the same family when stacked in a form.',
    },
  },
};

export const States: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <RichTextEditor {...args} label="Default" />
    <RichTextEditor
      {...args}
      label="Required"
      isRequired
      description="An asterisk marks the field required."
    />
    <RichTextEditor
      {...args}
      label="Invalid"
      isInvalid
      errorMessage="Release notes are required."
      defaultValue=""
    />
    <RichTextEditor
      {...args}
      label="Read-only"
      isReadOnly
      defaultValue="<p>Content can be selected and copied, but not edited.</p>"
    />
    <RichTextEditor
      {...args}
      label="Disabled"
      isDisabled
      defaultValue="<p>Neither the toolbar nor the content can be reached.</p>"
    />
  </div>
);

States.parameters = {
  docs: {
    description: {
      story:
        "RichTextEditor carries the same states as the other fields. `isRequired` appends the asterisk to the label and sets `aria-required` on the editable element. `isInvalid` draws the invalid border, sets `aria-invalid`, and renders `errorMessage` through the same `FieldError` element every other input uses. `isReadOnly` allows focus and selection but not editing, and `isDisabled` takes the toolbar and the content out of reach together — in both cases the toolbar buttons disable alongside the content, so the controls never offer an edit the field will refuse.",
    },
  },
};

export const CustomToolbar: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <RichTextEditor
      {...args}
      label="Comment"
      toolbar={[["bold", "italic", "strike"], ["link"], ["bulletList"]]}
    />
    <RichTextEditor
      {...args}
      label="Reordered, headings first"
      toolbar={[
        ["heading1", "heading2"],
        ["bold", "italic"],
        ["undo", "redo"],
      ]}
    />
    <RichTextEditor {...args} label="No toolbar" toolbar={[]} />
  </div>
);

CustomToolbar.parameters = {
  docs: {
    description: {
      story:
        "The `toolbar` prop is an ordered list of groups, each an ordered list of tools. Every group renders as one segmented button track, with a separator between groups, so grouping is a layout decision the consumer makes rather than one baked into the component. Because the array is both ordered and explicit it controls which tools appear as well as the order they appear in — omitting a tool hides its button, and an empty array renders no toolbar at all. Hiding a button does not remove the formatting itself: the keyboard shortcut still works and pasted content keeps its marks, because the extension set is fixed and changing it would mean rebuilding the editor and losing the document.",
    },
  },
};

const ControlledExample = (args: Parameters<typeof RichTextEditor>[0]) => {
  const [html, setHtml] = useState("<p>Edit me and watch the HTML below.</p>");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <RichTextEditor
        {...args}
        label="Release notes"
        value={html}
        onChange={(next) => {
          setHtml(next);
          args.onChange?.(next);
        }}
      />
      <pre
        style={{
          margin: 0,
          padding: "0.75rem",
          overflowX: "auto",
          fontSize: "0.75rem",
        }}
      >
        {html}
      </pre>
    </div>
  );
};

export const Controlled: Story = (args) => <ControlledExample {...args} />;

Controlled.parameters = {
  docs: {
    description: {
      story:
        "Pass `value` with `onChange` to drive the document from your own state; pass `defaultValue` alone to leave the editor uncontrolled. In controlled mode the editor only writes an incoming `value` back into the document when the HTML genuinely differs, so round-tripping every keystroke through your state does not move the caret to the start of the document. To submit the content with a native form instead, give the editor a `name` and it renders a hidden input carrying the HTML.",
    },
  },
};
