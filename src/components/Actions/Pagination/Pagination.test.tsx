import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a navigation landmark with an accessible label", () => {
    render(<Pagination {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: "Pagination" })
    ).toBeInTheDocument();
  });

  it("supports a custom navigation label", () => {
    render(<Pagination {...defaultProps} aria-label="Results pages" />);
    expect(
      screen.getByRole("navigation", { name: "Results pages" })
    ).toBeInTheDocument();
  });

  it("renders a button for every page and the prev/next controls", () => {
    render(<Pagination {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: "Go to previous page" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to next page" })
    ).toBeInTheDocument();
    for (let pageNumber = 1; pageNumber <= 5; pageNumber++) {
      expect(
        screen.getByRole("button", { name: `Go to page ${pageNumber}` })
      ).toBeInTheDocument();
    }
  });

  it("marks the current page with aria-current", () => {
    render(<Pagination {...defaultProps} page={3} />);

    const current = screen.getByRole("button", { name: "Go to page 3" });
    expect(current).toHaveAttribute("aria-current", "page");

    const other = screen.getByRole("button", { name: "Go to page 2" });
    expect(other).not.toHaveAttribute("aria-current");
  });

  it("calls onPageChange with the selected page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Go to page 4" }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("navigates with the previous and next controls", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination {...defaultProps} page={3} onPageChange={onPageChange} />
    );

    await user.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(onPageChange).toHaveBeenCalledWith(4);

    await user.click(
      screen.getByRole("button", { name: "Go to previous page" })
    );
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables the previous control on the first page", () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(
      screen.getByRole("button", { name: "Go to previous page" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Go to next page" })
    ).toBeEnabled();
  });

  it("disables the next control on the last page", () => {
    render(<Pagination {...defaultProps} page={5} />);
    expect(
      screen.getByRole("button", { name: "Go to next page" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Go to previous page" })
    ).toBeEnabled();
  });

  it("hides the prev/next controls when hidePrevNext is set", () => {
    render(<Pagination {...defaultProps} hidePrevNext />);
    expect(
      screen.queryByRole("button", { name: "Go to previous page" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Go to next page" })
    ).not.toBeInTheDocument();
  });

  it("renders truncation ellipses that are hidden from assistive tech", () => {
    render(<Pagination {...defaultProps} page={5} totalPages={20} />);

    const nav = screen.getByRole("navigation");
    const ellipses = nav.querySelectorAll('li[aria-hidden="true"]');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it("renders nothing when there are no pages", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
