import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const renderGroup = (
  props: React.ComponentProps<typeof ToggleButtonGroup> = {}
) =>
  render(
    <ToggleButtonGroup aria-label="Alignment" {...props}>
      <ToggleButton id="left">Left</ToggleButton>
      <ToggleButton id="center">Center</ToggleButton>
      <ToggleButton id="right">Right</ToggleButton>
    </ToggleButtonGroup>
  );

describe("ToggleButtonGroup", () => {
  it("renders as a radiogroup of radios in single selection mode", () => {
    renderGroup();

    expect(
      screen.getByRole("radiogroup", { name: "Alignment" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("is horizontal by default and reflects a vertical orientation", () => {
    const { rerender } = renderGroup();

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );

    rerender(
      <ToggleButtonGroup aria-label="Alignment" orientation="vertical">
        <ToggleButton id="left">Left</ToggleButton>
      </ToggleButtonGroup>
    );

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
  });

  it("only allows one selected button in single selection mode", async () => {
    const user = userEvent.setup();
    renderGroup();

    const left = screen.getByRole("radio", { name: "Left" });
    const center = screen.getByRole("radio", { name: "Center" });

    await user.click(left);
    expect(left).toHaveAttribute("aria-checked", "true");

    await user.click(center);
    expect(center).toHaveAttribute("aria-checked", "true");
    expect(left).toHaveAttribute("aria-checked", "false");
  });

  it("calls onSelectionChange with the selected keys", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderGroup({ onSelectionChange });

    await user.click(screen.getByRole("radio", { name: "Center" }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["center"]));
  });

  it("renders pressable buttons that can be selected together in multiple selection mode", async () => {
    const user = userEvent.setup();
    renderGroup({ selectionMode: "multiple" });

    const left = screen.getByRole("button", { name: "Left" });
    const right = screen.getByRole("button", { name: "Right" });

    await user.click(left);
    await user.click(right);

    expect(left).toHaveAttribute("aria-pressed", "true");
    expect(right).toHaveAttribute("aria-pressed", "true");
  });

  it("respects defaultSelectedKeys", () => {
    renderGroup({ defaultSelectedKeys: ["right"] });

    expect(screen.getByRole("radio", { name: "Right" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("radio", { name: "Left" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("supports controlled selectedKeys", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderGroup({ selectedKeys: ["left"], onSelectionChange });

    const left = screen.getByRole("radio", { name: "Left" });
    const center = screen.getByRole("radio", { name: "Center" });
    expect(left).toHaveAttribute("aria-checked", "true");

    await user.click(center);

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["center"]));
    expect(center).toHaveAttribute("aria-checked", "false");
    expect(left).toHaveAttribute("aria-checked", "true");
  });

  it("renders the md size by default", () => {
    renderGroup();

    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "md");
  });

  it.each(["sm", "lg"] as const)(
    "reflects the %s size as a data attribute",
    (size) => {
      renderGroup({ size });

      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", size);
    }
  );

  it("does not forward size as a DOM attribute to its buttons", () => {
    renderGroup({ size: "sm" });

    screen
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).not.toHaveAttribute("size"));
  });

  it("keeps its own size when a child requests a different one", () => {
    render(
      <ToggleButtonGroup aria-label="Alignment" size="sm">
        <ToggleButton id="left" size="lg">
          Left
        </ToggleButton>
      </ToggleButtonGroup>
    );

    // The group's `data-size` is what the stylesheet keys off; its selector
    // outranks the button's own, so the group's size is the one that renders.
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "sm");
  });

  it("disables every button when the group is disabled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderGroup({ isDisabled: true, onSelectionChange });

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => expect(radio).toBeDisabled());

    await user.click(radios[0]);

    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
