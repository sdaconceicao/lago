import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Radio } from "@/components/Inputs/Radio/RadioItem/Radio";
import { RadioGroup } from "./RadioGroup";

const renderGroup = (props = {}) =>
  render(
    <RadioGroup label="Favorite sport" {...props}>
      <Radio value="soccer">Soccer</Radio>
      <Radio value="baseball">Baseball</Radio>
      <Radio value="basketball">Basketball</Radio>
    </RadioGroup>
  );

describe("RadioGroup", () => {
  it("renders a radiogroup with an accessible label", () => {
    renderGroup();

    expect(
      screen.getByRole("radiogroup", { name: "Favorite sport" })
    ).toBeInTheDocument();
  });

  it("renders all radios", () => {
    renderGroup();

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Baseball" })).toBeInTheDocument();
  });

  it("selects a radio on click and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ onChange });

    await user.click(screen.getByRole("radio", { name: "Baseball" }));

    expect(screen.getByRole("radio", { name: "Baseball" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("baseball");
  });

  it("selects the radio matching defaultValue", () => {
    renderGroup({ defaultValue: "basketball" });

    expect(screen.getByRole("radio", { name: "Basketball" })).toBeChecked();
  });

  it("moves selection with arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ defaultValue: "soccer", onChange });

    await user.tab();
    expect(screen.getByRole("radio", { name: "Soccer" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "Baseball" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("baseball");
  });

  it("disables all radios when isDisabled", () => {
    renderGroup({ isDisabled: true });

    screen.getAllByRole("radio").forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it("associates the description with the group", () => {
    renderGroup({ description: "Choose one sport" });

    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription(
      "Choose one sport"
    );
  });

  it("shows the error message when invalid", () => {
    renderGroup({ isInvalid: true, errorMessage: "Selection required" });

    expect(screen.getByText("Selection required")).toBeInTheDocument();
  });
});
