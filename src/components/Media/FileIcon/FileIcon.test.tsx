import { render, screen } from "@testing-library/react";
import { FileIcon } from "./FileIcon";

describe("FileIcon", () => {
  it("renders an uppercase extension badge from the file name", () => {
    render(<FileIcon fileName="invoice.pdf" />);

    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("omits the badge when the name has no extension", () => {
    const { container } = render(<FileIcon fileName="Makefile" />);

    expect(
      container.querySelector("[data-file-icon-size]")
    ).toBeInTheDocument();
    expect(container.querySelector("span")).toBeNull();
  });

  it('renders data-file-icon-size="md" by default', () => {
    const { container } = render(<FileIcon fileName="notes.txt" />);

    expect(container.firstElementChild).toHaveAttribute(
      "data-file-icon-size",
      "md"
    );
  });

  it("applies the requested size", () => {
    const { container } = render(<FileIcon fileName="clip.mp4" size="lg" />);

    expect(container.firstElementChild).toHaveAttribute(
      "data-file-icon-size",
      "lg"
    );
  });

  it("merges className onto the root", () => {
    const { container } = render(
      <FileIcon fileName="notes.txt" className="custom" />
    );

    expect(container.firstElementChild).toHaveClass("custom");
  });

  it("is hidden from assistive technology by default", () => {
    const { container } = render(<FileIcon fileName="invoice.pdf" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("exposes an accessible name when aria-label is set", () => {
    render(<FileIcon fileName="invoice.pdf" aria-label="PDF document" />);

    expect(
      screen.getByRole("img", { name: "PDF document" })
    ).toBeInTheDocument();
  });
});
