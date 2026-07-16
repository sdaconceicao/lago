import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders a switch labelled by its children", () => {
    render(<Switch>Wi-Fi</Switch>);

    expect(screen.getByRole("switch", { name: "Wi-Fi" })).toBeInTheDocument();
  });

  it("toggles when clicked and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>Wi-Fi</Switch>);

    const switchEl = screen.getByRole("switch");
    await user.click(switchEl);

    expect(switchEl).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);

    await user.click(switchEl);

    expect(switchEl).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("supports defaultSelected", () => {
    render(<Switch defaultSelected>Wi-Fi</Switch>);

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Switch isSelected onChange={onChange}>
        Wi-Fi
      </Switch>
    );

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeChecked();

    await user.click(switchEl);

    expect(onChange).toHaveBeenCalledWith(false);
    expect(switchEl).toBeChecked();
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Switch>Wi-Fi</Switch>);

    await user.tab();
    await user.keyboard(" ");

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("is disabled when isDisabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Switch isDisabled onChange={onChange}>
        Wi-Fi
      </Switch>
    );

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeDisabled();

    await user.click(switchEl);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the description", () => {
    render(<Switch description="Connect to networks">Wi-Fi</Switch>);

    expect(screen.getByText("Connect to networks")).toBeInTheDocument();
  });
});
