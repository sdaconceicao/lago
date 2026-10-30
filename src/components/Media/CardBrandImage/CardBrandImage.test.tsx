import { fireEvent, render, screen } from "@testing-library/react";
import { CardBrandImage } from "./CardBrandImage";

const CDN_URL =
  "https://cdn.jsdelivr.net/gh/iamgutz/react-payment-logos@d90ff73460cad65ab68289d51b795545c63f7f04/src/svg/flat/";

describe("CardBrandImage", () => {
  it.each([
    "visa",
    "mastercard",
    "amex",
    "discover",
    "diners",
    "jcb",
    "unionpay",
    "maestro",
  ] as const)("loads the pinned SVG for %s", (brand) => {
    render(<CardBrandImage brand={brand} />);

    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      `${CDN_URL}${brand}.svg`
    );
  });

  it("supports self-hosted assets without a trailing slash", () => {
    render(<CardBrandImage brand="mastercard" cdnUrl="/assets/cards" />);

    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      "/assets/cards/mastercard.svg"
    );
  });

  it("uses a decorative image with stable dimensions", () => {
    const { container } = render(<CardBrandImage brand="visa" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
    const image = screen.getByAltText("");
    expect(image).toHaveAttribute("aria-hidden", "true");
    expect(image).toHaveAttribute("width", "780");
    expect(image).toHaveAttribute("height", "500");
    expect(image).toHaveAttribute("decoding", "async");
  });

  it("names the wrapper when alternative text is supplied", () => {
    const { container } = render(<CardBrandImage brand="visa" alt="Visa" />);

    const logo = screen.getByRole("img", { name: "Visa" });
    expect(logo).toBe(container.firstElementChild);
    expect(logo.tagName.toLowerCase()).toBe("span");
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByAltText("")).toHaveAttribute("aria-hidden", "true");
  });

  it("treats an explicitly empty alternative text as decorative", () => {
    const { container } = render(<CardBrandImage brand="visa" alt="" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("forwards wrapper classes, styles, attributes, and events", () => {
    const onClick = vi.fn();
    render(
      <CardBrandImage
        brand="visa"
        alt="Visa"
        id="selected-card-brand"
        className="custom-brand"
        style={{ width: 78, opacity: 0.5 }}
        data-payment-method="primary"
        onClick={onClick}
      />
    );

    const logo = screen.getByRole("img", { name: "Visa" });
    expect(logo).toHaveAttribute("id", "selected-card-brand");
    expect(logo).toHaveAttribute("data-payment-method", "primary");
    expect(logo).toHaveClass("custom-brand");
    expect(logo).toHaveStyle({ width: "78px", opacity: "0.5" });
    fireEvent.click(logo);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a local generic card when no brand is known", () => {
    const { container } = render(
      <CardBrandImage brand={null} alt="Payment card" />
    );

    expect(screen.getByRole("img", { name: "Payment card" })).toBe(
      container.firstElementChild
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("keeps its accessible name when the image fails to load", () => {
    const { container } = render(<CardBrandImage brand="visa" alt="Visa" />);

    fireEvent.error(screen.getByAltText(""));

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(screen.getByRole("img", { name: "Visa" })).toBeInTheDocument();
  });

  it("keeps the fallback for the same failed source on subsequent renders", () => {
    const { container, rerender } = render(
      <CardBrandImage brand="visa" alt="Visa" />
    );
    fireEvent.error(screen.getByAltText(""));

    rerender(<CardBrandImage brand="visa" alt="Visa debit" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Visa debit" })).toBeInTheDocument();
  });

  it("loads a new brand after the previous image fails", () => {
    const { container, rerender } = render(<CardBrandImage brand="visa" />);
    fireEvent.error(screen.getByAltText(""));

    rerender(<CardBrandImage brand="amex" />);

    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      `${CDN_URL}amex.svg`
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("loads a new CDN source after the previous image fails", () => {
    const { container, rerender } = render(<CardBrandImage brand="visa" />);
    fireEvent.error(screen.getByAltText(""));

    rerender(<CardBrandImage brand="visa" cdnUrl="/assets/cards/" />);

    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      "/assets/cards/visa.svg"
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders a fresh image when its brand changes", () => {
    const { rerender } = render(<CardBrandImage brand="visa" />);
    const visaImage = screen.getByAltText("");

    rerender(<CardBrandImage brand="mastercard" />);

    expect(screen.getByAltText("")).not.toBe(visaImage);
    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      `${CDN_URL}mastercard.svg`
    );
  });
});
