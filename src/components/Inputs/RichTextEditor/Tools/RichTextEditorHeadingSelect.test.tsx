import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { RichTextEditorHeadingSelect } from "./RichTextEditorHeadingSelect";

const editors: Editor[] = [];
const createEditor = (content = "<p>Hello</p>") => {
  const editor = new Editor({ extensions: [StarterKit], content });
  editors.push(editor);
  return editor;
};

beforeAll(() => {
  Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => new DOMRect();
});

afterEach(() => {
  for (const editor of editors) editor.destroy();
  editors.length = 0;
});

describe("RichTextEditorHeadingSelect", () => {
  it("offers normal text and all six heading levels", async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditorHeadingSelect
        editor={createEditor()}
        size="md"
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Heading/ }));

    expect(
      (await screen.findAllByRole("option")).map((item) => item.textContent)
    ).toEqual([
      "Normal text",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Heading 4",
      "Heading 5",
      "Heading 6",
    ]);
  });

  it.each([1, 2, 3, 4, 5, 6])("applies Heading %s", async (level) => {
    const user = userEvent.setup();
    const editor = createEditor();
    const onChange = vi.fn();
    render(
      <RichTextEditorHeadingSelect
        editor={editor}
        size="md"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /Heading/ }));
    await user.click(
      await screen.findByRole("option", { name: `Heading ${level}` })
    );

    expect(editor.state.doc.firstChild?.type.name).toBe("heading");
    expect(editor.state.doc.firstChild?.attrs.level).toBe(level);
    expect(editor.state.doc.textContent).toBe("Hello");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("returns a heading to normal text", async () => {
    const user = userEvent.setup();
    const editor = createEditor("<h3>Hello</h3>");
    const onChange = vi.fn();
    render(
      <RichTextEditorHeadingSelect
        editor={editor}
        size="md"
        onChange={onChange}
      />
    );
    expect(screen.getByRole("button", { name: /Heading/ })).toHaveTextContent(
      "Heading 3"
    );

    await user.click(screen.getByRole("button", { name: /Heading/ }));
    await user.click(
      await screen.findByRole("option", { name: "Normal text" })
    );

    expect(editor.state.doc.firstChild?.type.name).toBe("paragraph");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("follows formatting changed outside the select", async () => {
    const editor = createEditor();
    render(
      <RichTextEditorHeadingSelect
        editor={editor}
        size="md"
        onChange={vi.fn()}
      />
    );

    act(() => {
      editor.commands.setHeading({ level: 2 });
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Heading/ })).toHaveTextContent(
        "Heading 2"
      )
    );
  });

  it("disables heading levels the editor does not support", async () => {
    const user = userEvent.setup();
    const editor = new Editor({
      extensions: [StarterKit.configure({ heading: { levels: [1, 2] } })],
      content: "<p>Hello</p>",
    });
    editors.push(editor);
    render(
      <RichTextEditorHeadingSelect
        editor={editor}
        size="md"
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Heading/ }));

    expect(
      await screen.findByRole("option", { name: "Heading 3" })
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("option", { name: "Heading 1" })
    ).not.toHaveAttribute("aria-disabled", "true");
  });

  it("prevents opening a disabled select", async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditorHeadingSelect
        editor={createEditor()}
        size="md"
        isDisabled
        onChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole("button", { name: /Heading/ });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("ignores an open menu's selection after the editor becomes read-only", async () => {
    const user = userEvent.setup();
    const editor = createEditor();
    const onChange = vi.fn();
    render(
      <RichTextEditorHeadingSelect
        editor={editor}
        size="md"
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Heading/ }));
    const option = await screen.findByRole("option", { name: "Heading 2" });
    const before = editor.getJSON();

    act(() => editor.setEditable(false));
    await user.click(option);

    expect(editor.getJSON()).toEqual(before);
    expect(onChange).not.toHaveBeenCalled();
  });
});
