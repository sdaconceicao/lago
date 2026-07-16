import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

const renderGroup = (props = {}) =>
  render(
    <CheckboxGroup label="Sports" {...props}>
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball">Baseball</Checkbox>
      <Checkbox value="basketball">Basketball</Checkbox>
    </CheckboxGroup>
  );

describe("CheckboxGroup", () => {
  it("renders a group with an accessible label", () => {
    renderGroup();

    expect(screen.getByRole("group", { name: "Sports" })).toBeInTheDocument();
  });

  it("renders all checkboxes", () => {
    renderGroup();

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(
      screen.getByRole("checkbox", { name: "Baseball" })
    ).toBeInTheDocument();
  });

  it("calls onChange with the selected values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ onChange });

    await user.click(screen.getByRole("checkbox", { name: "Soccer" }));

    expect(onChange).toHaveBeenCalledWith(["soccer"]);

    await user.click(screen.getByRole("checkbox", { name: "Basketball" }));

    expect(onChange).toHaveBeenLastCalledWith(["soccer", "basketball"]);
  });

  it("checks checkboxes from defaultValue", () => {
    renderGroup({ defaultValue: ["baseball"] });

    expect(screen.getByRole("checkbox", { name: "Baseball" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Soccer" })).not.toBeChecked();
  });

  it("disables all checkboxes when isDisabled", () => {
    renderGroup({ isDisabled: true });

    screen.getAllByRole("checkbox").forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("defaults to vertical orientation", () => {
    renderGroup();

    expect(screen.getByRole("group")).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
  });

  it("supports horizontal orientation", () => {
    renderGroup({ orientation: "horizontal" });

    expect(screen.getByRole("group")).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
  });

  it("associates the description with the group", () => {
    renderGroup({ description: "Pick your favorites" });

    expect(screen.getByRole("group")).toHaveAccessibleDescription(
      "Pick your favorites"
    );
  });

  it("shows the error message when invalid", () => {
    renderGroup({ isInvalid: true, errorMessage: "Pick at least one" });

    expect(screen.getByText("Pick at least one")).toBeInTheDocument();
  });
});
