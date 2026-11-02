import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { HStack } from "../HStack/HStack";
import { Stack } from "../Stack/Stack";
import { VStack } from "../VStack/VStack";
import { Wrap } from "../Wrap/Wrap";
import { Flex } from "./Flex";

describe("Flex", () => {
  it("renders children in a div without unnecessary layout attributes", () => {
    render(
      <Flex aria-label="Content" role="group">
        Content
      </Flex>
    );

    const flex = screen.getByRole("group", { name: "Content" });
    expect(flex.tagName).toBe("DIV");
    expect(flex).toHaveTextContent("Content");
    expect(flex).toHaveClass("lago-flex");
    expect(flex.style.length).toBe(0);
    expect(flex).not.toHaveAttribute("data-inline");
  });

  it("passes native semantic attributes and refs to the chosen element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Flex elementType="a" href="/layouts" ref={ref} data-tracking="layout">
        Layouts
      </Flex>
    );

    const link = screen.getByRole("link", { name: "Layouts" });
    expect(link).toHaveAttribute("href", "/layouts");
    expect(link).toHaveAttribute("data-tracking", "layout");
    expect(ref.current).toBe(link);
  });

  it("forwards native events and accessible names", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Flex
        elementType="button"
        type="button"
        aria-label="Save layout"
        onClick={onClick}
      >
        Save
      </Flex>
    );

    await user.click(screen.getByRole("button", { name: "Save layout" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges consumer classes and lets inline styles override layout props", () => {
    render(
      <Flex
        className="custom-layout"
        direction="row"
        gap={2}
        style={{ flexDirection: "column", gap: "2rem", padding: "8px" }}
      >
        Custom layout
      </Flex>
    );

    const flex = screen.getByText("Custom layout");
    expect(flex).toHaveClass("lago-flex", "custom-layout");
    expect(flex.className).not.toBe("custom-layout");
    expect(flex).toHaveStyle({
      flexDirection: "column",
      gap: "2rem",
      padding: "8px",
    });
  });

  it("consumes layout props instead of forwarding them as DOM attributes", () => {
    render(
      <Flex
        direction="column"
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={2}
        rowGap={3}
        columnGap={4}
        inline
      >
        Layout controls
      </Flex>
    );

    const flex = screen.getByText("Layout controls");
    expect(flex).toHaveAttribute("data-inline", "true");
    for (const attribute of [
      "direction",
      "align",
      "justify",
      "wrap",
      "gap",
      "rowGap",
      "columnGap",
      "inline",
    ]) {
      expect(flex).not.toHaveAttribute(attribute);
    }
  });

  it("toggles inline layout without opting into global flex utilities", () => {
    const { rerender } = render(<Flex inline>Inline layout</Flex>);
    const flex = screen.getByText("Inline layout");

    expect(flex).toHaveAttribute("data-inline", "true");
    expect(flex).toHaveClass("lago-flex");
    expect(flex).not.toHaveClass("flex");

    rerender(<Flex inline={false}>Inline layout</Flex>);

    expect(flex).not.toHaveAttribute("data-inline");
    expect(flex).toHaveClass("lago-flex");
  });

  it("does not copy a parent container's responsive values into a nested Flex", () => {
    render(
      <Flex direction={{ md: "column" }} gap={{ lg: 8 }}>
        <Flex gap={2}>Nested content</Flex>
      </Flex>
    );

    const child = screen.getByText("Nested content");
    expect(child.style.getPropertyValue("--flex-gap-base")).toBe(
      "calc(var(--spacing) * 2)"
    );
    expect(child.style.getPropertyValue("--flex-gap-lg")).toBe("");
    expect(child.style.getPropertyValue("--flex-direction-md")).toBe("");
  });

  it("renders semantic, responsive layouts on the server", () => {
    const markup = renderToStaticMarkup(
      <Stack elementType="main" aria-label="Workspace" gap={{ base: 2, md: 4 }}>
        <HStack elementType="nav" aria-label="Sections">
          <Flex elementType="a" href="/overview">
            Overview
          </Flex>
        </HStack>
      </Stack>
    );

    expect(markup).toContain('<main aria-label="Workspace"');
    expect(markup).toContain("--flex-gap-base:calc(var(--spacing) * 2)");
    expect(markup).toContain("--flex-gap-md:calc(var(--spacing) * 4)");
    expect(markup).toContain('<nav aria-label="Sections"');
    expect(markup).toContain('href="/overview"');
    expect(markup).toContain("Overview</a>");
  });

  it("types native attributes and refs for each semantic element", () => {
    const anchorRef = createRef<HTMLAnchorElement>();
    const divRef = createRef<HTMLDivElement>();
    const validElements = [
      <Flex
        key="flex"
        elementType="a"
        href="/layouts"
        ref={anchorRef}
        onClick={(event) => {
          expectTypeOf(event.currentTarget).toEqualTypeOf<
            EventTarget & HTMLAnchorElement
          >();
        }}
      />,
      <Stack key="stack" elementType="form" action="/save" />,
      <HStack key="hstack" elementType="button" type="submit" />,
      <VStack key="vstack" elementType="ol" start={3} />,
      <Wrap key="wrap" elementType="label" htmlFor="layout" />,
    ];
    // @ts-expect-error A default div does not accept anchor attributes.
    const invalidAttribute = <Flex href="/layouts" />;
    // @ts-expect-error An anchor cannot receive a div ref.
    const invalidRef = <Flex elementType="a" ref={divRef} />;

    expect(validElements).toHaveLength(5);
    expect(invalidAttribute.type).toBe(Flex);
    expect(invalidRef.type).toBe(Flex);
  });
});

describe("layout presets", () => {
  it.each([
    [Stack, "lago-stack", "column"],
    [HStack, "lago-hstack", "row"],
    [VStack, "lago-vstack", "column"],
    [Wrap, "lago-wrap", "row"],
  ] as const)(
    "%s supplies its default direction and four spacing units",
    (Component, className, direction) => {
      render(<Component className="consumer">Preset content</Component>);

      const preset = screen.getByText("Preset content");
      expect(preset).toHaveClass("lago-flex", className, "consumer");
      expect(preset.style.getPropertyValue("--flex-direction-base")).toBe(
        direction
      );
      expect(preset.style.getPropertyValue("--flex-gap-base")).toBe(
        "calc(var(--spacing) * 4)"
      );
    }
  );

  it("centers horizontal and wrapping presets, with wrapping enabled only for Wrap", () => {
    render(
      <>
        <HStack>Horizontal</HStack>
        <Wrap>Wrapping</Wrap>
      </>
    );

    const horizontal = screen.getByText("Horizontal");
    const wrapping = screen.getByText("Wrapping");
    expect(horizontal.style.getPropertyValue("--flex-align-base")).toBe(
      "center"
    );
    expect(wrapping.style.getPropertyValue("--flex-align-base")).toBe("center");
    expect(wrapping.style.getPropertyValue("--flex-wrap-base")).toBe("wrap");
    expect(horizontal.style.getPropertyValue("--flex-wrap-base")).not.toBe(
      "wrap"
    );
  });

  it.each([Stack, HStack, VStack, Wrap])(
    "allows scalar and responsive overrides on %s",
    (Component) => {
      render(
        <Component
          direction={{ base: "row-reverse", md: "column" }}
          gap={0}
          align="flex-end"
          wrap="nowrap"
        >
          Overrides
        </Component>
      );

      const preset = screen.getByText("Overrides");
      expect(preset.style.getPropertyValue("--flex-direction-base")).toBe(
        "row-reverse"
      );
      expect(preset.style.getPropertyValue("--flex-direction-md")).toBe(
        "column"
      );
      expect(preset.style.getPropertyValue("--flex-gap-base")).toBe(
        "calc(var(--spacing) * 0)"
      );
      expect(preset.style.getPropertyValue("--flex-align-base")).toBe(
        "flex-end"
      );
      expect(preset.style.getPropertyValue("--flex-wrap-base")).toBe("nowrap");
    }
  );

  it.each([Stack, HStack, VStack, Wrap])(
    "keeps the default spacing on %s when a gap override is invalid",
    (Component) => {
      render(
        <>
          <Component gap={-1}>Invalid scalar</Component>
          <Component gap={{ base: Number.NaN, md: 6 }}>Invalid base</Component>
        </>
      );

      for (const content of ["Invalid scalar", "Invalid base"]) {
        expect(
          screen.getByText(content).style.getPropertyValue("--flex-gap-base")
        ).toBe("calc(var(--spacing) * 4)");
      }
      expect(
        screen.getByText("Invalid base").style.getPropertyValue("--flex-gap-md")
      ).toBe("calc(var(--spacing) * 6)");
    }
  );

  it("retains preset base defaults when responsive overrides begin later", () => {
    render(
      <Stack direction={{ md: "row" }} gap={{ lg: 6 }}>
        <HStack align={{ xl: "stretch" }}>Later overrides</HStack>
      </Stack>
    );

    const horizontal = screen.getByText("Later overrides");
    const stack = horizontal.parentElement as HTMLElement;
    expect(stack.style.getPropertyValue("--flex-direction-base")).toBe(
      "column"
    );
    expect(stack.style.getPropertyValue("--flex-direction-md")).toBe("row");
    expect(stack.style.getPropertyValue("--flex-gap-base")).toBe(
      "calc(var(--spacing) * 4)"
    );
    expect(stack.style.getPropertyValue("--flex-gap-lg")).toBe(
      "calc(var(--spacing) * 6)"
    );
    expect(horizontal.style.getPropertyValue("--flex-align-base")).toBe(
      "center"
    );
    expect(horizontal.style.getPropertyValue("--flex-align-xl")).toBe(
      "stretch"
    );
  });
});
