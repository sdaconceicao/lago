import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TooltipTriggerComponentProps } from "react-aria-components/Tooltip";
import { Button } from "../Button/Button";
import { Tooltip, type TooltipProps, TooltipTrigger } from "./Tooltip";

const renderTooltip = (
  tooltipProps: Partial<TooltipProps> = {},
  triggerProps: Partial<Omit<TooltipTriggerComponentProps, "children">> = {}
) =>
  render(
    <TooltipTrigger delay={0} closeDelay={0} {...triggerProps}>
      <Button>Save</Button>
      <Tooltip {...tooltipProps}>Save file</Tooltip>
    </TooltipTrigger>
  );

describe("Tooltip", () => {
  it("is hidden by default", () => {
    renderTooltip();

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on keyboard focus", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Save file");
  });

  it("describes the trigger element", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    await screen.findByRole("tooltip");

    expect(
      screen.getByRole("button", { name: "Save" })
    ).toHaveAccessibleDescription("Save file");
  });

  it("hides when focus leaves the trigger", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    await screen.findByRole("tooltip");

    await user.tab();

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on hover and hides on unhover", async () => {
    const user = userEvent.setup();
    renderTooltip();

    // react-aria only opens tooltips on hover when the interaction modality
    // is "pointer"; a pointer move on the document establishes that.
    fireEvent.pointerMove(document.body);

    await user.hover(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await user.unhover(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    );
  });

  it("hides when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    await screen.findByRole("tooltip");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("renders an overlay arrow", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    await screen.findByRole("tooltip");

    expect(document.querySelector(".react-aria-OverlayArrow")).not.toBeNull();
  });

  it("calls onOpenChange as it opens and closes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderTooltip({}, { onOpenChange });

    await user.tab();
    await screen.findByRole("tooltip");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("respects isDisabled on the trigger", async () => {
    const user = userEvent.setup();
    renderTooltip({}, { isDisabled: true });

    await user.tab();

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
