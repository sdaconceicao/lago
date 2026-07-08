import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Breadcrumb, Breadcrumbs } from "./Breadcrumbs";

const renderBreadcrumbs = (props = {}) =>
  render(
    <Breadcrumbs aria-label="Navigation" {...props}>
      <Breadcrumb href="/">Home</Breadcrumb>
      <Breadcrumb href="/react-aria/">React Aria</Breadcrumb>
      <Breadcrumb>Breadcrumbs</Breadcrumb>
    </Breadcrumbs>
  );

describe("Breadcrumbs", () => {
  it("renders a list with one item per breadcrumb", () => {
    renderBreadcrumbs();

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders links for each breadcrumb", () => {
    renderBreadcrumbs();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent("Home");
    expect(links[1]).toHaveTextContent("React Aria");
    expect(links[2]).toHaveTextContent("Breadcrumbs");
  });

  it("renders anchors with the given hrefs", () => {
    renderBreadcrumbs();

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "React Aria" })).toHaveAttribute(
      "href",
      "/react-aria/"
    );
  });

  it("marks the last breadcrumb as the current page", () => {
    renderBreadcrumbs();

    const current = screen.getByRole("link", { name: "Breadcrumbs" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("renders separators between items but not after the last item", () => {
    const { container } = renderBreadcrumbs();

    expect(container.querySelectorAll("svg")).toHaveLength(2);

    const lastItem = screen.getAllByRole("listitem")[2];
    expect(lastItem.querySelector("svg")).toBeNull();
  });

  it("supports press interactions on breadcrumb links", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();

    render(
      <Breadcrumbs aria-label="Navigation">
        <Breadcrumb onPress={onPress}>Home</Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>
    );

    await user.click(screen.getByRole("link", { name: "Home" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
