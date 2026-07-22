import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./Accordion";

const renderAccordion = (props = {}) =>
  render(
    <Accordion {...props}>
      <Accordion.Item id="personal">
        <Accordion.Header>Personal Information</Accordion.Header>
        <Accordion.Panel>Personal information form here.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="billing">
        <Accordion.Header>Billing Address</Accordion.Header>
        <Accordion.Panel>Billing address form here.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );

describe("Accordion", () => {
  it("renders all items collapsed by default", () => {
    renderAccordion();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("expands the items listed in defaultExpandedKeys", () => {
    renderAccordion({ defaultExpandedKeys: ["personal"] });

    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Billing Address" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("expands an item when its header is clicked", async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.click(
      screen.getByRole("button", { name: "Personal Information" })
    );

    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Personal information form here.")).toBeVisible();
  });

  it("collapses the open item when another is expanded (single-expand default)", async () => {
    const user = userEvent.setup();
    renderAccordion({ defaultExpandedKeys: ["personal"] });

    await user.click(screen.getByRole("button", { name: "Billing Address" }));

    expect(
      screen.getByRole("button", { name: "Billing Address" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("allows multiple items to be expanded when allowsMultipleExpanded", async () => {
    const user = userEvent.setup();
    renderAccordion({
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
    renderAccordion({ onExpandedChange });

    await user.click(
      screen.getByRole("button", { name: "Personal Information" })
    );

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    const keys = onExpandedChange.mock.calls[0][0];
    expect([...keys]).toEqual(["personal"]);
  });

  it("disables all items when the accordion is disabled", () => {
    renderAccordion({ isDisabled: true });

    screen.getAllByRole("button").forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("applies accordion class names to each piece", () => {
    const { container } = renderAccordion({
      defaultExpandedKeys: ["personal"],
    });

    expect(container.querySelector(".accordion")).toBeInTheDocument();
    expect(container.querySelectorAll(".accordion-item")).toHaveLength(2);
    expect(container.querySelector(".accordion-header")).toBeInTheDocument();
    expect(container.querySelector(".accordion-panel")).toBeInTheDocument();
  });
});
