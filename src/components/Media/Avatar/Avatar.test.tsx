import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

const SRC = "https://example.com/ada.jpg";

describe("Avatar", () => {
  it("renders the image when a src is given", () => {
    render(<Avatar src={SRC} name="Ada Lovelace" />);

    const image = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(image).toHaveAttribute("src", SRC);
  });

  it("names the image with alt in preference to name", () => {
    render(<Avatar src={SRC} name="Ada Lovelace" alt="Portrait of Ada" />);

    expect(screen.getByAltText("Portrait of Ada")).toBeInTheDocument();
  });

  it("leaves the image unlabelled when there is no alt or name", () => {
    const { container } = render(<Avatar src={SRC} />);

    expect(container.querySelector(".avatar-image")).toHaveAttribute("alt", "");
  });

  it("hides the image from assistive technology when alt is empty", () => {
    const { container } = render(
      <Avatar src={SRC} name="Ada Lovelace" alt="" />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector(".avatar-image")).toBeInTheDocument();
  });

  it("falls back to initials when no src is given", () => {
    render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveClass(
      "avatar-initials"
    );
  });

  it("falls back to initials when the image fails to load", () => {
    const { container } = render(<Avatar src={SRC} name="Ada Lovelace" />);

    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));

    expect(container.querySelector(".avatar-image")).not.toBeInTheDocument();
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("retries the image when the src changes after a failure", () => {
    const { container, rerender } = render(
      <Avatar src={SRC} name="Ada Lovelace" />
    );

    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));
    rerender(
      <Avatar src="https://example.com/ada-2.jpg" name="Ada Lovelace" />
    );

    expect(container.querySelector(".avatar-image")).toHaveAttribute(
      "src",
      "https://example.com/ada-2.jpg"
    );
  });

  it("falls back to a placeholder icon when there is no src or name", () => {
    const { container } = render(<Avatar />);

    expect(container.querySelector(".avatar-placeholder")).toBeInTheDocument();
    expect(container.querySelector(".avatar-initials")).not.toBeInTheDocument();
  });

  it("treats a blank name as no name", () => {
    const { container } = render(<Avatar name="   " />);

    expect(container.querySelector(".avatar-placeholder")).toBeInTheDocument();
  });

  it("defaults to the md size and a circle", () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);

    const avatar = container.querySelector(".avatar");
    expect(avatar).toHaveAttribute("data-avatar-size", "md");
    expect(avatar).toHaveAttribute("data-shape", "circle");
  });

  it.each(["sm", "md", "lg"] as const)("renders at the %s size", (size) => {
    const { container } = render(<Avatar name="Ada Lovelace" size={size} />);

    expect(container.querySelector(".avatar")).toHaveAttribute(
      "data-avatar-size",
      size
    );
  });

  it("renders as a rounded square when asked", () => {
    const { container } = render(<Avatar name="Ada Lovelace" shape="square" />);

    expect(container.querySelector(".avatar")).toHaveAttribute(
      "data-shape",
      "square"
    );
  });

  it("passes its size and shape down to the initials", () => {
    render(<Avatar name="Ada Lovelace" size="lg" shape="square" />);

    const initials = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(initials).toHaveAttribute("data-avatar-size", "lg");
    expect(initials).toHaveAttribute("data-shape", "square");
  });

  it("renders no indicator by default", () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);

    expect(
      container.querySelector(".status-indicator")
    ).not.toBeInTheDocument();
  });

  it.each([
    ["online", "Online"],
    ["busy", "Busy"],
    ["idle", "Idle"],
    ["offline", "Offline"],
  ] as const)("labels the %s indicator as %s", (status, label) => {
    render(<Avatar name="Ada Lovelace" status={status} />);

    const indicator = screen.getByRole("img", { name: label });
    expect(indicator).toHaveAttribute("data-status", status);
  });

  it("sizes the indicator with the avatar", () => {
    const { container } = render(
      <Avatar name="Ada Lovelace" status="online" size="lg" />
    );

    expect(container.querySelector(".status-indicator")).toHaveAttribute(
      "data-status-size",
      "lg"
    );
  });

  it("uses a custom status label when given one", () => {
    render(
      <Avatar
        name="Ada Lovelace"
        status="idle"
        statusLabel="Away until Monday"
      />
    );

    expect(
      screen.getByRole("img", { name: "Away until Monday" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Idle" })).not.toBeInTheDocument();
  });

  it("hides the indicator from assistive technology when the label is empty", () => {
    const { container } = render(
      <Avatar name="Ada Lovelace" status="online" statusLabel="" />
    );

    expect(
      screen.queryByRole("img", { name: "Online" })
    ).not.toBeInTheDocument();
    expect(container.querySelector(".status-indicator")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("shows the indicator alongside an image", () => {
    render(<Avatar src={SRC} name="Ada Lovelace" status="online" />);

    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveClass(
      "avatar-image"
    );
    expect(screen.getByRole("img", { name: "Online" })).toBeInTheDocument();
  });

  it("merges a custom class name with its own", () => {
    const { container } = render(
      <Avatar name="Ada Lovelace" className="custom" />
    );

    expect(container.querySelector(".avatar")).toHaveClass("avatar", "custom");
  });

  it("passes other props through to the root element", () => {
    const { container } = render(
      <Avatar name="Ada Lovelace" id="author" data-testid="avatar" />
    );

    const avatar = container.querySelector(".avatar");
    expect(avatar).toHaveAttribute("id", "author");
    expect(avatar).toHaveAttribute("data-testid", "avatar");
  });

  it("exposes AvatarInitials as a static member", () => {
    render(<Avatar.Initials name="Grace Hopper" />);

    expect(screen.getByText("GH")).toBeInTheDocument();
  });
});
