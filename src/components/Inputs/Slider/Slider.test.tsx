import { fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("renders a slider with an accessible label", () => {
    render(<Slider label="Volume" defaultValue={30} />);

    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("displays the current value in the output", () => {
    const { container } = render(<Slider label="Volume" defaultValue={30} />);

    expect(container.querySelector("output")).toHaveTextContent("30");
  });

  it("reflects minValue and maxValue on the slider input", () => {
    render(
      <Slider label="Volume" defaultValue={30} minValue={10} maxValue={50} />
    );

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "10");
    expect(slider).toHaveAttribute("max", "50");
  });

  it("calls onChange when the value changes", () => {
    const onChange = vi.fn();
    render(<Slider label="Volume" defaultValue={30} onChange={onChange} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "55" } });

    expect(onChange).toHaveBeenCalledWith(55);
    expect(screen.getByRole("slider")).toHaveValue("55");
  });

  it("renders a thumb per value with thumbLabels", () => {
    render(
      <Slider
        label="Range"
        defaultValue={[30, 60]}
        thumbLabels={["start", "end"]}
      />
    );

    expect(screen.getAllByRole("slider")).toHaveLength(2);
    expect(screen.getByRole("slider", { name: /^start/ })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /^end/ })).toBeInTheDocument();
  });

  it("shows both values in the output for a range slider", () => {
    const { container } = render(
      <Slider
        label="Range"
        defaultValue={[30, 60]}
        thumbLabels={["start", "end"]}
      />
    );

    expect(container.querySelector("output")?.textContent).toMatch(
      /30\s*–\s*60/
    );
  });

  it("calls onChange with an array for a range slider", () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Range"
        defaultValue={[30, 60]}
        thumbLabels={["start", "end"]}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByRole("slider", { name: /^start/ }), {
      target: { value: "20" },
    });

    expect(onChange).toHaveBeenCalledWith([20, 60]);
  });

  it("disables the slider when isDisabled", () => {
    render(<Slider label="Volume" defaultValue={30} isDisabled />);

    expect(screen.getByRole("slider")).toBeDisabled();
  });

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      const { container } = render(<Slider label="Volume" defaultValue={30} />);

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it('renders data-field-size="sm" when specified', () => {
      const { container } = render(
        <Slider label="Volume" defaultValue={30} size="sm" />
      );

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it('renders data-field-size="lg" when specified', () => {
      const { container } = render(
        <Slider label="Volume" defaultValue={30} size="lg" />
      );

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "lg"
      );
    });

    it("does not forward size to the DOM input", () => {
      render(<Slider label="Volume" defaultValue={30} size="sm" />);

      expect(screen.getByRole("slider")).not.toHaveAttribute("size");
    });
  });

  describe("thumb identity", () => {
    // A thumb keyed on its value is remounted every time the value changes,
    // which strands the in-flight pointer capture and focus, so a drag or a
    // held arrow key can only ever advance one step.
    it("keeps the same thumb element when the value changes", () => {
      render(<Slider label="Volume" defaultValue={29} />);

      const before = screen.getByRole("slider");
      fireEvent.change(before, { target: { value: "30" } });

      expect(screen.getByRole("slider")).toBe(before);
    });

    it("keeps both thumb elements when a range value changes", () => {
      render(<Slider label="Range" defaultValue={[30, 60]} />);

      const [startBefore, endBefore] = screen.getAllByRole("slider");
      fireEvent.change(startBefore, { target: { value: "31" } });

      const [startAfter, endAfter] = screen.getAllByRole("slider");
      expect(startAfter).toBe(startBefore);
      expect(endAfter).toBe(endBefore);
    });
  });
});
