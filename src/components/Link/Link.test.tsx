import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link } from "./Link";

describe("Link", () => {
  it("renders an anchor with its href and children", () => {
    render(<Link href="https://example.com">Visit example</Link>);

    const link = screen.getByRole("link", { name: "Visit example" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("applies the default react-aria class name", () => {
    render(<Link href="https://example.com">Visit example</Link>);

    expect(screen.getByRole("link")).toHaveClass("react-aria-Link");
  });

  it("passes through target and rel attributes", () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noreferrer">
        Visit example
      </Link>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders a focusable element with the link role when no href is given", () => {
    render(<Link>JavaScript link</Link>);

    const link = screen.getByRole("link", { name: "JavaScript link" });
    expect(link.tagName).not.toBe("A");
    expect(link).toHaveAttribute("tabindex", "0");
  });

  it("calls onPress when clicked", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Link onPress={onPress}>JavaScript link</Link>);

    await user.click(screen.getByRole("link"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("activates with the keyboard", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Link onPress={onPress}>JavaScript link</Link>);

    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is not interactive when disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Link isDisabled onPress={onPress}>
        JavaScript link
      </Link>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "true");

    await user.click(link);

    expect(onPress).not.toHaveBeenCalled();
  });
});
