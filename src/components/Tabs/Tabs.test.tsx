import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "./Tabs";

// The SelectionIndicator rendered inside each Tab animates between tabs using
// the Web Animations API, which jsdom does not implement.
beforeAll(() => {
  if (!Element.prototype.getAnimations) {
    Element.prototype.getAnimations = () => [];
  }
});

const renderTabs = (props = {}) =>
  render(
    <Tabs {...props}>
      <TabList aria-label="History of Ancient Rome">
        <Tab id="FoR">Founding of Rome</Tab>
        <Tab id="MaR">Monarchy and Republic</Tab>
        <Tab id="Emp">Empire</Tab>
      </TabList>
      <TabPanels>
        <TabPanel id="FoR">Founding content</TabPanel>
        <TabPanel id="MaR">Monarchy content</TabPanel>
        <TabPanel id="Emp">Empire content</TabPanel>
      </TabPanels>
    </Tabs>
  );

describe("Tabs", () => {
  it("renders a tablist with a tab for each item", () => {
    renderTabs();

    expect(
      screen.getByRole("tablist", { name: "History of Ancient Rome" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("selects the first tab and shows its panel by default", () => {
    renderTabs();

    expect(
      screen.getByRole("tab", { name: "Founding of Rome" })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Founding content");
    expect(screen.queryByText("Empire content")).not.toBeInTheDocument();
  });

  it("associates each tab with its panel", () => {
    renderTabs();

    const tab = screen.getByRole("tab", { name: "Founding of Rome" });
    const panel = screen.getByRole("tabpanel");
    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });

  it("switches tabs on click", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: "Empire" }));

    expect(screen.getByRole("tab", { name: "Empire" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(
      screen.getByRole("tab", { name: "Founding of Rome" })
    ).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Empire content");
  });

  it("switches tabs with arrow keys", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: "Founding of Rome" }));
    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("tab", { name: "Monarchy and Republic" })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Monarchy content");
  });

  it("supports a default selected tab", () => {
    renderTabs({ defaultSelectedKey: "MaR" });

    expect(
      screen.getByRole("tab", { name: "Monarchy and Republic" })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Monarchy content");
  });

  it("calls onSelectionChange with the selected key", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTabs({ onSelectionChange });

    await user.click(screen.getByRole("tab", { name: "Empire" }));

    expect(onSelectionChange).toHaveBeenCalledWith("Emp");
  });

  it("does not select disabled tabs", async () => {
    const user = userEvent.setup();
    renderTabs({ disabledKeys: ["Emp"] });

    const disabledTab = screen.getByRole("tab", { name: "Empire" });
    expect(disabledTab).toHaveAttribute("aria-disabled", "true");

    await user.click(disabledTab);

    expect(disabledTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Founding content");
  });
});
