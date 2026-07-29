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

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      renderGroup();

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it('renders data-field-size="sm" when specified', () => {
      renderGroup({ size: "sm" });

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it('renders data-field-size="lg" when specified', () => {
      renderGroup({ size: "lg" });

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "data-field-size",
        "lg"
      );
    });

    it("does not forward size to the group or its inputs", () => {
      renderGroup({ size: "sm" });

      expect(screen.getByRole("radiogroup")).not.toHaveAttribute("size");
      screen.getAllByRole("radio").forEach((radio) => {
        expect(radio).not.toHaveAttribute("size");
      });
    });

    // An item only stamps `data-field-size` when it was given one, so the
    // group's scope is the single source of truth for plain children. Were an
    // item to emit its own default, that declaration would beat the inherited
    // one and silently reset every child to md.
    it.each(["sm", "md", "lg"] as const)(
      "keeps its %s scope for children that do not set their own",
      (size) => {
        const { container } = renderGroup({ size });

        const scopes = container.querySelectorAll("[data-field-size]");
        expect(scopes).toHaveLength(1);
        expect(scopes[0]).toBe(screen.getByRole("radiogroup"));
        expect(scopes[0]).toHaveAttribute("data-field-size", size);
      }
    );

    it.each(["md", "lg"] as const)(
      "lets a child override the group size with %s",
      (size) => {
        const { container } = render(
          <RadioGroup label="Favorite sport" size="sm">
            <Radio value="soccer">Soccer</Radio>
            <Radio value="baseball" size={size}>
              Baseball
            </Radio>
          </RadioGroup>
        );

        expect(
          [...container.querySelectorAll("[data-field-size]")].map((el) =>
            el.getAttribute("data-field-size")
          )
        ).toEqual(["sm", size]);
      }
    );
  });
});
