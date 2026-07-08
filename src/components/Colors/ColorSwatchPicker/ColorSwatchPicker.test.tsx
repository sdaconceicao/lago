import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorSwatchPicker, ColorSwatchPickerItem } from "./ColorSwatchPicker";

const renderPicker = (
  props: {
    defaultValue?: string;
    onChange?: (value: unknown) => void;
  } = {}
) =>
  render(
    <ColorSwatchPicker aria-label="Colors" {...props}>
      <ColorSwatchPickerItem color="#ff0000" />
      <ColorSwatchPickerItem color="#00ff00" />
      <ColorSwatchPickerItem color="#0000ff" />
    </ColorSwatchPicker>
  );

describe("ColorSwatchPicker", () => {
  it("renders a listbox with an option per swatch", () => {
    renderPicker();

    expect(screen.getByRole("listbox", { name: "Colors" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("gives each option an accessible name", () => {
    renderPicker();

    for (const option of screen.getAllByRole("option")) {
      expect(option).toHaveAccessibleName();
    }
  });

  it("renders a color swatch inside each option", () => {
    const { container } = renderPicker();

    expect(container.querySelectorAll(".react-aria-ColorSwatch")).toHaveLength(
      3
    );
  });

  it("marks the option matching defaultValue as selected", () => {
    renderPicker({ defaultValue: "#00ff00" });

    const options = screen.getAllByRole("option");

    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(options[2]).toHaveAttribute("aria-selected", "false");
  });

  it("selects a swatch on click and calls onChange with its color", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPicker({ defaultValue: "#ff0000", onChange });

    const options = screen.getAllByRole("option");
    await user.click(options[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const color = onChange.mock.calls.at(-1)?.[0] as {
      toString: (format: string) => string;
    };
    expect(color.toString("hex")).toBe("#0000FF");
    expect(options[2]).toHaveAttribute("aria-selected", "true");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
  });

  it("supports keyboard navigation between swatches", async () => {
    const user = userEvent.setup();
    renderPicker({ defaultValue: "#ff0000" });

    const options = screen.getAllByRole("option");
    await user.tab();

    expect(options[0]).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(options[1]).toHaveFocus();
  });
});
