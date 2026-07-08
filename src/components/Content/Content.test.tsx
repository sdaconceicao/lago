import { render, screen } from "@testing-library/react";
import { Heading, Text } from "./Content";

describe("Heading", () => {
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
});

describe("Text", () => {
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
});
