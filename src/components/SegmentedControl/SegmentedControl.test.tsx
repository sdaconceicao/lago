import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentedControl, SegmentedControlItem } from "./SegmentedControl";
import utils from "@/styles/utilities.module.css";

const renderControl = (
  props: React.ComponentProps<typeof SegmentedControl> = {}
) =>
  render(
    <SegmentedControl aria-label="View" {...props}>
      <SegmentedControlItem id="day">Day</SegmentedControlItem>
      <SegmentedControlItem id="week">Week</SegmentedControlItem>
      <SegmentedControlItem id="month">Month</SegmentedControlItem>
    </SegmentedControl>
  );

describe("SegmentedControl", () => {
  beforeAll(() => {
    // jsdom does not implement the Web Animations API used by the
    // SelectionIndicator transition.
    Element.prototype.getAnimations ??= () => [];
  });

  it("renders a radiogroup with the segmented control classes", () => {
    renderControl();

    const group = screen.getByRole("radiogroup", { name: "View" });
    expect(group).toHaveClass("segmented-control", utils.buttonBase);
    expect(group).toHaveAttribute("data-variant", "secondary");
  });

  it("renders each item as a radio with its label", () => {
    renderControl();

    const items = screen.getAllByRole("radio");
    expect(items).toHaveLength(3);
    items.forEach((item) => expect(item).toHaveClass("segmented-control-item"));
    expect(screen.getByRole("radio", { name: "Day" })).toBeInTheDocument();
  });

  it("selects an item on click", async () => {
    const user = userEvent.setup();
    renderControl();

    const day = screen.getByRole("radio", { name: "Day" });
    await user.click(day);

    expect(day).toHaveAttribute("aria-checked", "true");
  });

  it("moves the selection when another item is clicked", async () => {
    const user = userEvent.setup();
    renderControl({ defaultSelectedKeys: ["day"] });

    const day = screen.getByRole("radio", { name: "Day" });
    const week = screen.getByRole("radio", { name: "Week" });
    expect(day).toHaveAttribute("aria-checked", "true");

    await user.click(week);

    expect(week).toHaveAttribute("aria-checked", "true");
    expect(day).toHaveAttribute("aria-checked", "false");
  });

  it("calls onSelectionChange with the selected key", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderControl({ onSelectionChange });

    await user.click(screen.getByRole("radio", { name: "Month" }));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["month"]));
  });

  it("renders a selection indicator inside the selected item", async () => {
    renderControl({ defaultSelectedKeys: ["week"] });

    // Flush the SelectionIndicator's animation frame updates.
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    const week = screen.getByRole("radio", { name: "Week" });
    expect(
      week.querySelector(".react-aria-SelectionIndicator")
    ).toBeInTheDocument();
  });

  it("disables all items when the control is disabled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderControl({ isDisabled: true, onSelectionChange });

    const items = screen.getAllByRole("radio");
    items.forEach((item) => expect(item).toBeDisabled());

    await user.click(items[0]);

    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
