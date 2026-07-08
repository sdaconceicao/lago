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
});
