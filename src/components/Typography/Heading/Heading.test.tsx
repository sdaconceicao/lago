import { render, screen } from "@testing-library/react";
import {
  assertServerSafeSource,
  readSiblingSource,
} from "@test-utils/assertServerSafeSource";
import { Heading, Text } from "../index";

describe("Heading", () => {
  it("carries no client boundary", () => {
    assertServerSafeSource(
      readSiblingSource("Heading.tsx", import.meta.url)
    );
  });

  it("renders a level 3 heading by default", () => {
    render(<Heading>Section title</Heading>);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Section title");
    expect(heading.tagName).toBe("H3");
  });

  it("renders the heading element for the given level", () => {
    render(<Heading level={1}>Page title</Heading>);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.tagName).toBe("H1");
  });

  it("passes through className and other DOM props", () => {
    render(
      <Heading className="my-heading" data-testid="heading">
        Title
      </Heading>
    );

    expect(screen.getByTestId("heading")).toHaveClass("my-heading");
  });

  it("renders a plain heading with Lago's classes", () => {
    render(<Heading level={2}>Title</Heading>);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveClass("react-aria-Heading");
  });

  it("falls back to h3 rather than emitting an invalid element", () => {
    // react-aria indexes a tag map with the raw level and hands React
    // `undefined` for anything out of range.
    render(<Heading level={9}>Out of range</Heading>);

    expect(screen.getByText("Out of range").tagName).toBe("H3");
  });
});

describe("Text", () => {
  it("carries no client boundary", () => {
    assertServerSafeSource(
      readSiblingSource("../Text/Text.tsx", import.meta.url)
    );
  });

  it("renders its children", () => {
    render(<Text>Some description</Text>);

    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders the slot attribute", () => {
    render(<Text slot="description">Details</Text>);

    expect(screen.getByText("Details")).toHaveAttribute("slot", "description");
  });

  it("passes through className and other DOM props", () => {
    render(
      <Text className="my-text" data-testid="text">
        Content
      </Text>
    );

    expect(screen.getByTestId("text")).toHaveClass("my-text");
  });

  it("honours elementType and drops a null slot", () => {
    const { container } = render(
      <Text elementType="p" slot={null}>
        Body
      </Text>
    );

    const el = screen.getByText("Body");
    expect(el.tagName).toBe("P");
    expect(el).not.toHaveAttribute("slot");
    expect(container.firstElementChild).toHaveClass("react-aria-Text");
  });
});
