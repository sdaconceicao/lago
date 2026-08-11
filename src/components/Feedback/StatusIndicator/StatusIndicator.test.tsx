import { render, screen } from "@testing-library/react";
import {
  assertServerSafeSource,
  readSiblingSource,
} from "@test-utils/assertServerSafeSource";
import { StatusIndicator } from "./StatusIndicator";

describe("StatusIndicator", () => {
  it("carries no client boundary", () => {
    assertServerSafeSource(
      readSiblingSource("StatusIndicator.tsx", import.meta.url)
    );
  });

  it.each([
    ["online", "Online"],
    ["busy", "Busy"],
    ["idle", "Idle"],
    ["offline", "Offline"],
  ] as const)("renders %s and announces it as %s", (status, label) => {
    render(<StatusIndicator status={status} />);

    const indicator = screen.getByRole("img", { name: label });
    expect(indicator).toHaveAttribute("data-status", status);
  });

  it("defaults to the md size", () => {
    render(<StatusIndicator status="online" />);

    expect(screen.getByRole("img")).toHaveAttribute("data-status-size", "md");
  });

  it.each(["sm", "md", "lg"] as const)("renders at the %s size", (size) => {
    render(<StatusIndicator status="online" size={size} />);

    expect(screen.getByRole("img")).toHaveAttribute("data-status-size", size);
  });

  it("uses a custom label when given one", () => {
    render(<StatusIndicator status="idle" label="Away until Monday" />);

    expect(
      screen.getByRole("img", { name: "Away until Monday" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Idle" })).not.toBeInTheDocument();
  });

  it("is decorative when the label is empty", () => {
    const { container } = render(<StatusIndicator status="online" label="" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    const indicator = container.querySelector(".status-indicator");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    expect(indicator).not.toHaveAttribute("aria-label");
  });

  it("merges a custom class name with its own", () => {
    render(<StatusIndicator status="online" className="custom" />);

    expect(screen.getByRole("img")).toHaveClass("status-indicator", "custom");
  });

  it("passes other props through to the root element", () => {
    render(<StatusIndicator status="online" id="presence" title="Presence" />);

    const indicator = screen.getByRole("img");
    expect(indicator).toHaveAttribute("id", "presence");
    expect(indicator).toHaveAttribute("title", "Presence");
  });
});
