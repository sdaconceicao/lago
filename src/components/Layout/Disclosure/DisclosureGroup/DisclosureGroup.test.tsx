import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
} from "@/components/Layout/Disclosure/Disclosure";
import { DisclosureGroup } from "./DisclosureGroup";

const renderGroup = (props = {}) =>
  render(
    <DisclosureGroup {...props}>
      <Disclosure id="personal">
        <DisclosureHeader>Personal Information</DisclosureHeader>
        <DisclosurePanel>Personal information form here.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="billing">
        <DisclosureHeader>Billing Address</DisclosureHeader>
        <DisclosurePanel>Billing address form here.</DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );

describe("DisclosureGroup", () => {
  it("renders all disclosures collapsed by default", () => {
    renderGroup();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("expands the disclosures listed in defaultExpandedKeys", () => {
    renderGroup({ defaultExpandedKeys: ["personal"] });

    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Billing Address" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("expands a disclosure when its trigger is clicked", async () => {
    const user = userEvent.setup();
    renderGroup();

    await user.click(
      screen.getByRole("button", { name: "Personal Information" })
    );

    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Personal information form here.")).toBeVisible();
  });

  it("collapses the open disclosure when another is expanded", async () => {
    const user = userEvent.setup();
    renderGroup({ defaultExpandedKeys: ["personal"] });

    await user.click(screen.getByRole("button", { name: "Billing Address" }));

    expect(
      screen.getByRole("button", { name: "Billing Address" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("allows multiple disclosures to be expanded when allowsMultipleExpanded", async () => {
    const user = userEvent.setup();
    renderGroup({
      allowsMultipleExpanded: true,
      defaultExpandedKeys: ["personal"],
    });

    await user.click(screen.getByRole("button", { name: "Billing Address" }));

    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Billing Address" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onExpandedChange with the expanded keys", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderGroup({ onExpandedChange });

    await user.click(
      screen.getByRole("button", { name: "Personal Information" })
    );

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    const keys = onExpandedChange.mock.calls[0][0];
    expect([...keys]).toEqual(["personal"]);
  });

  it("disables all disclosures when the group is disabled", () => {
    renderGroup({ isDisabled: true });

    screen.getAllByRole("button").forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
