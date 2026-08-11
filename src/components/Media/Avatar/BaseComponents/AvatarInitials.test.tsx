import {
  assertServerSafeSource,
  readSiblingSource,
} from "@test-utils/assertServerSafeSource";
import { render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { AvatarInitials } from "./AvatarInitials";

describe("AvatarInitials", () => {
  it("carries no client boundary", () => {
    assertServerSafeSource(
      readSiblingSource("AvatarInitials.tsx", import.meta.url)
    );
  });

  it("renders the initials for a name", () => {
    render(<AvatarInitials name="Ada Lovelace" />);

    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders a single initial when the name is a username", () => {
    render(<AvatarInitials name="alovelace" />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("is announced with the name rather than the initials", () => {
    render(<AvatarInitials name="Ada Lovelace" />);

    expect(
      screen.getByRole("img", { name: "Ada Lovelace" })
    ).toBeInTheDocument();
    expect(screen.getByText("AL")).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to the md size and a circle", () => {
    render(<AvatarInitials name="Ada Lovelace" />);

    const initials = screen.getByRole("img");
    expect(initials).toHaveAttribute("data-avatar-size", "md");
    expect(initials).toHaveAttribute("data-shape", "circle");
  });

  it("renders the requested size", () => {
    render(<AvatarInitials name="Ada Lovelace" size="lg" />);

    expect(screen.getByRole("img")).toHaveAttribute("data-avatar-size", "lg");
  });

  it("renders the requested shape", () => {
    render(<AvatarInitials name="Ada Lovelace" shape="square" />);

    expect(screen.getByRole("img")).toHaveAttribute("data-shape", "square");
  });

  it("sets a colour derived from the name", () => {
    render(<AvatarInitials name="Ada Lovelace" />);

    expect(
      screen.getByRole("img").style.getPropertyValue("--avatar-color")
    ).toMatch(/^var\(--[a-z]+\)$/);
  });

  it("gives the same name the same colour across renders", () => {
    const getColor = (name: string) => {
      const { unmount } = render(<AvatarInitials name={name} />);
      const color = screen
        .getByRole("img")
        .style.getPropertyValue("--avatar-color");
      unmount();
      return color;
    };

    expect(getColor("Ada Lovelace")).toBe(getColor("Ada Lovelace"));
  });

  it("lets a caller override the colour through style", () => {
    render(
      <AvatarInitials
        name="Ada Lovelace"
        style={{ "--avatar-color": "var(--pink)" } as CSSProperties}
      />
    );

    expect(
      screen.getByRole("img").style.getPropertyValue("--avatar-color")
    ).toBe("var(--pink)");
  });

  it("merges a custom class name with its own", () => {
    render(<AvatarInitials name="Ada Lovelace" className="custom" />);

    expect(screen.getByRole("img")).toHaveClass("avatar-initials", "custom");
  });

  it("passes other props through to the root element", () => {
    render(<AvatarInitials name="Ada Lovelace" id="author" title="Author" />);

    const initials = screen.getByRole("img");
    expect(initials).toHaveAttribute("id", "author");
    expect(initials).toHaveAttribute("title", "Author");
  });

  it("renders no letters for a blank name", () => {
    render(<AvatarInitials name="  " />);

    expect(screen.getByRole("img").textContent).toBe("");
  });
});
