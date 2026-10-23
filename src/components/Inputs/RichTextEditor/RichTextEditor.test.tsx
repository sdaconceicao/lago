import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { TOOL_REGISTRY } from "./Toolbar/toolRegistry";

/**
 * ProseMirror measures the selection to scroll it into view after every
 * command, and jsdom implements neither `getClientRects` nor
 * `getBoundingClientRect` on `Range`. Zero-size rects are enough: nothing here
 * asserts on geometry, it just has to not throw. Scoped to this file rather
 * than the shared setup because this is the only suite that drives ProseMirror.
 */
beforeAll(() => {
  // An empty list is enough: ProseMirror falls through to getBoundingClientRect.
  Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => new DOMRect();
});

/**
 * The editor is created on mount rather than during render, so every test waits
 * for the editable element before asserting on it.
 */
type ButtonTool = keyof typeof TOOL_REGISTRY;

const selectHeading = async (
  user: ReturnType<typeof userEvent.setup>,
  label: string
) => {
  await user.click(screen.getByRole("button", { name: /Heading/ }));
  await user.click(await screen.findByRole("option", { name: label }));
};

const renderEditor = async (
  props: Parameters<typeof RichTextEditor>[0] = {}
) => {
  const result = render(<RichTextEditor {...props} />);
  const textbox = await screen.findByRole("textbox");
  return { ...result, textbox };
};

describe("RichTextEditor", () => {
  describe("list indentation", () => {
    it.each(["ul", "ol"])(
      "outdents a nested checkbox into its parent %s list",
      async (listTag) => {
        const user = userEvent.setup();
        const { textbox } = await renderEditor({
          label: "Bio",
          toolbar: [],
          defaultValue: `<${listTag}><li><p>Parent</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Before</p></li><li data-type="taskItem" data-checked="true"><p><strong>Child</strong></p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Grandchild</p></li></ul></li><li data-type="taskItem" data-checked="true"><p>After</p></li></ul></li><li><p>Sibling</p></li></${listTag}>`,
        });
        textbox.focus();
        document
          .getSelection()
          ?.collapse(screen.getByText("Child").firstChild, 2);

        await user.keyboard("{Shift>}{Tab}{/Shift}");

        const items = textbox.querySelectorAll(`:scope > ${listTag} > li`);
        expect(items).toHaveLength(3);
        expect(
          Array.from(items[0].querySelectorAll("p"), (node) => node.textContent)
        ).toEqual(["Parent", "Before"]);
        expect(items[1].querySelector(":scope > p > strong")).toHaveTextContent(
          "Child"
        );
        expect(items[1]).not.toHaveAttribute("data-type", "taskItem");
        expect(
          Array.from(items[1].querySelectorAll("p"), (node) => node.textContent)
        ).toEqual(["Child", "Grandchild", "After"]);
        expect(items[2]).toHaveTextContent("Sibling");
        expect(within(textbox).getAllByRole("checkbox")).toHaveLength(3);
        for (const checkbox of within(textbox).getAllByRole("checkbox")) {
          expect(checkbox).toBeChecked();
        }
      }
    );

    it("keeps checkboxes when indenting and outdenting within a task list", async () => {
      const user = userEvent.setup();
      const { textbox } = await renderEditor({
        label: "Bio",
        toolbar: [],
        defaultValue:
          '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Parent</p></li><li data-type="taskItem" data-checked="true"><p>Child</p></li></ul>',
      });
      textbox.focus();
      document
        .getSelection()
        ?.collapse(screen.getByText("Child").firstChild, 2);

      await user.keyboard("{Tab}");
      expect(textbox.querySelectorAll(":scope > ul > li")).toHaveLength(1);
      await user.keyboard("{Shift>}{Tab}{/Shift}");

      expect(textbox.querySelectorAll(":scope > ul > li")).toHaveLength(2);
      expect(within(textbox).getAllByRole("checkbox")).toHaveLength(2);
      expect(within(textbox).getAllByRole("checkbox")[1]).toBeChecked();
    });
  });

  describe("toolbar overflow", () => {
    let toolbarWidth: number;
    let notifyResize: ResizeObserverCallback | undefined;
    let resizeTarget: Element;
    const toolbar = [["bold", "italic"], ["link"], ["heading"]] as const;
    const props = {
      label: "Bio",
      defaultValue: "<p>hello</p>",
      toolbar: toolbar.map((group) => [...group]),
    };

    beforeEach(() => {
      toolbarWidth = 200;
      notifyResize = undefined;
      resizeTarget = document.body;
      const getRect = HTMLElement.prototype.getBoundingClientRect;
      vi.spyOn(
        HTMLElement.prototype,
        "getBoundingClientRect"
      ).mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("aria-label") === "Formatting") {
          return new DOMRect(0, 0, toolbarWidth, 36);
        }
        if (this.hasAttribute("data-toolbar-section")) {
          return new DOMRect(0, 0, 80, 36);
        }
        if (this.hasAttribute("data-toolbar-more-measure")) {
          return new DOMRect(0, 0, 36, 36);
        }
        return getRect.call(this);
      });
      vi.stubGlobal(
        "ResizeObserver",
        class {
          constructor(private readonly callback: ResizeObserverCallback) {}
          observe(element: Element) {
            if (element.querySelector('[aria-label="Formatting"]')) {
              notifyResize = this.callback;
              resizeTarget = element;
            }
          }
          unobserve() {}
          disconnect() {}
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    const resizeTo = (width: number) => {
      toolbarWidth = width;
      act(() =>
        notifyResize?.(
          [
            {
              contentBoxSize: [{ inlineSize: width, blockSize: 36 }],
              borderBoxSize: [],
              devicePixelContentBoxSize: [],
              contentRect: new DOMRect(0, 0, width, 36),
              target: resizeTarget,
            },
          ],
          {} as ResizeObserver
        )
      );
    };

    it("keeps complete sections visible and reveals the remainder through More", async () => {
      const user = userEvent.setup();
      await renderEditor(props);

      expect(screen.getByRole("button", { name: "Bold" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Link" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: /Heading/ })
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "More formatting" }));

      const overflow = await screen.findByRole("toolbar", {
        name: "Additional formatting",
      });
      expect(
        within(overflow).getByRole("button", { name: /Heading/ })
      ).toBeVisible();
      expect(
        within(overflow).queryByRole("button", { name: "Bold" })
      ).not.toBeInTheDocument();
    });

    it("runs formatting from overflow and dismisses the popover", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({ ...props, onChange });

      await user.click(screen.getByRole("button", { name: "More formatting" }));
      await selectHeading(user, "Heading 1");

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining("<h1>hello</h1>")
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "More formatting" })
        ).not.toBeInTheDocument()
      );
    });

    it("restores sections as space grows and moves whole groups as it shrinks", async () => {
      await renderEditor(props);

      resizeTo(260);
      expect(
        screen.queryByRole("button", { name: "More formatting" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Heading/ })).toBeVisible();

      resizeTo(120);
      expect(screen.getByRole("button", { name: "Bold" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Italic" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Link" })
      ).not.toBeInTheDocument();

      resizeTo(110);
      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(
        screen.getByRole("button", { name: "More formatting" })
      ).toBeVisible();
    });

    it("dismisses with Escape and restores focus to More", async () => {
      const user = userEvent.setup();
      await renderEditor(props);

      await user.click(screen.getByRole("button", { name: "More formatting" }));
      await screen.findByRole("dialog", { name: "More formatting" });
      await user.keyboard("{Escape}");

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "More formatting" })
        ).toHaveFocus()
      );
      expect(
        screen.queryByRole("dialog", { name: "More formatting" })
      ).not.toBeInTheDocument();
    });

    it("keeps the link form usable when resizing restores its toolbar section", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({ ...props, onChange });
      resizeTo(120);

      await user.click(screen.getByRole("button", { name: "More formatting" }));
      await user.click(await screen.findByRole("button", { name: "Link" }));
      await user.type(
        await screen.findByRole("textbox", { name: "URL" }),
        "https://example.com"
      );
      resizeTo(260);
      expect(screen.getByRole("textbox", { name: "URL" })).toBeVisible();
      await user.click(screen.getByRole("button", { name: "Add link" }));

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('href="https://example.com"')
      );
    });

    it.each(["isDisabled", "isReadOnly"])(
      "disables More when %s",
      async (state) => {
        await renderEditor({ ...props, [state]: true });

        expect(
          screen.getByRole("button", { name: "More formatting" })
        ).toBeDisabled();
      }
    );
  });

  it("renders the editable content as a multiline textbox", async () => {
    const { textbox } = await renderEditor({ label: "Bio" });

    expect(textbox).toHaveAttribute("aria-multiline", "true");
    expect(textbox).toHaveAttribute("contenteditable", "true");
  });

  it("names the editable element with the label, which no `for` could reach", async () => {
    await renderEditor({ label: "Bio" });

    expect(screen.getByRole("textbox", { name: "Bio" })).toBeInTheDocument();
  });

  it("renders no label wiring when there is no label", async () => {
    const { textbox } = await renderEditor();

    expect(textbox).not.toHaveAttribute("aria-labelledby");
    expect(textbox).not.toHaveAttribute("aria-label");
  });

  it("names the editable element with aria-label without a visible label", async () => {
    await renderEditor({ "aria-label": "Biography" });

    expect(
      screen.getByRole("textbox", { name: "Biography" })
    ).toBeInTheDocument();
  });

  it("uses external label references ahead of aria-label", async () => {
    render(
      <>
        <span id="profile-label">Profile</span>
        <span id="biography-label">Biography</span>
      </>
    );
    await renderEditor({
      "aria-label": "Fallback name",
      "aria-labelledby": "profile-label biography-label",
    });

    expect(
      screen.getByRole("textbox", { name: "Profile Biography" })
    ).toBeInTheDocument();
  });

  it("combines visible and external labels", async () => {
    render(<span id="profile-label">Profile</span>);
    await renderEditor({
      label: "Biography",
      "aria-labelledby": "profile-label",
    });

    expect(
      screen.getByRole("textbox", { name: "Biography Profile" })
    ).toBeInTheDocument();
  });

  it("updates and removes accessible names without replacing the document", async () => {
    render(<span id="profile-label">Profile</span>);
    const props = { defaultValue: "<p>Keep this document</p>" };
    const { textbox, rerender } = await renderEditor({
      ...props,
      "aria-label": "Fallback name",
      "aria-labelledby": "profile-label",
    });
    expect(textbox).toHaveAccessibleName("Profile");

    rerender(<RichTextEditor {...props} aria-label="Biography" />);
    await waitFor(() => expect(textbox).toHaveAccessibleName("Biography"));
    expect(textbox).not.toHaveAttribute("aria-labelledby");

    rerender(<RichTextEditor {...props} />);
    await waitFor(() => expect(textbox).not.toHaveAttribute("aria-label"));
    expect(textbox).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("textbox")).toBe(textbox);
    expect(textbox).toHaveTextContent("Keep this document");
  });

  it("renders the placeholder as data the empty-node style can read", async () => {
    await renderEditor({ label: "Bio", placeholder: "Tell us about yourself" });

    expect(
      document.querySelector('[data-placeholder="Tell us about yourself"]')
    ).toBeInTheDocument();
  });

  it("renders an uncontrolled default value", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      defaultValue: "<p>Hello</p>",
    });

    expect(textbox).toHaveTextContent("Hello");
  });

  it("renders a controlled value", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      value: "<p>Controlled</p>",
      onChange: vi.fn(),
    });

    expect(textbox).toHaveTextContent("Controlled");
  });

  it("associates the description with the editable element", async () => {
    await renderEditor({ label: "Bio", description: "Max 500 characters" });

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Max 500 characters"
    );
  });

  it("shows the error message and reports invalid when isInvalid", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      isInvalid: true,
      errorMessage: "Too long",
    });

    expect(textbox).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("does not render the error message when valid", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      errorMessage: "Too long",
    });

    expect(screen.queryByText("Too long")).not.toBeInTheDocument();
    expect(textbox).not.toHaveAttribute("aria-invalid");
  });

  it("describes the editable element with both the description and the error", async () => {
    await renderEditor({
      label: "Bio",
      description: "Max 500 characters",
      isInvalid: true,
      errorMessage: "Too long",
    });

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Max 500 characters Too long"
    );
  });

  it("resolves a function error message against the validation result", async () => {
    await renderEditor({
      label: "Bio",
      isInvalid: true,
      errorMessage: ({ isInvalid }) => (isInvalid ? "Computed error" : "Fine"),
    });

    expect(screen.getByText("Computed error")).toBeInTheDocument();
  });

  it("marks the field required", async () => {
    const { textbox } = await renderEditor({ label: "Bio", isRequired: true });

    expect(textbox).toHaveAttribute("aria-required", "true");
  });

  it("makes the content uneditable when isDisabled", async () => {
    const { textbox } = await renderEditor({ label: "Bio", isDisabled: true });

    expect(textbox).toHaveAttribute("contenteditable", "false");
  });

  it("makes disabled task-list content inert and restores access in read-only mode", async () => {
    const props = {
      label: "Bio",
      toolbar: [],
      defaultValue:
        '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Task</p></li></ul>',
    };
    const { rerender, textbox } = await renderEditor({
      ...props,
      isDisabled: true,
    });
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox.closest("[inert]")).toContainElement(textbox);

    rerender(<RichTextEditor {...props} isReadOnly />);

    expect(checkbox.closest("[inert]")).toBeNull();
    expect(textbox).toHaveAttribute("aria-readonly", "true");

    rerender(<RichTextEditor {...props} />);

    expect(checkbox.closest("[inert]")).toBeNull();
    expect(textbox).toHaveAttribute("contenteditable", "true");
  });

  it("makes the content uneditable but announced read-only when isReadOnly", async () => {
    const { textbox } = await renderEditor({ label: "Bio", isReadOnly: true });

    expect(textbox).toHaveAttribute("aria-readonly", "true");
    expect(textbox).toHaveAttribute("contenteditable", "false");
  });

  it("keeps read-only content reachable by keyboard as disabled state changes", async () => {
    const user = userEvent.setup();
    const props = { label: "Bio", isReadOnly: true, toolbar: [] };
    const { textbox, rerender } = await renderEditor(props);

    await user.tab();
    expect(textbox).toHaveFocus();

    await user.tab();
    rerender(<RichTextEditor {...props} isDisabled />);

    await user.tab();
    expect(textbox).not.toHaveFocus();

    rerender(<RichTextEditor {...props} />);

    await user.tab();
    expect(textbox).toHaveFocus();
  });

  it("skips disabled content during keyboard navigation", async () => {
    const user = userEvent.setup();
    const { textbox } = await renderEditor({
      label: "Bio",
      isDisabled: true,
      toolbar: [],
    });

    await user.tab();

    expect(textbox).not.toHaveFocus();
  });

  describe("form submission", () => {
    it.each(["value", "defaultValue"] as const)(
      "omits disabled %s from FormData and includes it when read-only",
      async (valueProp) => {
        const props = {
          label: "Bio",
          name: "bio",
          [valueProp]: "<p>Hello</p>",
        };
        const { rerender } = render(
          <form aria-label="Profile">
            <RichTextEditor {...props} isDisabled />
          </form>
        );
        await screen.findByRole("textbox", { name: "Bio" });
        const form = screen.getByRole<HTMLFormElement>("form", {
          name: "Profile",
        });

        expect(new FormData(form).has("bio")).toBe(false);

        rerender(
          <form aria-label="Profile">
            <RichTextEditor {...props} isReadOnly />
          </form>
        );

        expect(new FormData(form).get("bio")).toBe("<p>Hello</p>");
      }
    );

    it("renders no hidden input without a name", async () => {
      const { container } = await renderEditor({ label: "Bio" });

      expect(
        container.querySelector('input[type="hidden"]')
      ).not.toBeInTheDocument();
    });

    it("carries the value in a hidden input when named", async () => {
      const { container } = await renderEditor({
        label: "Bio",
        name: "bio",
        defaultValue: "<p>Hello</p>",
      });

      expect(container.querySelector('input[name="bio"]')).toHaveValue(
        "<p>Hello</p>"
      );
    });

    it("submits edits made before a name is added or restored", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const view = (name?: string) => (
        <form aria-label="Profile">
          <RichTextEditor
            label="Bio"
            name={name}
            defaultValue="<p>Hello</p>"
            onChange={onChange}
            toolbar={[]}
          />
        </form>
      );
      const { rerender } = render(view());
      const textbox = await screen.findByRole("textbox", { name: "Bio" });
      const form = screen.getByRole<HTMLFormElement>("form", {
        name: "Profile",
      });

      for (const name of ["bio", "updatedBio"]) {
        expect(Array.from(new FormData(form))).toEqual([]);
        textbox.focus();
        await user.keyboard(" edited");
        const html = onChange.mock.lastCall?.[0];
        expect(html).toContain("edited");

        rerender(view(name));

        expect(screen.getByRole("textbox", { name: "Bio" })).toBe(textbox);
        expect(new FormData(form).get(name)).toBe(html);
        rerender(view());
      }
    });

    it("prefers the controlled value for the hidden input", async () => {
      const { container } = await renderEditor({
        label: "Bio",
        name: "bio",
        value: "<p>Controlled</p>",
        onChange: vi.fn(),
      });

      expect(container.querySelector('input[name="bio"]')).toHaveValue(
        "<p>Controlled</p>"
      );
    });
  });

  describe("toolbar", () => {
    it("renders the default formatting tools", async () => {
      await renderEditor({ label: "Bio" });

      for (const name of ["Bold", "Italic", "Underline", "Link", "Undo"]) {
        expect(screen.getByRole("button", { name })).toBeInTheDocument();
      }
    });

    it("renders only the tools the toolbar prop names, in that order", async () => {
      await renderEditor({
        label: "Bio",
        toolbar: [["italic", "bold"]],
      });

      const names = screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"));

      expect(names).toEqual(["Italic", "Bold"]);
    });

    it("renders a separator between groups but not before the first", async () => {
      const { container } = await renderEditor({
        label: "Bio",
        toolbar: [["bold"], ["italic"], ["underline"]],
      });

      expect(container.querySelectorAll(".react-aria-Separator")).toHaveLength(
        2
      );
    });

    it("renders no toolbar when every group is empty", async () => {
      await renderEditor({ label: "Bio", toolbar: [[], []] });

      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("renders no toolbar when the toolbar is empty", async () => {
      await renderEditor({ label: "Bio", toolbar: [] });

      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("reports each tool's pressed state, unpressed on empty content", async () => {
      await renderEditor({ label: "Bio", toolbar: [["bold"]] });

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("disables every tool when the field is disabled", async () => {
      await renderEditor({
        label: "Bio",
        isDisabled: true,
        toolbar: [["bold", "italic"]],
      });

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();
    });

    it("disables every tool when the field is read-only", async () => {
      await renderEditor({
        label: "Bio",
        isReadOnly: true,
        toolbar: [["bold"]],
      });

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    });

    it("opens the link popover rather than running a command, since a link needs a URL", async () => {
      const user = userEvent.setup();
      await renderEditor({ label: "Bio", toolbar: [["link"]] });

      await user.click(screen.getByRole("button", { name: "Link" }));

      expect(
        await screen.findByRole("textbox", { name: "URL" })
      ).toBeInTheDocument();
    });
  });

  describe("size", () => {
    it("preserves the document when a row limit is added, changed and removed", async () => {
      const onChange = vi.fn();
      const props = {
        label: "Bio",
        defaultValue: "<p>Keep this document</p>",
        onChange,
      };
      const { textbox, rerender } = await renderEditor(props);

      for (const rows of [3, 6, undefined]) {
        rerender(<RichTextEditor {...props} rows={rows} />);

        expect(screen.getByRole("textbox", { name: "Bio" })).toBe(textbox);
        expect(textbox).toHaveTextContent("Keep this document");
      }
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each(["sm", "md", "lg"] as const)(
      'renders data-field-size="%s" when specified',
      async (size) => {
        const { container } = await renderEditor({ label: "Bio", size });

        expect(container.querySelector("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
      }
    );

    it('renders data-field-size="md" by default', async () => {
      const { container } = await renderEditor({ label: "Bio" });

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });
  });

  describe("formatting", () => {
    it.each([1, 2, 3, 4, 5, 6])(
      "applies Heading %s from the dropdown",
      async (level) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        await renderEditor({
          label: "Bio",
          defaultValue: "<p>hello</p>",
          toolbar: [["heading"]],
          onChange,
        });

        await selectHeading(user, `Heading ${level}`);

        expect(onChange).toHaveBeenCalledWith(
          expect.stringContaining(`<h${level}>hello</h${level}>`)
        );
        expect(
          screen.getByRole("button", { name: /Heading/ })
        ).toHaveTextContent(`Heading ${level}`);
      }
    );

    it("updates the heading selection when the controlled document changes", async () => {
      const { rerender } = await renderEditor({
        label: "Bio",
        value: "<h6>first</h6>",
        toolbar: [["heading"]],
      });
      expect(screen.getByRole("button", { name: /Heading/ })).toHaveTextContent(
        "Heading 6"
      );

      rerender(
        <RichTextEditor
          label="Bio"
          value="<h4>second</h4>"
          toolbar={[["heading"]]}
        />
      );

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /Heading/ })
        ).toHaveTextContent("Heading 4")
      );
    });

    it.each(["isDisabled", "isReadOnly"])(
      "disables the heading dropdown when %s",
      async (state) => {
        await renderEditor({
          label: "Bio",
          toolbar: [["heading"]],
          [state]: true,
        });

        expect(screen.getByRole("button", { name: /Heading/ })).toBeDisabled();
      }
    );

    it("marks a tool pressed once its formatting is applied", async () => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["bold"]],
      });

      await user.click(screen.getByRole("button", { name: "Bold" }));

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    it("returns a heading to normal text", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<h3>hello</h3>",
        toolbar: [["heading"]],
        onChange,
      });

      await selectHeading(user, "Normal text");

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining("<p>hello</p>")
      );
      expect(screen.getByRole("button", { name: /Heading/ })).toHaveTextContent(
        "Normal text"
      );
    });

    it("reports the document HTML through onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["heading"]],
      });

      await selectHeading(user, "Heading 1");

      // StarterKit's trailing-node extension keeps an empty paragraph after a
      // block node so there is always somewhere to type past it.
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining("<h1>hello</h1>")
      );
    });

    it("sets an alignment, then clears it when the pressed button is pressed again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["alignCenter"]],
      });

      const alignCenter = () =>
        screen.getByRole("button", { name: "Align center" });

      await user.click(alignCenter());
      expect(alignCenter()).toHaveAttribute("aria-pressed", "true");

      await user.click(alignCenter());
      expect(alignCenter()).toHaveAttribute("aria-pressed", "false");
    });

    it("strips formatting with the clear tool", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<h1>hello</h1>",
        onChange,
        toolbar: [["clearFormatting"]],
      });

      await user.click(
        screen.getByRole("button", { name: "Clear formatting" })
      );

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining("<p>hello</p>")
      );
    });

    it("disables undo until there is something to undo", async () => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["undo", "heading"]],
      });

      expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();

      await selectHeading(user, "Heading 1");

      expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    });

    it("keeps the hidden input in step with the document", async () => {
      const user = userEvent.setup();
      const { container } = await renderEditor({
        label: "Bio",
        name: "bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["heading"]],
      });

      await selectHeading(user, "Heading 1");

      const hidden =
        container.querySelector<HTMLInputElement>('input[name="bio"]');
      expect(hidden?.value).toContain("<h1>hello</h1>");
    });
  });

  describe("link", () => {
    it.each(["isDisabled", "isReadOnly"] as const)(
      "prevents an open link form from editing after %s changes",
      async (state) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const props = {
          label: "Bio",
          defaultValue: "<p>hello</p>",
          toolbar: [["link"]] as Array<Array<"link">>,
          onChange,
        };
        const { rerender, textbox } = await renderEditor(props);
        await user.click(screen.getByRole("button", { name: "Link" }));
        const url = await screen.findByRole("textbox", { name: "URL" });
        await user.type(url, "https://example.com");

        rerender(<RichTextEditor {...props} {...{ [state]: true }} />);

        expect(url).toBeDisabled();
        expect(screen.getByRole("button", { name: "Add link" })).toBeDisabled();
        // A queued or programmatic submit must also respect current editability.
        const form = url.closest("form");
        if (!form) throw new Error("Expected the link form");
        fireEvent.submit(form);
        expect(onChange).not.toHaveBeenCalled();
        expect(textbox.innerHTML).toBe("<p>hello</p>");
      }
    );

    it.each(["click", "Enter"])(
      "adds a link with %s without submitting the surrounding form",
      async (trigger) => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        const onChange = vi.fn();
        render(
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <RichTextEditor
              label="Bio"
              defaultValue="<p>hello</p>"
              toolbar={[["link"]]}
              onChange={onChange}
            />
            <button type="submit">Save</button>
          </form>
        );
        await screen.findByRole("textbox", { name: "Bio" });

        await user.click(screen.getByRole("button", { name: "Link" }));
        await user.type(
          await screen.findByRole("textbox", { name: "URL" }),
          "https://example.com"
        );
        if (trigger === "click")
          await user.click(screen.getByRole("button", { name: "Add link" }));
        else await user.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith(
          expect.stringContaining('href="https://example.com"')
        );
        expect(onSubmit).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
      }
    );

    it("inserts the URL as linked text when nothing is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["link"]],
      });

      await user.click(screen.getByRole("button", { name: "Link" }));
      await user.type(
        await screen.findByRole("textbox", { name: "URL" }),
        "https://example.com"
      );
      await user.click(screen.getByRole("button", { name: "Add link" }));

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('href="https://example.com"')
      );
    });

    it("wraps the selected text rather than inserting the URL over it", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { textbox } = await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["link"]],
      });

      textbox.focus();
      await user.keyboard("{Control>}a{/Control}");
      await user.click(screen.getByRole("button", { name: "Link" }));
      await user.type(
        await screen.findByRole("textbox", { name: "URL" }),
        "https://example.com"
      );
      await user.click(screen.getByRole("button", { name: "Add link" }));

      // StarterKit's Link renders target and rel before href, so the assertion
      // matches the attribute rather than the start of the tag.
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('href="https://example.com"')
      );
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining(">hello</a>")
      );
      expect(screen.getByRole("button", { name: "Link" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    it("removes an existing link without asking for a URL again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: '<p><a href="https://example.com">hello</a></p>',
        onChange,
        toolbar: [["link"]],
      });

      await user.click(screen.getByRole("button", { name: "Link" }));

      expect(
        screen.queryByRole("textbox", { name: "URL" })
      ).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith("<p>hello</p>");
    });

    it("closes the popover without applying anything when the URL is blank", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["link"]],
      });

      await user.click(screen.getByRole("button", { name: "Link" }));
      await user.click(await screen.findByRole("button", { name: "Add link" }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("every tool", () => {
    const ALL_TOOLS = Object.keys(TOOL_REGISTRY) as ButtonTool[];

    it("renders a button for each tool the registry defines", async () => {
      await renderEditor({ label: "Bio", toolbar: [ALL_TOOLS] });

      for (const tool of ALL_TOOLS) {
        expect(
          screen.getByRole("button", { name: TOOL_REGISTRY[tool].label })
        ).toBeInTheDocument();
      }
    });

    it("reads a pressed and a disabled state for each tool without throwing", async () => {
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [ALL_TOOLS],
      });

      for (const tool of ALL_TOOLS) {
        const button = screen.getByRole("button", {
          name: TOOL_REGISTRY[tool].label,
        });
        expect(button, tool).toHaveAttribute("aria-pressed");
      }
    });

    // A mark applied to an empty selection is a stored mark rather than a
    // document change, so these are checked by their pressed state.
    const MARK_TOOLS: ButtonTool[] = [
      "bold",
      "italic",
      "underline",
      "strike",
      "code",
      "highlight",
      "subscript",
      "superscript",
    ];

    it.each(MARK_TOOLS)("presses %s when its mark is applied", async (tool) => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [[tool]],
      });
      const { label } = TOOL_REGISTRY[tool];

      await user.click(screen.getByRole("button", { name: label }));

      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    const NODE_TOOLS: Array<[ButtonTool, string]> = [
      ["bulletList", "<ul>"],
      ["orderedList", "<ol>"],
      ["taskList", 'data-type="taskList"'],
      ["blockquote", "<blockquote>"],
      ["codeBlock", "<pre>"],
      ["horizontalRule", "<hr>"],
      ["alignLeft", "text-align: left"],
      ["alignCenter", "text-align: center"],
      ["alignRight", "text-align: right"],
      ["alignJustify", "text-align: justify"],
    ];

    it.each(NODE_TOOLS)("%s rewrites the document", async (tool, expected) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [[tool]],
      });

      await user.click(
        screen.getByRole("button", { name: TOOL_REGISTRY[tool].label })
      );

      expect(onChange).toHaveBeenCalledWith(expect.stringContaining(expected));
    });

    it("undoes and redoes a change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["undo", "redo", "heading"]],
      });

      await selectHeading(user, "Heading 1");
      await user.click(screen.getByRole("button", { name: "Undo" }));

      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringContaining("<p>hello</p>")
      );

      await user.click(screen.getByRole("button", { name: "Redo" }));

      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringContaining("<h1>hello</h1>")
      );
    });

    it("disables redo until something has been undone", async () => {
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["redo"]],
      });

      expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
    });
  });

  it("focuses the editor when the label is clicked, which `for` cannot do", async () => {
    const user = userEvent.setup();
    const { textbox } = await renderEditor({ label: "Bio" });

    await user.click(screen.getByText("Bio"));

    // tiptap's focus command can defer to a frame, so this waits rather than
    // asserting synchronously.
    await waitFor(() => expect(textbox).toHaveFocus());
  });

  it("writes an updated controlled value back into the document", async () => {
    const { rerender, textbox } = await renderEditor({
      label: "Bio",
      value: "<p>first</p>",
      onChange: vi.fn(),
    });

    expect(textbox).toHaveTextContent("first");

    rerender(
      <RichTextEditor label="Bio" value="<p>second</p>" onChange={vi.fn()} />
    );

    expect(await screen.findByText("second")).toBeInTheDocument();
  });

  it.each([undefined, "bio"])(
    "restores rejected controlled edits without a parent rerender (name: %s)",
    async (name) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { textbox, container } = await renderEditor({
        label: "Bio",
        name,
        value: "<p>hello</p>",
        onChange,
        toolbar: [],
      });

      textbox.focus();
      document
        .getSelection()
        ?.collapse(textbox.querySelector("p")?.firstChild ?? null, 5);
      await user.keyboard("!");

      expect(onChange).toHaveBeenCalledExactlyOnceWith("<p>hello!</p>");
      expect(textbox.innerHTML).toBe("<p>hello</p>");
      if (name !== undefined) {
        expect(container.querySelector('input[name="bio"]')).toHaveValue(
          "<p>hello</p>"
        );
      }
    }
  );

  it("keeps the caret in place when controlled edits are accepted", async () => {
    const user = userEvent.setup();
    function ControlledEditor() {
      const [value, setValue] = useState("<p>hello</p>");
      return (
        <RichTextEditor
          label="Bio"
          value={value}
          onChange={setValue}
          toolbar={[]}
        />
      );
    }
    render(<ControlledEditor />);
    const textbox = await screen.findByRole("textbox", { name: "Bio" });

    textbox.focus();
    document
      .getSelection()
      ?.collapse(textbox.querySelector("p")?.firstChild ?? null, 4);
    await user.keyboard("12");

    expect(textbox.innerHTML).toBe("<p>hell12o</p>");
  });

  it("leaves the document alone when the controlled value already matches", async () => {
    const onChange = vi.fn();
    const { rerender } = await renderEditor({
      label: "Bio",
      value: "<p>same</p>",
      onChange,
    });

    rerender(
      <RichTextEditor label="Bio" value="<p>same</p>" onChange={onChange} />
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies a custom className to the outermost element", async () => {
    const { container } = await renderEditor({
      label: "Bio",
      className: "custom",
    });

    expect(container.firstElementChild).toHaveClass("custom");
  });
});
