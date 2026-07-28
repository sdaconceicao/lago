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

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      renderGroup();

      expect(screen.getByRole("group")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it('renders data-field-size="sm" when specified', () => {
      renderGroup({ size: "sm" });

      expect(screen.getByRole("group")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it("does not forward size to the group or its inputs", () => {
      renderGroup({ size: "sm" });

      expect(screen.getByRole("group")).not.toHaveAttribute("size");
      screen.getAllByRole("checkbox").forEach((checkbox) => {
        expect(checkbox).not.toHaveAttribute("size");
      });
    });

    it("keeps its size scope for children that do not set their own", () => {
      const { container } = renderGroup({ size: "sm" });

      const scopes = container.querySelectorAll("[data-field-size]");
      expect(scopes).toHaveLength(1);
      expect(scopes[0]).toBe(screen.getByRole("group"));
      expect(scopes[0]).toHaveAttribute("data-field-size", "sm");
    });

    it("lets a child override the group size", () => {
      const { container } = render(
        <CheckboxGroup label="Sports" size="sm">
          <Checkbox value="soccer">Soccer</Checkbox>
          <Checkbox value="baseball" size="md">
            Baseball
          </Checkbox>
        </CheckboxGroup>
      );

      expect(
        [...container.querySelectorAll("[data-field-size]")].map((el) =>
          el.getAttribute("data-field-size")
        )
      ).toEqual(["sm", "md"]);
    });
  });
});
