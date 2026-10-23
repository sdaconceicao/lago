import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { expect, fn } from "storybook/test";
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

export const Default: Story = (args) => <RichTextEditor {...args} />;

Default.args = {
  label: "Release notes",
  description: "Supports headings, lists, links and inline formatting.",
};

export const ResponsiveToolbar: Story = (args) => (
  <div
    style={{
      width: 480,
      maxWidth: "100%",
      minWidth: 160,
      resize: "horizontal",
      overflow: "auto",
    }}
  >
    <RichTextEditor {...args} label="Release notes" />
  </div>
);

ResponsiveToolbar.parameters = {
  docs: {
    description: {
      story:
        "The toolbar stays on one line and keeps each section together. Sections that do not fit appear in a bar below the three-dot More formatting button. Drag the panel's bottom-right corner to resize it and watch sections move between the main bar and the popover.",
    },
  },
};

export const Headings: Story = (args) => (
  <RichTextEditor
    {...args}
    label="Heading styles"
    toolbar={[["heading"]]}
    defaultValue="<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6><p>Normal text</p>"
  />
);

Headings.parameters = {
  docs: {
    description: {
      story:
        "A single heading dropdown offers Normal text and Heading 1 through Heading 6. It follows the block at the cursor and applies the chosen style without replacing its text. All six heading levels are shown together here.",
    },
  },
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
        'RichTextEditor content follows the shared field scale: "sm" uses 12px text, "md" (the default) uses 14px, and "lg" uses 16px, with matching field padding. The toolbar and its menus stay compact: small editors use 28px controls, while medium and large editors use 36px controls and medium toolbar padding. The default content area leaves room for two body-text lines, matching TextArea.',
    },
  },
};

export const Rows: Story = (args) => {
  const content =
    "<p>First line<br>Second line<br>Third line<br>Fourth line<br>Fifth line<br>Sixth line<br>Seventh line<br>Eighth line</p>";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 24,
      }}
    >
      <RichTextEditor
        {...args}
        label="Grows with content"
        rows={undefined}
        defaultValue={content}
      />
      <RichTextEditor
        {...args}
        label="Four visible lines"
        rows={4}
        defaultValue={content}
      />
    </div>
  );
};

Rows.parameters = {
  docs: {
    description: {
      story:
        "Without rows, the editor grows with its content. Set rows to fix the content viewport to that many body-text lines and scroll additional content while the toolbar stays visible. Headings and paragraph spacing can consume more than one body-text line.",
    },
  },
};

Rows.play = async ({ canvasElement }) => {
  const [growing, fixed] = canvasElement.querySelectorAll<HTMLElement>(
    '[contenteditable="true"]'
  );
  if (!growing || !fixed) throw new Error("Missing row sizing examples");
  const style = getComputedStyle(fixed);
  const padding =
    Number.parseFloat(style.paddingTop) +
    Number.parseFloat(style.paddingBottom);
  expect(fixed.getBoundingClientRect().height).toBeCloseTo(
    4 * Number.parseFloat(style.lineHeight) + padding,
    0
  );
  expect(fixed.scrollHeight).toBeGreaterThan(fixed.clientHeight);
  expect(style.overflowY).toBe("auto");
  expect(growing.scrollHeight).toBeLessThanOrEqual(growing.clientHeight + 1);
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
      toolbar={[["heading"], ["bold", "italic"], ["undo", "redo"]]}
    />
    <RichTextEditor {...args} label="No toolbar" toolbar={[]} />
  </div>
);

CustomToolbar.parameters = {
  docs: {
    description: {
      story:
        "The `toolbar` prop is an ordered list of groups, each an ordered list of tools. Every group renders square icon toggles with rounded corners, with a separator between groups, so grouping is a layout decision the consumer makes rather than one baked into the component. Because the array is both ordered and explicit it controls which tools appear as well as the order they appear in — omitting a tool hides its button, and an empty array renders no toolbar at all. Hiding a button does not remove the formatting itself: the keyboard shortcut still works and pasted content keeps its marks, because the extension set is fixed and changing it would mean rebuilding the editor and losing the document.",
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
