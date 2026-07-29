import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseColor } from "react-aria-components";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("renders a trigger button with the label and a swatch", () => {
    render(<ColorPicker label="Fill color" defaultValue="#ff0000" />);

    const button = screen.getByRole("button");

    expect(button).toHaveTextContent("Fill color");
    expect(within(button).getByRole("img")).toBeInTheDocument();
  });

  it("reflects the default value in the trigger swatch", () => {
    render(<ColorPicker label="Fill color" defaultValue="#ff0000" />);

    const swatch = within(screen.getByRole("button")).getByRole("img");

    expect(swatch.getAttribute("style") ?? "").toContain("rgb(255, 0, 0)");
  });

  it("opens a popover with default color controls when clicked", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Fill color" defaultValue="#ff0000" />);

    await user.click(screen.getByRole("button"));

    const hexField = await screen.findByRole("textbox", { name: "Hex" });

    expect(hexField).toBeInTheDocument();
    // Two color area channel inputs (one aria-hidden) plus the hue slider
    expect(screen.getAllByRole("slider", { hidden: true })).toHaveLength(3);
  });

  it("shows the current color in the hex field", async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker label="Fill color" defaultValue={parseColor("#0000ff")} />
    );

    await user.click(screen.getByRole("button"));

    const hexField = await screen.findByRole("textbox", { name: "Hex" });

    expect(hexField).toHaveValue("#0000FF");
  });

  it("renders custom children in the popover instead of the defaults", async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker label="Fill color" defaultValue="#ff0000">
        <div data-testid="custom-content">Custom controls</div>
      </ColorPicker>
    );

    await user.click(screen.getByRole("button"));

    expect(await screen.findByTestId("custom-content")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("calls onChange when adjusting the hue slider in the popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        label="Fill color"
        defaultValue={parseColor("#ff0000")}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button"));
    await screen.findByRole("textbox", { name: "Hex" });

    const hueSlider = screen
      .getAllByRole("slider")
      .find((slider) => slider.getAttribute("max") === "360") as HTMLElement;

    expect(hueSlider).toBeDefined();

    fireEvent.keyDown(hueSlider, { key: "ArrowRight" });

    expect(onChange).toHaveBeenCalled();
    const color = onChange.mock.calls.at(-1)?.[0];
    expect(color.getChannelValue("hue")).toBe(1);
  });

  describe("size", () => {
    it("renders at the md size by default", () => {
      const { container } = render(<ColorPicker label="Fill color" />);

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it("renders at the sm size when specified", () => {
      const { container } = render(
        <ColorPicker label="Fill color" size="sm" />
      );

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it("renders at the lg size when specified", () => {
      const { container } = render(
        <ColorPicker label="Fill color" size="lg" />
      );

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "lg"
      );
    });

    it("does not forward size to the DOM", () => {
      render(<ColorPicker label="Fill color" size="sm" />);

      expect(screen.getByRole("button")).not.toHaveAttribute("size");
    });

    it("scopes the portaled popover to the same size", async () => {
      const user = userEvent.setup();
      render(
        <ColorPicker label="Fill color" size="sm">
          <div data-testid="custom-content">Custom controls</div>
        </ColorPicker>
      );

      await user.click(screen.getByRole("button"));
      const content = await screen.findByTestId("custom-content");

      expect(content.closest("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it("forwards the size to the hex field in the popover", async () => {
      const user = userEvent.setup();
      render(<ColorPicker label="Fill color" size="sm" />);

      await user.click(screen.getByRole("button"));
      const hexField = await screen.findByRole("textbox", { name: "Hex" });

      expect(hexField).not.toHaveAttribute("size");
      expect(hexField.closest("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });
  });
});
