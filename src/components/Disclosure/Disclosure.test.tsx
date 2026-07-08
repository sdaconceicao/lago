import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Disclosure, DisclosureHeader, DisclosurePanel } from "./Disclosure";

const renderDisclosure = (props = {}) =>
  render(
    <Disclosure {...props}>
      <DisclosureHeader>Manage your account</DisclosureHeader>
      <DisclosurePanel>Details on managing your account</DisclosurePanel>
    </Disclosure>
  );

describe("Disclosure", () => {
  it("renders a heading with a trigger button", () => {
    renderDisclosure();

    const heading = screen.getByRole("heading");
    const button = screen.getByRole("button", {
      name: "Manage your account",
    });
    expect(heading).toContainElement(button);
  });

  it("is collapsed by default", () => {
    renderDisclosure();

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(
      screen.getByText("Details on managing your account")
    ).not.toBeVisible();
  });

  it("expands when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDisclosure();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Details on managing your account")).toBeVisible();
  });

  it("collapses again when the trigger is clicked twice", async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard toggling with Enter", async () => {
    const user = userEvent.setup();
    renderDisclosure();

    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("supports being expanded by default", () => {
    renderDisclosure({ defaultExpanded: true });

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Details on managing your account")).toBeVisible();
  });

  it("calls onExpandedChange when toggled", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderDisclosure({ onExpandedChange });

    await user.click(screen.getByRole("button"));

    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it("does not expand when disabled", async () => {
    const user = userEvent.setup();
    renderDisclosure({ isDisabled: true });

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
