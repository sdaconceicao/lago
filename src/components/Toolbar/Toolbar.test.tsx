import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/Button/Button";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";
import { ToggleButtonGroup } from "@/components/Inputs/Toggle/ToggleButtonGroup/ToggleButtonGroup";
import { Separator } from "@/components/Separator/Separator";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  it("renders a toolbar with an accessible name and its children", () => {
    render(
      <Toolbar aria-label="Text formatting">
        <Button>Copy</Button>
        <Button>Paste</Button>
      </Toolbar>
    );

    expect(
      screen.getByRole("toolbar", { name: "Text formatting" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("is horizontal by default", () => {
    render(
      <Toolbar aria-label="Tools">
        <Button>Copy</Button>
      </Toolbar>
    );

    expect(screen.getByRole("toolbar")).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
  });

  it("reflects a vertical orientation", () => {
    render(
      <Toolbar aria-label="Tools" orientation="vertical">
        <Button>Copy</Button>
      </Toolbar>
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("data-orientation", "vertical");
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders separators perpendicular to a horizontal toolbar", () => {
    render(
      <Toolbar aria-label="Tools">
        <Button>Copy</Button>
        <Separator />
        <Button>Paste</Button>
      </Toolbar>
    );

    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
  });

  it("renders separators perpendicular to a vertical toolbar", () => {
    render(
      <Toolbar aria-label="Tools" orientation="vertical">
        <Button>Copy</Button>
        <Separator />
        <Button>Paste</Button>
      </Toolbar>
    );

    expect(screen.getByRole("separator")).not.toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
  });

  it("passes its orientation to a nested ToggleButtonGroup", () => {
    render(
      <Toolbar aria-label="Tools" orientation="vertical">
        <ToggleButtonGroup aria-label="Style">
          <ToggleButton id="bold">Bold</ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    );

    expect(screen.getByRole("radiogroup", { name: "Style" })).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
  });

  it("moves focus between items with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar aria-label="Tools">
        <Button>Copy</Button>
        <Button>Paste</Button>
      </Toolbar>
    );

    const copy = screen.getByRole("button", { name: "Copy" });
    const paste = screen.getByRole("button", { name: "Paste" });

    await user.tab();
    expect(copy).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(paste).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(copy).toHaveFocus();
  });
});
