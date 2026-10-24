import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, createRef } from "react";
import { RichTextEditorLinkPopover } from "./RichTextEditorLinkPopover";

type PopoverProps = Omit<
  ComponentProps<typeof RichTextEditorLinkPopover>,
  "triggerRef"
>;

const renderPopover = (overrides: Partial<PopoverProps> = {}) => {
  const triggerRef = createRef<HTMLDivElement>();
  const onParentSubmit = vi.fn();
  const props: PopoverProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    href: "https://example.com",
    onHrefChange: vi.fn(),
    onSubmit: vi.fn(),
    size: "md",
    ...overrides,
  };
  const result = render(
    <form onSubmit={onParentSubmit}>
      <div ref={triggerRef}>Link trigger</div>
      <RichTextEditorLinkPopover {...props} triggerRef={triggerRef} />
    </form>
  );
  return { ...result, props, onParentSubmit };
};

describe("RichTextEditorLinkPopover", () => {
  it("renders no dialog while closed", () => {
    renderPopover({ isOpen: false });

    expect(
      screen.queryByRole("dialog", { name: "Add link" })
    ).not.toBeInTheDocument();
  });

  it("focuses the controlled URL field when opened", async () => {
    renderPopover();

    const input = await screen.findByRole("textbox", { name: "URL" });
    expect(input).toHaveValue("https://example.com");
    expect(input).toHaveAttribute("type", "url");
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("reports the entered URL to its parent", async () => {
    const { props } = renderPopover();
    const input = await screen.findByRole("textbox", { name: "URL" });

    fireEvent.change(input, { target: { value: "https://updated.example" } });

    expect(props.onHrefChange).toHaveBeenCalledWith("https://updated.example");
  });

  it.each(["click", "Enter"])(
    "submits with %s without submitting the surrounding form",
    async (trigger) => {
      const user = userEvent.setup();
      const { props, onParentSubmit } = renderPopover();
      const input = await screen.findByRole("textbox", { name: "URL" });

      if (trigger === "click")
        await user.click(screen.getByRole("button", { name: "Add link" }));
      else {
        await user.click(input);
        await user.keyboard("{Enter}");
      }

      expect(props.onSubmit).toHaveBeenCalledTimes(1);
      expect(onParentSubmit).not.toHaveBeenCalled();
    }
  );

  it("prevents URL edits and submission when disabled", async () => {
    const user = userEvent.setup();
    const { props } = renderPopover({ isDisabled: true });
    const input = await screen.findByRole("textbox", { name: "URL" });
    const submit = screen.getByRole("button", { name: "Add link" });

    expect(input).toBeDisabled();
    expect(submit).toBeDisabled();
    await user.type(input, "changed");
    await user.click(submit);

    expect(props.onHrefChange).not.toHaveBeenCalled();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("requests dismissal when Escape is pressed", async () => {
    const user = userEvent.setup();
    const { props } = renderPopover();
    await user.click(await screen.findByRole("textbox", { name: "URL" }));

    await user.keyboard("{Escape}");

    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
